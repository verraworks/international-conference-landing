import { randomUUID } from "node:crypto";
import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, registrationsTable } from "@workspace/db";

const router: IRouter = Router();
const sidecarEndpoint = "http://127.0.0.1:1106";

const uploadInput = z.object({
  name: z.string().trim().min(1).max(255),
  size: z.number().int().positive().max(15 * 1024 * 1024),
  contentType: z.enum([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]),
  registrationCode: z.string().trim().min(6).max(24),
});

async function signObjectUrl(
  bucketName: string,
  objectName: string,
  method: "GET" | "PUT",
) {
  const response = await fetch(`${sidecarEndpoint}/object-storage/signed-object-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bucket_name: bucketName,
      object_name: objectName,
      method,
      expires_at: new Date(Date.now() + (method === "PUT" ? 15 : 2) * 60 * 1000).toISOString(),
    }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`Unable to sign object URL: ${response.status}`);
  const data = (await response.json()) as { signed_url?: string };
  if (!data.signed_url) throw new Error("Signed URL was not returned.");
  return data.signed_url;
}

function privateObjectParts() {
  const raw = process.env.PRIVATE_OBJECT_DIR || "";
  const [bucketName, ...prefix] = raw.replace(/^\/+/, "").split("/");
  if (!bucketName) throw new Error("PRIVATE_OBJECT_DIR is not configured.");
  return { bucketName, prefix: prefix.join("/") };
}

router.post("/storage/uploads/request-url", async (req, res) => {
  const parsed = uploadInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Unsupported file or missing upload details." });
    return;
  }
  const [registration] = await db
    .select({ registrationCode: registrationsTable.registrationCode })
    .from(registrationsTable)
    .where(eq(registrationsTable.registrationCode, parsed.data.registrationCode.toUpperCase()))
    .limit(1);
  if (!registration) {
    res.status(404).json({ error: "Registration code not found." });
    return;
  }

  try {
    const { bucketName, prefix } = privateObjectParts();
    const objectName = `${prefix}/uploads/${randomUUID()}`.replace(/^\/+/, "");
    const uploadURL = await signObjectUrl(bucketName, objectName, "PUT");
    res.json({
      uploadURL,
      objectPath: `/objects/${objectName.replace(`${prefix}/`, "")}`,
      metadata: {
        name: parsed.data.name,
        size: parsed.data.size,
        contentType: parsed.data.contentType,
      },
    });
  } catch (error) {
    req.log.error({ err: error }, "Error generating upload URL");
    res.status(500).json({ error: "Failed to prepare file upload." });
  }
});

router.get("/storage/objects/*path", async (req, res) => {
  try {
    const { bucketName, prefix } = privateObjectParts();
    const rawPath = Array.isArray(req.params.path) ? req.params.path.join("/") : req.params.path;
    const objectName = `${prefix}/${rawPath}`.replace(/^\/+/, "");
    const objectURL = await signObjectUrl(bucketName, objectName, "GET");
    const response = await fetch(objectURL);
    if (!response.ok) {
      res.status(response.status).json({ error: "Uploaded file not found." });
      return;
    }
    res.setHeader("Content-Type", response.headers.get("content-type") || "application/octet-stream");
    const bytes = Buffer.from(await response.arrayBuffer());
    res.send(bytes);
  } catch (error) {
    req.log.error({ err: error }, "Error serving uploaded object");
    res.status(500).json({ error: "Failed to serve uploaded file." });
  }
});

export default router;
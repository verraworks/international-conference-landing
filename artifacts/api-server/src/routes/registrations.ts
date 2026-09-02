import { randomBytes } from "node:crypto";
import { Router, type IRouter, type Request, type Response } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import {
  db,
  registrationsTable,
  submissionsTable,
} from "@workspace/db";

const router: IRouter = Router();

const registrationInput = z.object({
  fullName: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(320),
  institution: z.string().trim().min(2).max(240),
  country: z.string().trim().min(2).max(120),
  role: z.string().trim().min(2).max(120),
  participationType: z.enum(["onsite", "online", "hybrid"]),
  registrationType: z.string().trim().min(2).max(64),
});

const statusInput = z.object({
  status: z.enum(["pending", "under_review", "accepted", "waitlisted", "rejected"]),
  paymentStatus: z.enum(["unpaid", "pending", "paid", "refunded"]).optional(),
  paymentReference: z.string().trim().max(120).nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});

const submissionInput = z.object({
  registrationCode: z.string().trim().min(6).max(24),
  fullName: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(320),
  title: z.string().trim().min(5).max(320),
  submissionType: z.enum(["abstract", "full-paper"]),
  abstractText: z.string().trim().min(80).max(15000),
  keywords: z.string().trim().max(500).optional(),
  fileName: z.string().trim().max(255).optional(),
  filePath: z.string().trim().max(500).optional(),
});

function createRegistrationCode() {
  return `BUICH-${randomBytes(4).toString("hex").toUpperCase()}`;
}

function adminGuard(req: Request, res: Response, next: () => void) {
  const configuredKey = process.env.ADMIN_DASHBOARD_KEY;
  const suppliedKey = req.header("x-admin-key");
  if (process.env.NODE_ENV !== "production" && !configuredKey) {
    next();
    return;
  }
  if (configuredKey && suppliedKey === configuredKey) {
    next();
    return;
  }
  res.status(401).json({ error: "Admin authentication is required." });
}

router.post("/registrations", async (req, res) => {
  const parsed = registrationInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please complete all registration fields." });
    return;
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await db
    .select({ registrationCode: registrationsTable.registrationCode })
    .from(registrationsTable)
    .where(eq(registrationsTable.email, email))
    .limit(1);
  if (existing[0]) {
    res.status(409).json({
      error: "This email already has a registration.",
      registrationCode: existing[0].registrationCode,
    });
    return;
  }

  const [registration] = await db
    .insert(registrationsTable)
    .values({
      ...parsed.data,
      email,
      registrationCode: createRegistrationCode(),
    })
    .returning();

  res.status(201).json({
    message: "Registration received.",
    registration,
  });
});

router.get("/registrations/status", async (req, res) => {
  const email = z.string().email().safeParse(req.query.email);
  const code = z.string().min(6).safeParse(req.query.code);
  if (!email.success || !code.success) {
    res.status(400).json({ error: "A valid email and registration code are required." });
    return;
  }

  const [registration] = await db
    .select()
    .from(registrationsTable)
    .where(
      and(
        eq(registrationsTable.email, email.data.toLowerCase()),
        eq(registrationsTable.registrationCode, code.data.toUpperCase()),
      ),
    )
    .limit(1);
  if (!registration) {
    res.status(404).json({ error: "Registration not found." });
    return;
  }

  const submissions = await db
    .select({
      id: submissionsTable.id,
      title: submissionsTable.title,
      submissionType: submissionsTable.submissionType,
      status: submissionsTable.status,
      createdAt: submissionsTable.createdAt,
    })
    .from(submissionsTable)
    .where(eq(submissionsTable.registrationCode, registration.registrationCode))
    .orderBy(desc(submissionsTable.createdAt));

  res.json({ registration, submissions });
});

router.post("/submissions", async (req, res) => {
  const parsed = submissionInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please provide the required submission details." });
    return;
  }

  const [registration] = await db
    .select({ registrationCode: registrationsTable.registrationCode })
    .from(registrationsTable)
    .where(
      and(
        eq(registrationsTable.registrationCode, parsed.data.registrationCode.toUpperCase()),
        eq(registrationsTable.email, parsed.data.email.toLowerCase()),
      ),
    )
    .limit(1);
  if (!registration) {
    res.status(404).json({ error: "Registration code and email do not match." });
    return;
  }

  const [submission] = await db
    .insert(submissionsTable)
    .values({
      ...parsed.data,
      registrationCode: parsed.data.registrationCode.toUpperCase(),
      email: parsed.data.email.toLowerCase(),
      keywords: parsed.data.keywords || null,
      fileName: parsed.data.fileName || null,
      filePath: parsed.data.filePath || null,
    })
    .returning();

  res.status(201).json({ message: "Submission received.", submission });
});

router.get("/admin/registrations", adminGuard, async (req, res) => {
  const status = z
    .enum(["pending", "under_review", "accepted", "waitlisted", "rejected"])
    .nullable()
    .catch(null)
    .parse(req.query.status || null);
  const rows = await db
    .select()
    .from(registrationsTable)
    .where(status ? eq(registrationsTable.status, status) : undefined)
    .orderBy(desc(registrationsTable.createdAt));
  res.json({ registrations: rows });
});

router.get("/admin/stats", adminGuard, async (_req, res) => {
  const [total] = await db
    .select({ count: sql<number>`count(*)` })
    .from(registrationsTable);
  const [pending] = await db
    .select({ count: sql<number>`count(*)` })
    .from(registrationsTable)
    .where(eq(registrationsTable.status, "pending"));
  const [accepted] = await db
    .select({ count: sql<number>`count(*)` })
    .from(registrationsTable)
    .where(eq(registrationsTable.status, "accepted"));
  const [paid] = await db
    .select({ count: sql<number>`count(*)` })
    .from(registrationsTable)
    .where(eq(registrationsTable.paymentStatus, "paid"));
  const [submissions] = await db
    .select({ count: sql<number>`count(*)` })
    .from(submissionsTable);
  res.json({
    total: Number(total?.count || 0),
    pending: Number(pending?.count || 0),
    accepted: Number(accepted?.count || 0),
    paid: Number(paid?.count || 0),
    submissions: Number(submissions?.count || 0),
  });
});

router.patch("/admin/registrations/:id/status", adminGuard, async (req, res) => {
  const parsed = statusInput.safeParse(req.body);
  const id = z.string().uuid().safeParse(req.params.id);
  if (!parsed.success || !id.success) {
    res.status(400).json({ error: "Invalid registration update." });
    return;
  }

  const [registration] = await db
    .update(registrationsTable)
    .set({
      status: parsed.data.status,
      ...(parsed.data.paymentStatus ? { paymentStatus: parsed.data.paymentStatus } : {}),
      ...(parsed.data.paymentReference !== undefined
        ? { paymentReference: parsed.data.paymentReference }
        : {}),
      ...(parsed.data.notes !== undefined ? { notes: parsed.data.notes } : {}),
      updatedAt: new Date(),
    })
    .where(eq(registrationsTable.id, id.data))
    .returning();
  if (!registration) {
    res.status(404).json({ error: "Registration not found." });
    return;
  }
  res.json({ registration });
});

router.get("/admin/submissions", adminGuard, async (_req, res) => {
  const submissions = await db
    .select()
    .from(submissionsTable)
    .orderBy(desc(submissionsTable.createdAt));
  res.json({ submissions });
});

router.patch("/admin/submissions/:id/status", adminGuard, async (req, res) => {
  const id = z.string().uuid().safeParse(req.params.id);
  const status = z.enum(["received", "under_review", "accepted", "revision", "rejected"]).safeParse(req.body.status);
  if (!id.success || !status.success) {
    res.status(400).json({ error: "Invalid submission update." });
    return;
  }
  const [submission] = await db
    .update(submissionsTable)
    .set({ status: status.data, updatedAt: new Date() })
    .where(eq(submissionsTable.id, id.data))
    .returning();
  if (!submission) {
    res.status(404).json({ error: "Submission not found." });
    return;
  }
  res.json({ submission });
});

export default router;
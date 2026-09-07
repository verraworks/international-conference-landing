import { randomBytes } from "node:crypto";
import { Router, type IRouter, type Request, type Response } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import {
  db,
  registrationsTable,
  submissionsTable,
  coAuthorsTable,
} from "@workspace/db";
import { requireAdmin, requireAuth, type AuthUser } from "./auth";

const router: IRouter = Router();

const registrationInput = z.object({
  fullName: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().min(8).max(40),
  institution: z.string().trim().min(2).max(240),
  country: z.string().trim().min(2).max(120).default("Indonesia"),
  role: z.string().trim().max(120).optional(),
  participantOrigin: z.string().trim(), // Internal Participant / External Participant
  npmNidn: z.string().trim().min(2).max(50),
  studyProgram: z.string().trim().min(2).max(160),
  userStatus: z.string().trim(), // STUDENT / LECTURER/STAFF
  attendanceStatus: z.string().trim(), // ONLINE / OFFLINE
  registrationType: z.string().trim(), // Participant Only / Oral Presenter / Proceedings Publication
  feeAmount: z.number().optional(),
  currency: z.string().optional(),
  consent: z.union([z.literal(true), z.boolean()]),
  participationType: z.string(),
});

const statusInput = z.object({
  status: z.enum(["pending", "under_review", "accepted", "waitlisted", "rejected"]),
  paymentStatus: z.enum(["unpaid", "pending", "paid", "refunded"]).optional(),
  paymentReference: z.string().trim().max(120).nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});

const paymentProofInput = z.object({
  paymentReference: z.string().trim().min(3).max(120),
  paymentProofName: z.string().trim().min(1).max(255),
  paymentProofPath: z.string().trim().min(1).max(500),
});

const submissionInput = z.object({
  registrationCode: z.string().trim().min(6).max(24),
  fullName: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(320),
  title: z.string().trim().min(5).max(320),
  submissionType: z.enum(["abstract", "full-paper"]),
  scope: z.string().trim().min(2).max(120),
  abstractText: z.string().trim().min(80).max(15000),
  keywords: z.string().trim().max(500).optional(),
  fileName: z.string().trim().max(255).optional(),
  filePath: z.string().trim().max(500).optional(),
  coAuthors: z.array(z.object({
    fullName: z.string().trim().min(2).max(160),
    email: z.string().trim().email().max(320),
    affiliation: z.string().trim().min(2).max(240),
    country: z.string().trim().min(2).max(120),
  })).optional(),
  copyrightAgreed: z.union([z.literal(true), z.boolean()]),
  ethicsAgreed: z.union([z.literal(true), z.boolean()]),
});

function createRegistrationCode() {
  return `BUICH-${randomBytes(4).toString("hex").toUpperCase()}`;
}

router.post("/registrations", requireAuth, async (req, res) => {
  const parsed = registrationInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please complete all registration fields." });
    return;
  }

  const email = parsed.data.email.toLowerCase();
  const { consent: _consent, ...registrationData } = parsed.data;
  const user = (req as Request & { user: AuthUser }).user;
  if (user.role !== "admin" && user.email !== email) {
    res.status(403).json({ error: "Your registration email must match your signed-in account." });
    return;
  }
  const existingByEmail = await db
    .select({ registrationCode: registrationsTable.registrationCode })
    .from(registrationsTable)
    .where(eq(registrationsTable.email, email))
    .limit(1);
  if (existingByEmail[0]) {
    res.status(409).json({
      error: "This email already has a registration.",
      registrationCode: existingByEmail[0].registrationCode,
    });
    return;
  }
  const existingByUser = await db
    .select({ registrationCode: registrationsTable.registrationCode })
    .from(registrationsTable)
    .where(eq(registrationsTable.userId, user.id))
    .limit(1);
  if (existingByUser[0]) {
    res.status(409).json({
      error: "User already has a registration.",
      registrationCode: existingByUser[0].registrationCode,
    });
    return;
  }

  const roleMap: Record<string, string> = {
    "STUDENT": "Student",
    "LECTURER/STAFF": "Lecturer/Staff",
    "Student": "Student",
    "Lecturer": "Lecturer",
    "Staff": "Staff",
  };
  const role = roleMap[parsed.data.userStatus] || parsed.data.userStatus || "Participant";

  const [registration] = await db
    .insert(registrationsTable)
    .values({
      ...registrationData,
      role: role,
      email,
      userId: user.id,
      registrationCode: createRegistrationCode(),
    })
    .returning();

  res.status(201).json({
    message: "Registration received.",
    registration,
  });
});

router.post("/registrations/payment-proof", requireAuth, async (req, res) => {
  const parsed = paymentProofInput.safeParse(req.body);
  const user = (req as Request & { user: AuthUser }).user;
  if (!parsed.success) { res.status(400).json({ error: "Payment reference and proof are required." }); return; }
  const [registration] = await db.update(registrationsTable).set({
    paymentReference: parsed.data.paymentReference,
    paymentProofName: parsed.data.paymentProofName,
    paymentProofPath: parsed.data.paymentProofPath,
    paymentUploadedAt: new Date(),
    paymentStatus: "pending",
    updatedAt: new Date(),
  }).where(and(eq(registrationsTable.email, user.email), eq(registrationsTable.userId, user.id))).returning();
  if (!registration) { res.status(404).json({ error: "Complete your BUICH registration before uploading payment proof." }); return; }
  res.json({ message: "Payment proof submitted and awaiting verification.", registration });
});

router.get("/registrations/me", requireAuth, async (req, res) => {
  const user = (req as Request & { user: AuthUser }).user;
  const [registration] = await db.select().from(registrationsTable).where(eq(registrationsTable.userId, user.id)).limit(1);
  res.json({ registration: registration || null });
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
    res.status(400).json({ error: "Data submission tidak lengkap." });
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
    res.status(404).json({ error: "Kode registrasi dan email tidak cocok." });
    return;
  }

  const { coAuthors, ...subData } = parsed.data;

  const [submission] = await db
    .insert(submissionsTable)
    .values({
      ...subData,
      registrationCode: parsed.data.registrationCode.toUpperCase(),
      email: parsed.data.email.toLowerCase(),
      keywords: parsed.data.keywords || null,
      fileName: parsed.data.fileName || null,
      filePath: parsed.data.filePath || null,
      status: "submitted",
      submittedAt: new Date(),
    })
    .returning();

  if (coAuthors && coAuthors.length > 0) {
    for (let i = 0; i < coAuthors.length; i++) {
      await db.insert(coAuthorsTable).values({
        submissionId: submission.id,
        fullName: coAuthors[i].fullName,
        email: coAuthors[i].email,
        affiliation: coAuthors[i].affiliation,
        country: coAuthors[i].country,
        order: i + 1,
      });
    }
  }

  res.status(201).json({ message: "Submission berhasil dikirim.", submission });
});

router.get("/submissions/mine", requireAuth, async (req, res) => {
  const user = (req as Request & { user: AuthUser }).user;
  const submissions = await db
    .select()
    .from(submissionsTable)
    .where(eq(submissionsTable.email, user.email))
    .orderBy(desc(submissionsTable.createdAt));
  res.json({ submissions });
});

router.get("/admin/registrations", requireAdmin, async (req, res) => {
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

router.get("/admin/stats", requireAdmin, async (_req, res) => {
  const [total] = await db.select({ count: sql<number>`count(*)` }).from(registrationsTable);
  const [pending] = await db.select({ count: sql<number>`count(*)` }).from(registrationsTable).where(eq(registrationsTable.status, "pending"));
  const [accepted] = await db.select({ count: sql<number>`count(*)` }).from(registrationsTable).where(eq(registrationsTable.status, "accepted"));
  const [paid] = await db.select({ count: sql<number>`count(*)` }).from(registrationsTable).where(eq(registrationsTable.paymentStatus, "paid"));
  const [submissions] = await db.select({ count: sql<number>`count(*)` }).from(submissionsTable);
  const [revenue] = await db.select({ total: sql<number>`coalesce(sum(fee_amount), 0)` }).from(registrationsTable).where(eq(registrationsTable.paymentStatus, "paid"));
  res.json({
    total: Number(total?.count || 0),
    pending: Number(pending?.count || 0),
    accepted: Number(accepted?.count || 0),
    paid: Number(paid?.count || 0),
    submissions: Number(submissions?.count || 0),
    revenue: Number(revenue?.total || 0),
  });
});

router.patch("/admin/registrations/:id/status", requireAdmin, async (req, res) => {
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
      ...(parsed.data.paymentStatus === "paid" ? { paymentVerifiedAt: new Date(), paymentVerifiedBy: (req as Request & { user: AuthUser }).user.id } : {}),
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

router.get("/admin/submissions", requireAdmin, async (_req, res) => {
  const submissions = await db
    .select()
    .from(submissionsTable)
    .orderBy(desc(submissionsTable.createdAt));
  res.json({ submissions });
});

router.patch("/admin/submissions/:id/status", requireAdmin, async (req, res) => {
  const id = z.string().uuid().safeParse(req.params.id);
  const status = z.enum(["submitted", "received", "under_review", "revision", "published", "accepted", "rejected"]).safeParse(req.body.status);
  if (!id.success || !status.success) {
    res.status(400).json({ error: "Status update tidak valid." });
    return;
  }
  const [submission] = await db
    .update(submissionsTable)
    .set({
      status: status.data,
      ...(req.body.reviewerNotes ? { reviewerNotes: req.body.reviewerNotes } : {}),
      updatedAt: new Date(),
    })
    .where(eq(submissionsTable.id, id.data))
    .returning();
  if (!submission) {
    res.status(404).json({ error: "Submission tidak ditemukan." });
    return;
  }
  res.json({ submission });
});

export default router;

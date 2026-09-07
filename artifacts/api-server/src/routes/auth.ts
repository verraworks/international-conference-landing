import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, usersTable } from "@workspace/db";

const router: IRouter = Router();
const scrypt = promisify(scryptCallback);
const authInput = z.object({
  fullName: z.string().trim().min(2).max(160).optional(),
  email: z.string().trim().email().max(320),
  password: z.string().min(10).max(128),
});

export type AuthUser = { id: string; email: string; fullName: string; role: string };

function sessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret && process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET must be configured.");
  return secret || "development-only-change-this-secret";
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${hash.toString("hex")}`;
}

async function verifyPassword(password: string, stored: string) {
  const [salt, expected] = stored.split(":");
  if (!salt || !expected) return false;
  const calculated = (await scrypt(password, salt, 64)) as Buffer;
  const expectedBuffer = Buffer.from(expected, "hex");
  return expectedBuffer.length === calculated.length && timingSafeEqual(expectedBuffer, calculated);
}

function createToken(user: AuthUser) {
  const payload = Buffer.from(JSON.stringify({ ...user, exp: Date.now() + 1000 * 60 * 60 * 24 * 7 })).toString("base64url");
  const signature = createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function getAuthenticatedUser(req: Request): AuthUser | null {
  const token = req.header("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString()) as AuthUser & { exp: number };
    if (!parsed.id || !parsed.email || !parsed.fullName || parsed.exp < Date.now()) return null;
    return { id: parsed.id, email: parsed.email, fullName: parsed.fullName, role: parsed.role };
  } catch { return null; }
}

export function requireAuth(req: Request, res: Response, next: () => void) {
  const user = getAuthenticatedUser(req);
  if (!user) { res.status(401).json({ error: "Please sign in to continue." }); return; }
  (req as Request & { user?: AuthUser }).user = user;
  next();
}

export function requireAdmin(req: Request, res: Response, next: () => void) {
  requireAuth(req, res, () => {
    if ((req as Request & { user?: AuthUser }).user?.role !== "admin") { res.status(403).json({ error: "Admin access is required." }); return; }
    next();
  });
}

/** Creates or upgrades the designated admin only from Replit Secrets, never from source control. */
export async function bootstrapConfiguredAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const fullName = process.env.ADMIN_NAME?.trim() || "BUICH Administrator";
  if (!email || !password) return false;
  if (password.length < 10) throw new Error("ADMIN_PASSWORD must be at least 10 characters.");
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!existing) {
    await db.insert(usersTable).values({ fullName, email, passwordHash: await hashPassword(password), role: "admin" });
  } else if (existing.role !== "admin") {
    await db.update(usersTable).set({ role: "admin", updatedAt: new Date() }).where(eq(usersTable.id, existing.id));
  }
  return true;
}

function publicUser(user: AuthUser & { passwordHash?: string }) {
  return { id: user.id, email: user.email, fullName: user.fullName, role: user.role };
}

router.post("/auth/register", async (req, res) => {
  const parsed = authInput.safeParse(req.body);
  if (!parsed.success || !parsed.data.fullName) { res.status(400).json({ error: "Name, a valid email, and a password of at least 10 characters are required." }); return; }
  const email = parsed.data.email.toLowerCase();
  const [existing] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing) { res.status(409).json({ error: "An account with this email already exists." }); return; }
  const [user] = await db.insert(usersTable).values({ fullName: parsed.data.fullName, email, passwordHash: await hashPassword(parsed.data.password) }).returning();
  const safeUser = publicUser(user);
  res.status(201).json({ user: safeUser, token: createToken(safeUser) });
});

router.post("/auth/login", async (req, res) => {
  const parsed = authInput.pick({ email: true, password: true }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Enter a valid email and password." }); return; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, parsed.data.email.toLowerCase())).limit(1);
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) { res.status(401).json({ error: "Email or password is incorrect." }); return; }
  const safeUser = publicUser(user);
  res.json({ user: safeUser, token: createToken(safeUser) });
});

router.get("/auth/me", requireAuth, (req, res) => res.json({ user: (req as Request & { user: AuthUser }).user }));

export default router;

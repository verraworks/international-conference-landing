import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const registrationsTable = pgTable(
  "buich_registrations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").unique(),
    registrationCode: varchar("registration_code", { length: 24 })
      .notNull()
      .unique(),
    fullName: varchar("full_name", { length: 160 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    phone: varchar("phone", { length: 40 }).notNull(),
    institution: varchar("institution", { length: 240 }).notNull(),
    country: varchar("country", { length: 120 }).notNull(),
    role: varchar("role", { length: 120 }).notNull(),
    address: text("address"),
    emergencyContact: varchar("emergency_contact", { length: 160 }),
    emergencyPhone: varchar("emergency_phone", { length: 40 }),
    dietaryRequirements: varchar("dietary_requirements", { length: 500 }),
    participationType: varchar("participation_type", { length: 24 }).notNull(),
    registrationType: varchar("registration_type", { length: 64 }).notNull(),
    participantOrigin: varchar("participant_origin", { length: 64 }), // Internal/External
    npmNidn: varchar("npm_nidn", { length: 50 }),
    studyProgram: varchar("study_program", { length: 160 }),
    userStatus: varchar("user_status", { length: 64 }), // Student/Lecturer/Staff
    attendanceStatus: varchar("attendance_status", { length: 24 }), // Online/Offline
    feeAmount: integer("fee_amount"),
    currency: varchar("currency", { length: 10 }).default("IDR"),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    paymentStatus: varchar("payment_status", { length: 32 })
      .notNull()
      .default("unpaid"),
    paymentReference: varchar("payment_reference", { length: 120 }),
    paymentProofName: varchar("payment_proof_name", { length: 255 }),
    paymentProofPath: varchar("payment_proof_path", { length: 500 }),
    paymentUploadedAt: timestamp("payment_uploaded_at", { withTimezone: true }),
    paymentVerifiedAt: timestamp("payment_verified_at", { withTimezone: true }),
    paymentVerifiedBy: uuid("payment_verified_by"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    emailIdx: index("buich_registrations_email_idx").on(table.email),
    statusIdx: index("buich_registrations_status_idx").on(table.status),
  }),
);

export const usersTable = pgTable(
  "buich_users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fullName: varchar("full_name", { length: 160 }).notNull(),
    email: varchar("email", { length: 320 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    role: varchar("role", { length: 24 }).notNull().default("participant"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userEmailIdx: index("buich_users_email_idx").on(table.email),
  }),
);

export const submissionsTable = pgTable(
  "buich_submissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    registrationCode: varchar("registration_code", { length: 24 }).notNull(),
    fullName: varchar("full_name", { length: 160 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    title: varchar("title", { length: 320 }).notNull(),
    submissionType: varchar("submission_type", { length: 24 }).notNull(),
    abstractText: text("abstract_text").notNull(),
    keywords: varchar("keywords", { length: 500 }),
    scope: varchar("scope", { length: 120 }),
    userId: uuid("user_id"),
    fileName: varchar("file_name", { length: 255 }),
    filePath: varchar("file_path", { length: 500 }),
    copyrightAgreed: boolean("copyright_agreed").default(false),
    ethicsAgreed: boolean("ethics_agreed").default(false),
    status: varchar("status", { length: 32 }).notNull().default("draft"),
    reviewerNotes: text("reviewer_notes"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    registrationIdx: index("buich_submissions_registration_idx").on(
      table.registrationCode,
    ),
    submissionStatusIdx: index("buich_submissions_status_idx").on(table.status),
  }),
);

export const coAuthorsTable = pgTable(
  "buich_co_authors",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    submissionId: uuid("submission_id")
      .notNull()
      .references(() => submissionsTable.id, { onDelete: "cascade" }),
    fullName: varchar("full_name", { length: 160 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    affiliation: varchar("affiliation", { length: 240 }).notNull(),
    country: varchar("country", { length: 120 }).notNull(),
    order: integer("order").notNull().default(0),
  },
  (table) => ({
    submissionIdx: index("buich_co_authors_submission_idx").on(
      table.submissionId,
    ),
  }),
);

export type Registration = typeof registrationsTable.$inferSelect;
export type Submission = typeof submissionsTable.$inferSelect;
export type User = typeof usersTable.$inferSelect;
export type CoAuthor = typeof coAuthorsTable.$inferSelect;

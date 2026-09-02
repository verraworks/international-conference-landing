import {
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
    registrationCode: varchar("registration_code", { length: 24 })
      .notNull()
      .unique(),
    fullName: varchar("full_name", { length: 160 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    institution: varchar("institution", { length: 240 }).notNull(),
    country: varchar("country", { length: 120 }).notNull(),
    role: varchar("role", { length: 120 }).notNull(),
    participationType: varchar("participation_type", { length: 24 }).notNull(),
    registrationType: varchar("registration_type", { length: 64 }).notNull(),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    paymentStatus: varchar("payment_status", { length: 32 })
      .notNull()
      .default("unpaid"),
    paymentReference: varchar("payment_reference", { length: 120 }),
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
    fileName: varchar("file_name", { length: 255 }),
    filePath: varchar("file_path", { length: 500 }),
    status: varchar("status", { length: 32 }).notNull().default("received"),
    reviewerNotes: text("reviewer_notes"),
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

export type Registration = typeof registrationsTable.$inferSelect;
export type Submission = typeof submissionsTable.$inferSelect;
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const crmUsersTable = pgTable("crm_users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("crm"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCrmUserSchema = createInsertSchema(crmUsersTable).omit({ id: true, createdAt: true });
export type InsertCrmUser = z.infer<typeof insertCrmUserSchema>;
export type CrmUser = typeof crmUsersTable.$inferSelect;

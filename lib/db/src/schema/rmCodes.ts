import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const rmCodesTable = pgTable("rm_codes", {
  id: serial("id").primaryKey(),
  rmCode: text("rm_code").notNull().unique(),
  salesPersonName: text("sales_person_name").notNull(),
  status: text("status").notNull().default("Active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertRmCodeSchema = createInsertSchema(rmCodesTable).omit({ id: true, createdAt: true });
export type InsertRmCode = z.infer<typeof insertRmCodeSchema>;
export type RmCode = typeof rmCodesTable.$inferSelect;

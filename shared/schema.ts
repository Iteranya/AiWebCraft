import { pgTable, text, serial, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema for authentication (if needed later)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// API settings schema
export const apiSettings = pgTable("api_settings", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // This could be a session ID or actual user ID
  endpoint: text("endpoint").notNull(),
  apiKey: text("api_key").notNull(),
  model: text("model").notNull(),
});

// Projects schema to save user projects
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  htmlContent: text("html_content").notNull(),
  cssContent: text("css_content"),
  jsContent: text("js_content"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertApiSettingsSchema = createInsertSchema(apiSettings).pick({
  userId: true,
  endpoint: true,
  apiKey: true,
  model: true,
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  userId: true,
  name: true,
  htmlContent: true,
  cssContent: true,
  jsContent: true,
  createdAt: true,
  updatedAt: true,
});

// Define types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertApiSettings = z.infer<typeof insertApiSettingsSchema>;
export type ApiSettings = typeof apiSettings.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// API schemas for validation
export const aiRequestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  endpoint: z.string().url("Invalid endpoint URL"),
  apiKey: z.string().min(1, "API key is required"),
  model: z.string().min(1, "Model is required"),
});

export type AIRequest = z.infer<typeof aiRequestSchema>;

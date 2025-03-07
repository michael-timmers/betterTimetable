// This file is crucial for formatting the prisma schema

import { mysqlTable, mysqlSchema, varchar, boolean, text, int, timestamp, primaryKey } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

// Users Table
export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  username: varchar("username", { length: 255 }).unique(),
  passwordHash: text("passwordHash"),
  title: varchar("title", { length: 50 }),
  firstName: varchar("firstName", { length: 255 }),
  lastName: varchar("lastName", { length: 255 }),
  email: varchar("email", { length: 255 }),
  admin: boolean("admin").default(false),
});

// Password Resets Table
export const userPwdResets = mysqlTable("user_pwd_resets", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("userId", { length: 36 }).notNull(),
  code: varchar("code", { length: 255 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
});

// Sessions Table
export const sessions = mysqlTable("sessions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("userId", { length: 36 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
});

// Units Table
export const units = mysqlTable("units", {
  unitCode: varchar("unitCode", { length: 10 }).primaryKey(),
  unitName: varchar("unitName", { length: 255 }).notNull(),
});

// Courses Table
export const courses = mysqlTable("courses", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  unitCode: varchar("unitCode", { length: 10 }).notNull(),
  classType: varchar("classType", { length: 255 }).notNull(),
  activity: varchar("activity", { length: 50 }).notNull(),
  day: varchar("day", { length: 10 }).notNull(),
  time: varchar("time", { length: 50 }).notNull(),
  room: varchar("room", { length: 50 }).notNull(),
  teachingStaff: varchar("teachingStaff", { length: 255 }).notNull(),
});
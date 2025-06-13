import {
  pgTableCreator,
  text,
  timestamp,
  uuid,
  integer,
  primaryKey,
  pgEnum,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";

export const createTable = pgTableCreator((name) => `gasak_${name}`);

export const roleEnum = pgEnum("role", ["admin", "leader", "member"]);
export const statusEnum = pgEnum("status", ["TODO", "IN_PROGRESS", "DONE"]);

export const users = createTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  role: roleEnum("role").notNull().default("member"),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const accounts = createTable(
  "account",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ],
);

export const sessions = createTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = createTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
);

// Kanban Board table
export const kanbanBoards = createTable("kanban_board", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

// Kanban Columns table
export const kanbanColumns = createTable("kanban_column", {
  id: text("id").primaryKey(), // Using text for compatibility with existing frontend
  title: text("title").notNull(),
  color: text("color").default("#6b7280"), // Default to gray color
  boardId: uuid("boardId")
    .notNull()
    .references(() => kanbanBoards.id, { onDelete: "cascade" }),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

// Kanban Tasks table
export const kanbanTasks = createTable("kanban_task", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull(), // Using text instead of enum for flexibility
  columnId: text("columnId")
    .notNull()
    .references(() => kanbanColumns.id, { onDelete: "cascade" }),
  boardId: uuid("boardId")
    .notNull()
    .references(() => kanbanBoards.id, { onDelete: "cascade" }),
  createdById: uuid("createdById")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  assignedToId: uuid("assignedToId").references(() => users.id, {
    onDelete: "set null",
  }),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // Keep for backward compatibility
  order: integer("order").notNull().default(0),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

import {pgTable, text, timestamp, uuid, jsonb, serial, boolean, numeric, integer} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").unique(),
  passwordHash: text("password_hash"),
  registrationType: text("registration_type").notNull(), // 'webauthn' or 'password'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  completedRegistration: boolean("completed_registration").default(false).notNull(),
  // pfpLocation: text("pfp_location"),
});

export const webauthnCredentials = pgTable("webauthn_credentials", {
  id: text("id").primaryKey(), // credential ID from WebAuthn
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  publicKey: text("public_key").notNull(),
  counter: text("counter").notNull(),
  transports: jsonb("transports"), // ['internal', 'hybrid', etc.]
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bankAccounts = pgTable("bank_accounts", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  accountNumber: text("account_number"),
  initialBalance: numeric("initial_balance", { precision: 19, scale: 2, mode: "number" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  defaultCurrency: text("default_currency")
    .notNull()
    .references(() => currencies.id)
})

export const currencies = pgTable("currencies", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
})

export const merchants = pgTable("merchants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  pfpLocation: text("pfp_location"),
  color: text("color"),
  // TODO default labels
})

export const userMerchants = pgTable("user_merchants", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  merchantId: integer("merchant_id")
    .notNull()
    .references(() => merchants.id, { onDelete: "cascade" }),
  name: text("name"),
  pfpLocation: text("pfp_location"),
  color: text("color"),
})

export const labels = pgTable("labels", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: text("color").notNull(),
})

import {pgTable, text, timestamp, uuid, jsonb, serial, boolean, numeric} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").unique().notNull(),
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
    .references(() => currency.id)
})

export const currency = pgTable("currency", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
})

export const userMerchant = pgTable("user_merchant", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  merchantId: uuid("merchant_id")
    .notNull()
    .references(() => merchant.id, { onDelete: "cascade" }),
  name: text("name"),
  pfpLocation: text("pfp_location"),
  color: text("color"),
})

export const merchant = pgTable("merchant", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  pfpLocation: text("pfp_location"),
  color: text("color"),
  // TODO default labels
})

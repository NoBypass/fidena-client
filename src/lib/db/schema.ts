import {pgTable, text, timestamp, uuid, jsonb, serial, boolean, numeric, integer} from "drizzle-orm/pg-core";
import {relations, sql} from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").unique(),
  passwordHash: text("password_hash"),
  registrationType: text("registration_type").notNull(), // 'webauthn' or 'password'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  completedRegistration: boolean("completed_registration").default(false).notNull(),
  // TODO pfpLocation: text("pfp_location"),
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
})

export const merchantRelations = relations(merchants, ({ many }) => ({
  userMerchants: many(userMerchants),
}));

export const userMerchants = pgTable("user_merchants", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity({ startWith: 1000000 }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  merchantId: integer("merchant_id")
    .references(() => merchants.id, { onDelete: "cascade" }),
  name: text("name"),
  pfpLocation: text("pfp_location"),
  color: text("color"),
})

export const userMerchantsRelations = relations(userMerchants, ({ many, one }) => ({
  defaultLabels: many(userMerchantDefaultLabels),
  underlyingMerchant: one(merchants, {
    fields: [userMerchants.merchantId],
    references: [merchants.id],
  }),
}));

export const userMerchantDefaultLabels = pgTable("user_merchant_default_labels", {
  userMerchantId: integer("user_merchant_id")
    .notNull()
    .references(() => merchants.id, { onDelete: "cascade" }),
  labelId: integer("label_id")
    .notNull()
    .references(() => labels.id, { onDelete: "cascade" }),
}, (table) => ({
  pk: {
    name: "merchant_default_labels_pkey",
    columns: [table.userMerchantId, table.labelId],
  },
}))

export const userMerchantDefaultLabelsRelations = relations(userMerchantDefaultLabels, ({ one }) => ({
  userMerchant: one(userMerchants, {
    fields: [userMerchantDefaultLabels.userMerchantId],
    references: [userMerchants.id],
  }),
  label: one(labels, {
    fields: [userMerchantDefaultLabels.labelId],
    references: [labels.id],
  }),
}));

export const labels = pgTable("labels", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: text("color").notNull(),
})

export const labelsRelations = relations(labels, ({ many }) => ({
  merchantDefaults: many(userMerchantDefaultLabels),
  transactions: many(transactionLabels),
}));

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  merchantId: integer("merchant_id")
    .references(() => userMerchants.id, { onDelete: "set null" }),
  amount: numeric("amount", { precision: 19, scale: 2, mode: "number" }).notNull(),
  currency: text("currency")
    .notNull()
    .references(() => currencies.id),
  bankAccountId: integer("bank_account_id")
    .references(() => bankAccounts.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  description: text("description"),
  doneAt: timestamp("done_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // TODO groups (also auto group transactions between own bank accounts)
  // TODO attachments
})

export const transactionLabels = pgTable("transaction_labels", {
  transactionId: integer("transaction_id")
    .notNull()
    .references(() => transactions.id, { onDelete: "cascade" }),
  labelId: integer("label_id")
    .notNull()
    .references(() => labels.id, { onDelete: "cascade" }),
}, (table) => ({
  pk: {
    name: "transaction_labels_pkey",
    columns: [table.transactionId, table.labelId],
  }
}))

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  user: one(users),
  merchant: one(userMerchants),
  label: many(labels),
  bankAccount: one(bankAccounts),
  currency: one(currencies),
}));

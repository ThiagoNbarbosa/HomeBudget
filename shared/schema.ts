import { sql, relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  integer,
  pgEnum,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - mandatory for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Household table for couples
export const households = pgTable("households", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User household relationships
export const userHouseholds = pgTable("user_households", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  householdId: varchar("household_id").notNull().references(() => households.id),
  role: varchar("role").notNull().default("member"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Transaction types
export const transactionTypeEnum = pgEnum("transaction_type", ["income", "expense"]);
export const incomeSubtypeEnum = pgEnum("income_subtype", ["contra_cheque", "fgts", "descontos", "extra"]);

// Categories
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  icon: varchar("icon").notNull(),
  color: varchar("color").notNull(),
  type: transactionTypeEnum("type").notNull(),
  householdId: varchar("household_id").notNull().references(() => households.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Transactions
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: transactionTypeEnum("type").notNull(),
  incomeSubtype: incomeSubtypeEnum("income_subtype"),
  categoryId: varchar("category_id").notNull().references(() => categories.id),
  householdId: varchar("household_id").notNull().references(() => households.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: timestamp("date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Budget goals
export const budgetGoals = pgTable("budget_goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").notNull().references(() => categories.id),
  householdId: varchar("household_id").notNull().references(() => households.id),
  monthlyLimit: decimal("monthly_limit", { precision: 10, scale: 2 }).notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Shopping list priority
export const priorityEnum = pgEnum("priority", ["low", "medium", "high"]);

// Shopping list items
export const shoppingItems = pgTable("shopping_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  estimatedPriceMin: decimal("estimated_price_min", { precision: 10, scale: 2 }),
  estimatedPriceMax: decimal("estimated_price_max", { precision: 10, scale: 2 }),
  priority: priorityEnum("priority").notNull().default("medium"),
  url: text("url"),
  purchased: boolean("purchased").notNull().default(false),
  purchasedPrice: decimal("purchased_price", { precision: 10, scale: 2 }),
  purchasedDate: timestamp("purchased_date"),
  householdId: varchar("household_id").notNull().references(() => households.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  userHouseholds: many(userHouseholds),
  transactions: many(transactions),
  shoppingItems: many(shoppingItems),
}));

export const householdsRelations = relations(households, ({ many }) => ({
  userHouseholds: many(userHouseholds),
  categories: many(categories),
  transactions: many(transactions),
  budgetGoals: many(budgetGoals),
  shoppingItems: many(shoppingItems),
}));

export const userHouseholdsRelations = relations(userHouseholds, ({ one }) => ({
  user: one(users, {
    fields: [userHouseholds.userId],
    references: [users.id],
  }),
  household: one(households, {
    fields: [userHouseholds.householdId],
    references: [households.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  household: one(households, {
    fields: [categories.householdId],
    references: [households.id],
  }),
  transactions: many(transactions),
  budgetGoals: many(budgetGoals),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
  household: one(households, {
    fields: [transactions.householdId],
    references: [households.id],
  }),
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

export const budgetGoalsRelations = relations(budgetGoals, ({ one }) => ({
  category: one(categories, {
    fields: [budgetGoals.categoryId],
    references: [categories.id],
  }),
  household: one(households, {
    fields: [budgetGoals.householdId],
    references: [households.id],
  }),
}));

export const shoppingItemsRelations = relations(shoppingItems, ({ one }) => ({
  household: one(households, {
    fields: [shoppingItems.householdId],
    references: [households.id],
  }),
  user: one(users, {
    fields: [shoppingItems.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertHouseholdSchema = createInsertSchema(households).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserHouseholdSchema = createInsertSchema(userHouseholds).omit({
  id: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertBudgetGoalSchema = createInsertSchema(budgetGoals).omit({
  id: true,
  createdAt: true,
});

export const insertShoppingItemSchema = createInsertSchema(shoppingItems).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Household = typeof households.$inferSelect;
export type InsertHousehold = z.infer<typeof insertHouseholdSchema>;
export type UserHousehold = typeof userHouseholds.$inferSelect;
export type InsertUserHousehold = z.infer<typeof insertUserHouseholdSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type BudgetGoal = typeof budgetGoals.$inferSelect;
export type InsertBudgetGoal = z.infer<typeof insertBudgetGoalSchema>;
export type ShoppingItem = typeof shoppingItems.$inferSelect;
export type InsertShoppingItem = z.infer<typeof insertShoppingItemSchema>;

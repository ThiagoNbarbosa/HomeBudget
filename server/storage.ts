import {
  users,
  households,
  userHouseholds,
  categories,
  transactions,
  budgetGoals,
  shoppingItems,
  type User,
  type UpsertUser,
  type Household,
  type InsertHousehold,
  type UserHousehold,
  type InsertUserHousehold,
  type Category,
  type InsertCategory,
  type Transaction,
  type InsertTransaction,
  type BudgetGoal,
  type InsertBudgetGoal,
  type ShoppingItem,
  type InsertShoppingItem,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sum, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Household operations
  createHousehold(household: InsertHousehold): Promise<Household>;
  getUserHousehold(userId: string): Promise<Household | undefined>;
  addUserToHousehold(userHousehold: InsertUserHousehold): Promise<UserHousehold>;
  getHouseholdMembers(householdId: string): Promise<User[]>;
  
  // Category operations
  getHouseholdCategories(householdId: string): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  createDefaultCategories(householdId: string): Promise<Category[]>;
  
  // Transaction operations
  getHouseholdTransactions(householdId: string, limit?: number): Promise<(Transaction & { user: User; category: Category })[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getMonthlyTransactionsByCategory(householdId: string, month: number, year: number): Promise<any[]>;
  
  // Budget operations
  getHouseholdBudgetGoals(householdId: string, month: number, year: number): Promise<(BudgetGoal & { category: Category })[]>;
  createBudgetGoal(budgetGoal: InsertBudgetGoal): Promise<BudgetGoal>;
  
  // Shopping list operations
  getHouseholdShoppingItems(householdId: string): Promise<(ShoppingItem & { user: User })[]>;
  createShoppingItem(item: InsertShoppingItem): Promise<ShoppingItem>;
  updateShoppingItem(id: string, updates: Partial<ShoppingItem>): Promise<ShoppingItem>;
  
  // Data management operations
  exportHouseholdData(householdId: string): Promise<any>;
  resetHouseholdData(householdId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Household operations
  async createHousehold(householdData: InsertHousehold): Promise<Household> {
    const [household] = await db
      .insert(households)
      .values(householdData)
      .returning();
    return household;
  }

  async getUserHousehold(userId: string): Promise<Household | undefined> {
    const [result] = await db
      .select({ household: households })
      .from(userHouseholds)
      .innerJoin(households, eq(userHouseholds.householdId, households.id))
      .where(eq(userHouseholds.userId, userId));
    
    return result?.household;
  }

  async addUserToHousehold(userHouseholdData: InsertUserHousehold): Promise<UserHousehold> {
    const [userHousehold] = await db
      .insert(userHouseholds)
      .values(userHouseholdData)
      .returning();
    return userHousehold;
  }

  async getHouseholdMembers(householdId: string): Promise<User[]> {
    const result = await db
      .select({ user: users })
      .from(userHouseholds)
      .innerJoin(users, eq(userHouseholds.userId, users.id))
      .where(eq(userHouseholds.householdId, householdId));
    
    return result.map(r => r.user);
  }

  // Category operations
  async getHouseholdCategories(householdId: string): Promise<Category[]> {
    return await db
      .select()
      .from(categories)
      .where(eq(categories.householdId, householdId));
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(categoryData)
      .returning();
    return category;
  }

  async createDefaultCategories(householdId: string): Promise<Category[]> {
    const defaultCategories = [
      { name: "Casa", icon: "fas fa-home", color: "#3B82F6", type: "expense" as const },
      { name: "Alimentação", icon: "fas fa-utensils", color: "#F59E0B", type: "expense" as const },
      { name: "Transporte", icon: "fas fa-car", color: "#7C3AED", type: "expense" as const },
      { name: "Lazer", icon: "fas fa-gamepad", color: "#EC4899", type: "expense" as const },
      { name: "Saúde", icon: "fas fa-heart", color: "#EF4444", type: "expense" as const },
      { name: "Educação", icon: "fas fa-graduation-cap", color: "#10B981", type: "expense" as const },
      { name: "Salário", icon: "fas fa-money-bill", color: "#10B981", type: "income" as const },
      { name: "Freelance", icon: "fas fa-laptop", color: "#10B981", type: "income" as const },
    ];

    const result = [];
    for (const cat of defaultCategories) {
      const category = await this.createCategory({
        ...cat,
        householdId,
      });
      result.push(category);
    }
    return result;
  }

  // Transaction operations
  async getHouseholdTransactions(householdId: string, limit = 10): Promise<(Transaction & { user: User; category: Category })[]> {
    const result = await db
      .select({
        transaction: transactions,
        user: users,
        category: categories,
      })
      .from(transactions)
      .innerJoin(users, eq(transactions.userId, users.id))
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(eq(transactions.householdId, householdId))
      .orderBy(desc(transactions.date))
      .limit(limit);

    return result.map(r => ({
      ...r.transaction,
      user: r.user,
      category: r.category,
    }));
  }

  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(transactionData)
      .returning();
    return transaction;
  }

  async getMonthlyTransactionsByCategory(householdId: string, month: number, year: number): Promise<any[]> {
    const result = await db
      .select({
        categoryId: transactions.categoryId,
        category: categories,
        totalAmount: sum(transactions.amount).as("totalAmount"),
        transactionCount: sql<number>`count(*)`.as("transactionCount"),
      })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          eq(transactions.householdId, householdId),
          sql`extract(month from ${transactions.date}) = ${month}`,
          sql`extract(year from ${transactions.date}) = ${year}`
        )
      )
      .groupBy(transactions.categoryId, categories.id);

    return result;
  }

  // Budget operations
  async getHouseholdBudgetGoals(householdId: string, month: number, year: number): Promise<(BudgetGoal & { category: Category })[]> {
    const result = await db
      .select({
        budgetGoal: budgetGoals,
        category: categories,
      })
      .from(budgetGoals)
      .innerJoin(categories, eq(budgetGoals.categoryId, categories.id))
      .where(
        and(
          eq(budgetGoals.householdId, householdId),
          eq(budgetGoals.month, month),
          eq(budgetGoals.year, year)
        )
      );

    return result.map(r => ({
      ...r.budgetGoal,
      category: r.category,
    }));
  }

  async createBudgetGoal(budgetGoalData: InsertBudgetGoal): Promise<BudgetGoal> {
    const [budgetGoal] = await db
      .insert(budgetGoals)
      .values(budgetGoalData)
      .returning();
    return budgetGoal;
  }

  // Shopping list operations
  async getHouseholdShoppingItems(householdId: string): Promise<(ShoppingItem & { user: User })[]> {
    const result = await db
      .select({
        shoppingItem: shoppingItems,
        user: users,
      })
      .from(shoppingItems)
      .innerJoin(users, eq(shoppingItems.userId, users.id))
      .where(eq(shoppingItems.householdId, householdId))
      .orderBy(desc(shoppingItems.createdAt));

    return result.map(r => ({
      ...r.shoppingItem,
      user: r.user,
    }));
  }

  async createShoppingItem(itemData: InsertShoppingItem): Promise<ShoppingItem> {
    const [item] = await db
      .insert(shoppingItems)
      .values(itemData)
      .returning();
    return item;
  }

  async updateShoppingItem(id: string, updates: Partial<ShoppingItem>): Promise<ShoppingItem> {
    const [item] = await db
      .update(shoppingItems)
      .set(updates)
      .where(eq(shoppingItems.id, id))
      .returning();
    return item;
  }

  // Data management operations
  async exportHouseholdData(householdId: string): Promise<any> {
    // Get all household data
    const household = await db.select().from(households).where(eq(households.id, householdId));
    const members = await this.getHouseholdMembers(householdId);
    const categoriesData = await this.getHouseholdCategories(householdId);
    const transactionsData = await this.getHouseholdTransactions(householdId, 1000);
    const budgetsData = await this.getHouseholdBudgetGoals(householdId, new Date().getMonth() + 1, new Date().getFullYear());
    const shoppingData = await this.getHouseholdShoppingItems(householdId);

    return {
      exportDate: new Date().toISOString(),
      appVersion: "1.0.0",
      household: household[0],
      members,
      categories: categoriesData,
      transactions: transactionsData,
      budgetGoals: budgetsData,
      shoppingItems: shoppingData,
    };
  }

  async resetHouseholdData(householdId: string): Promise<void> {
    // Delete all household data in correct order (respecting foreign key constraints)
    await db.delete(shoppingItems).where(eq(shoppingItems.householdId, householdId));
    await db.delete(budgetGoals).where(eq(budgetGoals.householdId, householdId));
    await db.delete(transactions).where(eq(transactions.householdId, householdId));
    await db.delete(categories).where(eq(categories.householdId, householdId));
    
    // Recreate default categories
    await this.createDefaultCategories(householdId);
  }
}

export const storage = new DatabaseStorage();

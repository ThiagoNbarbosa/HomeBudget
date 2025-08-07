import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { seedDefaultCategories } from "./seedCategories";
import {
  insertHouseholdSchema,
  insertTransactionSchema,
  insertShoppingItemSchema,
  insertBudgetGoalSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Household routes
  app.post('/api/households', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertHouseholdSchema.parse(req.body);
      
      const household = await storage.createHousehold(validatedData);
      await storage.addUserToHousehold({
        userId,
        householdId: household.id,
        role: "admin",
      });
      
      // Create default categories
      await seedDefaultCategories(household.id);
      
      res.json(household);
    } catch (error) {
      console.error("Error creating household:", error);
      res.status(500).json({ message: "Failed to create household" });
    }
  });

  app.get('/api/households/current', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const household = await storage.getUserHousehold(userId);
      res.json(household);
    } catch (error) {
      console.error("Error fetching household:", error);
      res.status(500).json({ message: "Failed to fetch household" });
    }
  });

  app.get('/api/households/:id/members', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const members = await storage.getHouseholdMembers(id);
      res.json(members);
    } catch (error) {
      console.error("Error fetching household members:", error);
      res.status(500).json({ message: "Failed to fetch household members" });
    }
  });

  // Transaction routes
  app.get('/api/households/:id/transactions', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const transactions = await storage.getHouseholdTransactions(id, limit);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertTransactionSchema.parse({
        ...req.body,
        userId,
      });
      
      const transaction = await storage.createTransaction(validatedData);
      res.json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  // Category routes
  app.get('/api/households/:id/categories', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const categories = await storage.getHouseholdCategories(id);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Budget routes
  app.get('/api/households/:id/budgets', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      
      const budgets = await storage.getHouseholdBudgetGoals(id, month, year);
      const spending = await storage.getMonthlyTransactionsByCategory(id, month, year);
      
      // Combine budget goals with actual spending
      const budgetWithSpending = budgets.map(budget => {
        const spent = spending.find(s => s.categoryId === budget.categoryId);
        return {
          ...budget,
          spent: spent?.totalAmount || "0",
          transactionCount: spent?.transactionCount || 0,
        };
      });
      
      res.json(budgetWithSpending);
    } catch (error) {
      console.error("Error fetching budgets:", error);
      res.status(500).json({ message: "Failed to fetch budgets" });
    }
  });

  app.post('/api/budgets', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertBudgetGoalSchema.parse(req.body);
      const budget = await storage.createBudgetGoal(validatedData);
      res.json(budget);
    } catch (error) {
      console.error("Error creating budget:", error);
      res.status(500).json({ message: "Failed to create budget" });
    }
  });

  // Shopping list routes
  app.get('/api/households/:id/shopping', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const items = await storage.getHouseholdShoppingItems(id);
      res.json(items);
    } catch (error) {
      console.error("Error fetching shopping items:", error);
      res.status(500).json({ message: "Failed to fetch shopping items" });
    }
  });

  app.post('/api/shopping', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate the data first without conversion
      const validatedData = insertShoppingItemSchema.parse({
        ...req.body,
        userId,
      });
      
      const item = await storage.createShoppingItem(validatedData);
      res.json(item);
    } catch (error) {
      console.error("Error creating shopping item:", error);
      res.status(500).json({ message: "Failed to create shopping item" });
    }
  });

  app.patch('/api/shopping/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const item = await storage.updateShoppingItem(id, req.body);
      res.json(item);
    } catch (error) {
      console.error("Error updating shopping item:", error);
      res.status(500).json({ message: "Failed to update shopping item" });
    }
  });

  // Analytics routes
  app.get('/api/households/:id/analytics', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      
      const categorySpending = await storage.getMonthlyTransactionsByCategory(id, month, year);
      const transactions = await storage.getHouseholdTransactions(id, 100);
      
      // Calculate total income and expenses
      const totalIncome = transactions
        .filter(t => t.category.type === "income")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const totalExpenses = transactions
        .filter(t => t.category.type === "expense")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const currentBalance = totalIncome - totalExpenses;
      
      res.json({
        currentBalance,
        totalIncome,
        totalExpenses,
        categorySpending,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

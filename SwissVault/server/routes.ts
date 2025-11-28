import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import { Pool } from "pg";
import { storage } from "./storage";
import { loginSchema, transferSchema } from "@shared/schema";

const PostgresSessionStore = ConnectPgSimple(session);

declare module "express-session" {
  interface SessionData {
    username: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create PostgreSQL pool for sessions
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  // Session middleware with PostgreSQL storage
  app.use(
    session({
      store: new PostgresSessionStore({
        pool,
        tableName: "session",
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || "helvetia-private-bank-secret-key-2024",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: "lax",
      },
    })
  );

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const { username, password } = result.data;
      const user = await storage.authenticateUser(username, password);

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.username = username;
      res.json({ success: true, user });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Login failed" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie("connect.sid");
      res.json({ success: true });
    });
  });

  // Get current user endpoint
  app.get("/api/user", async (req, res) => {
    try {
      if (!req.session.username) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get user" });
    }
  });

  // Create transfer endpoint
  app.post("/api/transfers", async (req, res) => {
    try {
      if (!req.session.username) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const result = transferSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid transfer data",
          errors: result.error.errors 
        });
      }

      const transferResponse = await storage.createTransfer(
        req.session.username,
        result.data
      );

      res.json(transferResponse);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Transfer failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import express from "express";
import cors from "cors";
import session from "express-session";

import authRoutes from "./auth.js";
import meRoutes from "./me.js";
import dashboardRoutes from "./dashboard.js";
import studentsRoutes from "./students.js";
import coursesRoutes from "./courses.js";
import { ensureSchema } from "../db.js";

// Run schema check on startup
ensureSchema();

export const app = express();
app.set("trust proxy", 1); 

app.use(
  cors({
    origin: [
      "https://school-admin-4gm.pages.dev",
      "https://51cd9536.school-admin-4gm.pages.dev",
      "http://localhost:5173"
    ],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use(express.json());

app.use(
  session({
    name: "sid",
    secret: process.env.SESSION_SECRET ?? "dev-secret",
    resave: false,
    saveUninitialized: false,
    proxy: true, // Required for Vercel/proxies
    cookie: {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 8,
    },
  }),
);

app.get("/api/_ping", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/me", meRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/courses", coursesRoutes);
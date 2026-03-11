import express from "express";
import cors from "cors";
import session from "express-session";

import authRoutes from "./auth";
import meRoutes from "./me";
import dashboardRoutes from "./dashboard";
import studentsRoutes from "./students";
import coursesRoutes from "./courses";

export const app = express();

app.use(express.json());

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://localhost:5174",
]);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      return cb(null, allowedOrigins.has(origin));
    },
    credentials: true,
  }),
);

app.use(
  session({
    name: "sid",
    secret: process.env.SESSION_SECRET ?? "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
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
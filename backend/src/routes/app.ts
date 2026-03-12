import express from "express";
import session from "express-session";

import authRoutes from "./auth";
import meRoutes from "./me";
import dashboardRoutes from "./dashboard";
import studentsRoutes from "./students";
import coursesRoutes from "./courses";

export const app = express();
app.set("trust proxy", 1); 

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://51cd9536.school-admin-4gm.pages.dev",
  "https://school-admin-4gm.pages.dev",
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  next();
});

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
      sameSite: "none", // Required for cross-site
      secure: true,     // Required for sameSite: none
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
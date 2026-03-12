import { Router } from "express";
import * as bcrypt from "bcrypt";
import { pool } from "../db.js";

const r = Router();

// 最初は「admin@example.com / pass1234」で動作確認したいので seed 前提
r.post("/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) return res.status(400).json({ ok: false, message: "email/password required" });

  const rows = await pool.query(
    `SELECT id, email, password_hash, name, role, status
     FROM users
     WHERE email = ? LIMIT 1`,
    [email],
  );

  const u = rows?.[0];
  if (!u) return res.status(401).json({ ok: false, message: "Invalid credentials" });
  if (u.status !== "active") return res.status(403).json({ ok: false, message: "User inactive" });

  const ok = await bcrypt.compare(password, u.password_hash);
  if (!ok) return res.status(401).json({ ok: false, message: "Invalid credentials" });

  (req.session as any).user = { id: u.id, email: u.email, name: u.name, role: u.role };
  res.json({ ok: true, user: (req.session as any).user });
});

r.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ ok: false, message: "logout failed" });
    res.clearCookie("sid");
    res.json({ ok: true });
  });
});

export default r;
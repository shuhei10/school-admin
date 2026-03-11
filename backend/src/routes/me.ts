import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";

const r = Router();

r.get("/", requireAuth, (req, res) => {
  res.json({ ok: true, user: req.session.user });
});

export default r;
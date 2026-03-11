import type { Request, Response, NextFunction } from "express";

export function requireRole(roles: Array<"admin" | "instructor" | "student">) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.session.user;
    if (!user) return res.status(401).json({ ok: false, message: "Unauthorized" });
    if (!roles.includes(user.role)) return res.status(403).json({ ok: false, message: "Forbidden" });
    next();
  };
}
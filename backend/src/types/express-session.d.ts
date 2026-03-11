import "express-session";

declare module "express-session" {
  interface SessionData {
    user: {
      id: number;
      username: string;
      role: "admin" | "instructor" | "student";
    } | null;
  }
}
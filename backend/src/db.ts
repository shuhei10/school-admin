import { createPool } from "mariadb";

console.log("Database Host:", process.env.DB_HOST || "NOT SET");

export const pool = createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 3307,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_DATABASE || "school_admin",
  connectionLimit: 10,
  acquireTimeout: 10000, // 10 seconds timeout
  ssl: {
    rejectUnauthorized: false
  },
  allowPublicKeyRetrieval: true
});



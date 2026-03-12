import { createPool } from "mariadb";

console.log("--- DB Connection Attempt ---");
console.log("Host:", process.env.DB_HOST || "NOT SET");
console.log("Port:", process.env.DB_PORT || "NOT SET");
console.log("User:", process.env.DB_USER || "NOT SET");
console.log("DB Name:", process.env.DB_DATABASE || "NOT SET");
console.log("----------------------------");

export const pool = createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 3307,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_DATABASE || "school_admin",
  connectionLimit: 15,
  connectTimeout: 20000, // 20 seconds
  acquireTimeout: 20000, // 20 seconds
  ssl: {
    rejectUnauthorized: false
  },
  allowPublicKeyRetrieval: true
});



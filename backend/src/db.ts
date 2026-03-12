import { createPool } from "mariadb";

export const pool = createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 3307,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_DATABASE || "school_admin",
  connectionLimit: 5,
  ssl: {
    rejectUnauthorized: false
  },
  allowPublicKeyRetrieval: true
});



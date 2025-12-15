// lib/db.ts
import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.RAW_DATABASE_URL!);

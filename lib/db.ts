import { neon } from "@neondatabase/serverless";

// Create a reusable SQL client
export const sql = neon(process.env.DATABASE_URL!);

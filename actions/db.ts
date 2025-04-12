"use server";

import { sql } from "@/lib/db";
import { productsSchema } from "@/schemas/product";
import { scoresSchema } from "@/schemas/scrore";
import { Product } from "@/types/product";
import { Score } from "@/types/score";

// Helper function to get products by category
export async function getProductsByCategory(
  category?: string,
  limit = 10,
  offset = 0
): Promise<Product[]> {
  let products;

  if (category) {
    products = await sql`
      SELECT * FROM products 
      WHERE type = ${category}
      ORDER BY RANDOM()
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else {
    products = await sql`
      SELECT * FROM products 
      ORDER BY RANDOM()
      LIMIT ${limit} OFFSET ${offset}
    `;
  }

  return productsSchema.parseAsync(products);
}

// Helper function to get all categories
export async function getAllCategories(): Promise<string[]> {
  const result =
    await sql`SELECT DISTINCT type FROM products ORDER BY type asc`;

  return result.map((row: any) => row.type);
}

export async function submitScore(
  name: string,
  score: number,
  category?: string
): Promise<void> {
  await sql`
    INSERT INTO leaderboards (name, score, category)
    VALUES (${name}, ${score}, ${category ?? null})
  `;
}

export async function getTopScores(
  category?: string,
  limit = 10
): Promise<Score[]> {
  const scores = await sql`
    SELECT id, name, score, category, created FROM leaderboards
    ${category ? sql`WHERE category = ${category}` : sql``}
    ORDER BY score DESC
    LIMIT ${limit}
  `;

  return scoresSchema.parseAsync(scores);
}

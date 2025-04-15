"use server";

import { sql } from "@/lib/db";
import { formattedTypesSchema, productsSchema } from "@/schemas/product";
import { scoresSchema } from "@/schemas/scrore";
import { FormattedType, Product } from "@/types/product";
import { Score } from "@/types/score";

type GetProductsParams = {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  limit?: number;
  offset?: number;
  bottleSize?: string;
};

export async function getProducts({
  category,
  priceMin,
  priceMax,
  limit = 10,
  offset = 0,
  bottleSize,
}: GetProductsParams): Promise<Product[]> {
  let query = sql`
    SELECT p.*, t.name as type
    FROM products p
    INNER JOIN types t ON p.type_id = t.id
    WHERE 1=1
  `;

  if (category) {
    query = sql`${query} AND t.name = ${category}`;
  }

  if (priceMin !== undefined) {
    query = sql`${query} AND p.price >= ${priceMin}`;
  }

  if (priceMax !== undefined) {
    query = sql`${query} AND p.price <= ${priceMax}`;
  }

  if (bottleSize) {
    query = sql`${query} AND p.bottle_size = ${bottleSize}`;
  }

  query = sql`${query} ORDER BY RANDOM() LIMIT ${limit} OFFSET ${offset}`;

  const products = await query;
  return productsSchema.parseAsync(products);
}

export async function getProductsByCategory(
  category?: string,
  limit = 10,
  offset = 0
): Promise<Product[]> {
  return getProducts({ category: category, offset, limit });
}

// Helper function to get all categories
export async function getAllCategories(): Promise<FormattedType[]> {
  const result = await sql`
    SELECT t.*
    FROM types t
    INNER JOIN products p ON t.id = p.type_id
    WHERE t.name IS NOT NULL AND t.name != ''
    GROUP BY t.id
    ORDER BY t.name ASC
  `;

  return formattedTypesSchema.parse(result);
}

export async function getAllBottleSizes(): Promise<string[]> {
  const result =
    await sql`SELECT DISTINCT bottle_size FROM products WHERE bottle_size IS NOT NULL AND bottle_size != '' ORDER BY bottle_size asc`;

  return result.map((row: any) => row.bottle_size);
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

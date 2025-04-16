"use server";

import { sql } from "@/lib/db";
import getProductsParamsSchema from "@/schemas/db";
import { formattedTypesSchema, productsSchema } from "@/schemas/product";
import { scoresSchema } from "@/schemas/scrore";
import { GetProductsParams } from "@/types/db";
import { FormattedType, Product } from "@/types/product";
import { Score } from "@/types/score";

export async function getProducts(
  params: GetProductsParams
): Promise<Product[]> {
  const formattedParams = getProductsParamsSchema.parse(params);
  const {
    category,
    categorySlug,
    priceMin,
    priceMax,
    limit = 10,
    offset = 0,
    bottleSize,
  } = formattedParams;

  let query = sql`
    SELECT p.*, t.name as type
    FROM products p
    INNER JOIN types t ON p.type_id = t.id
    WHERE 1=1
  `;

  if (category) {
    query = sql`${query} AND t.name = ${category}`;
  }

  if (categorySlug) {
    query = sql`${query} AND t.slug = ${categorySlug}`;
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
  categorySlug?: string,
  limit = 10,
  offset = 0
): Promise<Product[]> {
  return getProducts({ categorySlug, offset, limit });
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
  typeSlug?: string
): Promise<void> {
  await sql`
    INSERT INTO leaderboards (name, score, type_id)
    VALUES (${name}, ${score}, ${
    typeSlug
      ? sql`(SELECT id from types WHERE slug = ${typeSlug})`
      : sql`${null}`
  })
  `;
}

export async function getTopScores(
  type?: string,
  limit = 10
): Promise<Score[]> {
  const scores = await sql`
    SELECT l.*, t.name_en as type
    FROM leaderboards l
    LEFT JOIN types t ON t.id = l.type_id
    ${type ? sql`WHERE t.name = ${type}` : sql``}
    ORDER BY score DESC
    LIMIT ${limit}
  `;

  return scoresSchema.parseAsync(scores);
}

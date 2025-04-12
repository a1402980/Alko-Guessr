import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    // Check if categories table has data
    const categoriesCount = await sql`SELECT COUNT(*) FROM categories`

    // If no categories exist, insert default ones
    if (Number.parseInt(categoriesCount[0].count) === 0) {
      await sql`
        INSERT INTO categories (name, display_name)
        VALUES 
          ('red-wines', 'Red Wines'),
          ('white-wines', 'White Wines'),
          ('beers', 'Beers'),
          ('spirits', 'Spirits'),
          ('ciders', 'Ciders'),
          ('sparkling-wines', 'Sparkling Wines'),
          ('rose-wines', 'Rosé Wines'),
          ('liqueurs', 'Liqueurs')
        ON CONFLICT (name) DO NOTHING
      `
    }

    const categories = await sql`SELECT * FROM categories ORDER BY display_name`

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

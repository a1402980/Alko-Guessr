import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const sql = neon(process.env.DATABASE_URL!)

    let products

    if (category && category !== "all") {
      products = await sql`
        SELECT * FROM products 
        WHERE category = ${category}
        ORDER BY RANDOM()
        LIMIT ${limit} OFFSET ${offset}
      `
    } else {
      products = await sql`
        SELECT * FROM products 
        ORDER BY RANDOM()
        LIMIT ${limit} OFFSET ${offset}
      `
    }

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

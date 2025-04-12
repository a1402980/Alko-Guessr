import { NextResponse } from "next/server";
import { fetchAndProcessAlkoData } from "@/lib/integration/alko-data-fetcher";
import * as XLSX from "xlsx";
import { insertProductsToDatabase } from "@/lib/integration/alko-data-fetcher";
import path from "path";
import fs from "fs";
import { sql } from "@/lib/db";
import { productSchema } from "@/schemas/product";

export async function GET(request: Request) {
  try {
    // Verify the request is from a trusted source (e.g., Vercel Cron)
    const authHeader = request.headers.get("x-cron-api-key");

    if (
      process.env.NODE_ENV === "production" &&
      authHeader !== process.env.CRON_SECRET
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Running cron job to update products...");

    // Parse query parameters
    const url = new URL(request.url);
    const useLocalFile = url.searchParams.get("useLocalFile");

    let productsProcessed = 0;

    if (useLocalFile === "true") {
      console.log("Using local file for product data...");

      // Path to the local file
      const filePath = path.resolve(process.cwd(), "data/products_alko.xlsx");

      if (!fs.existsSync(filePath)) {
        return NextResponse.json(
          { error: "Local file not found" },
          { status: 404 }
        );
      }

      // Read the local file
      const fileBuffer = fs.readFileSync(filePath);
      const workbook = XLSX.read(fileBuffer);

      // Get the first sheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert to JSON
      const data = XLSX.utils.sheet_to_json(worksheet, { range: 3 }); // 3 means skip the first 3 rows (0-based index)

      // Map the data to the product schema
      const products = data.map((row: any) => {
        const product = {
          product_id: String(row["Numero"] || ""),
          name: String(row["Nimi"] || ""),
          manufacturer: String(row["Valmistaja"] || ""),
          bottle_size: String(row["Pullokoko"] || ""),
          price: Number.parseFloat(row["Hinta"] || "0"),
          price_per_liter: Number.parseFloat(row["Litrahinta"] || "0"),
          is_new: (row["Uutuus"] || "") === "uutuus",
          price_order_code: String(row["Hinnastojärjestyskoodi"] || ""),
          type: String(row["Tyyppi"] || ""),
          sub_type: String(row["Alatyyppi"] || ""),
          special_group: String(row["Erityisryhmä"] || ""),
          country: String(row["Valmistusmaa"] || ""),
          region: String(row["Alue"] || ""),
          vintage: String(row["Vuosikerta"] || ""),
          label_notes: String(row["Etikettimerkintöjä"] || ""),
          notes: String(row["Huomautus"] || ""),
          grapes: String(row["Rypäleet"] || ""),
          description: String(row["Luonnehdinta"] || ""),
          packaging_type: String(row["Pakkaustyyppi"] || ""),
          closure_type: String(row["Suljentatyyppi"] || ""),
          alcohol_percentage: Number.parseFloat(row["Alkoholi-%"] || "0"),
          acidity: Number.parseFloat(row["Hapot g/l"] || "0"),
          sugar: Number.parseFloat(row["Sokeri g/l"] || "0"),
          energy: Number.parseFloat(row["Energia kcal/100 ml"] || "0"),
          selection: String(row["Valikoima"] || ""),
          ean: String(row["EAN"] || ""),
        };

        return productSchema.parse(product);
      });

      // Filter out invalid products
      const validProducts = products.filter(
        (p) => p.product_id && p.name && !isNaN(p.price) && p.price > 0
      );

      console.log(`Found ${validProducts.length} valid products`);

      // Insert products into the database
      await insertProductsToDatabase(validProducts);

      productsProcessed = validProducts.length;
    } else {
      // Default behavior: Fetch and process Alko data
      const result = await fetchAndProcessAlkoData();

      if (!result.success) {
        return NextResponse.json(
          {
            error: "Failed to process Alko data",
            details: result.error,
          },
          { status: 500 }
        );
      }

      if (result.productsProcessed)
        productsProcessed = result.productsProcessed;
    }

    const domain = new URL(request.url).hostname;

    // Add a trace to the metadata table
    await sql`
      INSERT INTO metadata (updated, integration, domain)
      VALUES (
        NOW(),
        'Alko Products Update',
        ${domain}
      )
    `;

    console.log("Metadata trace added successfully");

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${productsProcessed} products`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in cron job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

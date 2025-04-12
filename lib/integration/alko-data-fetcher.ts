import * as XLSX from "xlsx";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { sql } from "../db";
import { Product } from "@/types/product";
import { productsSchema } from "@/schemas/product";

puppeteer.use(StealthPlugin());

const productUrl = process.env.ALKO_PRODUCTS_URL;

export async function fetchAndProcessAlkoData() {
  try {
    console.log("Fetching Alko data...");

    if (!productUrl) {
      throw new Error("ALKO_PRODUCTS_URL is not defined");
    }

    // Fetch the Excel file
    const arrayBuffer = await fetchFileWithPuppeteer(productUrl);

    console.log(typeof arrayBuffer);

    const workbook = XLSX.read(arrayBuffer);

    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`Processed ${data.length} products from Alko data`);

    console.log("Data sample:", data.slice(0, 10));

    // Map the data to our product schema
    const productData = data.map((row: any) => ({
      product_id: row["Numero"] || "",
      name: row["Nimi"] || "",
      manufacturer: row["Valmistaja"] || "",
      bottle_size: row["Pullokoko"] || "",
      price: Number.parseFloat(row["Hinta"] || 0),
      price_per_liter: Number.parseFloat(row["Litrahinta"] || 0),
      is_new: row["Uutuus"] === "uutuus",
      price_order_code: row["Hinnastojärjestyskoodi"] || "",
      type: row["Tyyppi"] || "",
      sub_type: row["Alatyyppi"] || "",
      special_group: row["Erityisryhmä"] || "",
      country: row["Valmistusmaa"] || "",
      region: row["Alue"] || "",
      vintage: row["Vuosikerta"] || "",
      label_notes: row["Etikettimerkintöjä"] || "",
      notes: row["Huomautus"] || "",
      grapes: row["Rypäleet"] || "",
      description: row["Luonnehdinta"] || "",
      packaging_type: row["Pakkaustyyppi"] || "",
      closure_type: row["Suljentatyyppi"] || "",
      alcohol_percentage: Number.parseFloat(row["Alkoholi-%"] || 0),
      acidity: Number.parseFloat(row["Hapot g/l"] || 0),
      sugar: Number.parseFloat(row["Sokeri g/l"] || 0),
      energy: Number.parseFloat(row["Energia kcal/100 ml"] || 0),
      selection: row["Valikoima"] || "",
      ean: row["EAN"] || "",
    }));

    // Filter out invalid products
    const products = productsSchema.parse(productData);

    console.log(`Found ${products.length} valid products`);

    // Insert products into the database
    await insertProductsToDatabase(products);

    return {
      success: true,
      productsProcessed: products.length,
    };
  } catch (error) {
    console.error("Error in fetchAndProcessAlkoData:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function insertProductsToDatabase(products: Product[]) {
  console.log("Inserting products to database...");

  // Process in batches to avoid overwhelming the database
  const batchSize = 100;
  const batches = Math.ceil(products.length / batchSize);

  for (let i = 0; i < batches; i++) {
    const batch = products.slice(i * batchSize, (i + 1) * batchSize);

    // Use a transaction for each batch
    await sql.transaction((tx) => {
      const queries = batch.map(
        (product) => tx`
          INSERT INTO products (
            product_id, 
            name, 
            manufacturer,
            bottle_size,
            price, 
            price_per_liter,
            is_new,
            price_order_code,
            type,
            sub_type,
            special_group,
            country,
            region,
            vintage,
            label_notes,
            notes,
            grapes,
            description,
            packaging_type,
            closure_type,
            alcohol_percentage,
            acidity,
            sugar,
            energy,
            selection,
            ean,
            image_url
          ) 
          VALUES (
            ${product.product_id}, 
            ${product.name}, 
            ${product.manufacturer},
            ${product.bottle_size},
            ${product.price}, 
            ${product.price_per_liter},
            ${product.is_new},
            ${product.price_order_code},
            ${product.type},
            ${product.sub_type},
            ${product.special_group},
            ${product.country},
            ${product.region},
            ${product.vintage},
            ${product.label_notes},
            ${product.notes},
            ${product.grapes},
            ${product.description},
            ${product.packaging_type},
            ${product.closure_type},
            ${product.alcohol_percentage},
            ${product.acidity},
            ${product.sugar},
            ${product.energy},
            ${product.selection},
            ${product.ean},
            ${`https://images.alko.fi/images/cs_srgb,f_auto,t_medium/cdn/${product.product_id}/.jpg`}
          )
          ON CONFLICT (product_id) 
          DO UPDATE SET 
            name = EXCLUDED.name,
            manufacturer = EXCLUDED.manufacturer,
            bottle_size = EXCLUDED.bottle_size,
            price = EXCLUDED.price,
            price_per_liter = EXCLUDED.price_per_liter,
            is_new = EXCLUDED.is_new,
            price_order_code = EXCLUDED.price_order_code,
            type = EXCLUDED.type,
            sub_type = EXCLUDED.sub_type,
            special_group = EXCLUDED.special_group,
            country = EXCLUDED.country,
            region = EXCLUDED.region,
            vintage = EXCLUDED.vintage,
            label_notes = EXCLUDED.label_notes,
            notes = EXCLUDED.notes,
            grapes = EXCLUDED.grapes,
            description = EXCLUDED.description,
            packaging_type = EXCLUDED.packaging_type,
            closure_type = EXCLUDED.closure_type,
            alcohol_percentage = EXCLUDED.alcohol_percentage,
            acidity = EXCLUDED.acidity,
            sugar = EXCLUDED.sugar,
            energy = EXCLUDED.energy,
            selection = EXCLUDED.selection,
            ean = EXCLUDED.ean,
            image_url = EXCLUDED.image_url,
            updated_at = NOW()
        `
      );
      return queries;
    });

    console.log(
      `Inserted batch ${i + 1}/${batches} (${batch.length} products)`
    );
  }

  console.log("All products inserted successfully");
}

async function fetchFileWithPuppeteer(url: string): Promise<Uint8Array> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  console.log(`Navigating to URL: ${url}`);
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  );
  await page.setExtraHTTPHeaders({
    "Accept-Language": "fi-FI,en;q=0.9",
    Referer: "https://www.alko.fi/",
    Origin: "https://www.alko.fi",
  });

  await page.goto(url, { waitUntil: "networkidle2" });

  // Save the page content for debugging
  const pageContent = await page.content();
  require("fs").writeFileSync("debug-page.html", pageContent);
  console.log("Page content saved as debug-page.html");

  // Fetch the file
  const fileBuffer = await page.evaluate(async () => {
    const response = await fetch(location.href);
    if (!response.ok) {
      throw new Error(`Failed to fetch file. Status: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Array.from(new Uint8Array(arrayBuffer));
  });

  console.log("Fetched file size:", fileBuffer.length);

  const uint8Array = new Uint8Array(fileBuffer);

  const fs = require("fs");
  fs.writeFileSync("debug-file.xlsx", Buffer.from(uint8Array));
  console.log("File saved as debug-file.xlsx");

  await browser.close();
  return uint8Array;
}

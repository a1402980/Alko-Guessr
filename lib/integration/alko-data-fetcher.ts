import * as XLSX from "xlsx";
import puppeteer from "puppeteer-extra";
import { sql } from "../db";
import { FormattedType, IntegrationProduct } from "@/types/product";
import fs from "fs";
import path from "path";
import { productFromAlkoData, typesFromProducts } from "./alko";
import chromium from "@sparticuz/chromium";
import puppeteerCore from "puppeteer-core";

const productUrl = process.env.ALKO_PRODUCTS_URL;

export async function fetchAndProcessAlkoData() {
  try {
    console.log("Fetching Alko data...");

    if (!productUrl) {
      throw new Error("ALKO_PRODUCTS_URL is not defined");
    }

    // Fetch the Excel file
    const arrayBuffer = await fetchFileWithPuppeteer(productUrl);

    const workbook = XLSX.read(arrayBuffer);

    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet, { range: 3 });

    console.log(`Processed ${data.length} products from Alko data`);

    // Map the data to our product schema
    const products = data.map(productFromAlkoData);

    console.log(`Found ${products.length} valid products`);

    const types = typesFromProducts(products);

    console.log(`${types.length} types found from products`);

    await insertTypesIntoDatabase(types);

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

export async function insertTypesIntoDatabase(types: FormattedType[]) {
  console.log("inserting types into database...");
  await sql.transaction((tx) => {
    const queries = types.map(
      (type) => tx`
            INSERT INTO types (
              name, 
              name_en,
              slug
            ) 
            VALUES (
              ${type.name}, 
              ${type.name_en}, 
              ${type.slug}
            )
            ON CONFLICT (slug) 
            DO UPDATE SET 
              name = EXCLUDED.name,
              name_en = EXCLUDED.name_en
          `
    );
    return queries;
  });
}

export async function insertProductsToDatabase(products: IntegrationProduct[]) {
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
        image_url,
        type_id
          ) 
          VALUES (
        ${product.product_id ?? null}, 
        ${product.name ?? null}, 
        ${product.manufacturer ?? null},
        ${product.bottle_size ?? null},
        ${product.price ?? null}, 
        ${product.price_per_liter ?? null},
        ${product.is_new ?? null},
        ${product.price_order_code ?? null},
        ${product.sub_type ?? null},
        ${product.special_group ?? null},
        ${product.country ?? null},
        ${product.region ?? null},
        ${product.vintage ?? null},
        ${product.label_notes ?? null},
        ${product.notes ?? null},
        ${product.grapes ?? null},
        ${product.description ?? null},
        ${product.packaging_type ?? null},
        ${product.closure_type ?? null},
        ${product.alcohol_percentage ?? null},
        ${product.acidity ?? null},
        ${product.sugar ?? null},
        ${product.energy ?? null},
        ${product.selection ?? null},
        ${product.ean ?? null},
        ${product.image_url ?? null},
        (SELECT id FROM types WHERE name = ${product.type ?? null})
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
        updated_at = NOW(),
        type_id = (SELECT id FROM types WHERE name = ${product.type ?? null})
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
  let browser;

  if (process.env.NODE_ENV === "production") {
    // For production, we need to use this to have chromium on our serverless enviroment
    browser = await puppeteerCore.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  } else {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }

  const downloadPath = path.resolve(process.cwd(), "data", "downloads");
  fs.mkdirSync(downloadPath, { recursive: true });

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  );
  await page.setExtraHTTPHeaders({
    "Accept-Language": "fi-FI,en;q=0.9",
    Referer: "https://www.alko.fi/",
    Origin: "https://www.alko.fi",
  });

  const client = await page.createCDPSession();

  // Enable file downloads
  await client.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath,
  });

  // Navigate to the URL but catch the ERR_ABORTED error
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
  } catch (error: any) {
    if (
      !(error instanceof Error) ||
      !error.message.includes("net::ERR_ABORTED")
    ) {
      console.error("Unexpected error during navigation:", error);
      throw error;
    }
    // Ignore net::ERR_ABORTED as it is expected for file downloads
  }

  console.log("Waiting for the file to download...");
  const fileName = "alkon-hinnasto-tekstitiedostona.xlsx";
  const filePath = path.join(downloadPath, fileName);

  // Wait for the file to appear in the download directory
  while (!fs.existsSync(filePath)) {
    await new Promise((resolve) => setTimeout(resolve, 100)); // Poll every 100ms
  }

  console.log(`File downloaded to: ${filePath}`);

  // Read the file into a buffer
  const fileBuffer = fs.readFileSync(filePath);

  await browser.close();
  return new Uint8Array(fileBuffer);
}

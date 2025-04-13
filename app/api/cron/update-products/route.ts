import { NextResponse } from "next/server";
import { fetchAndProcessAlkoData } from "@/lib/integration/alko-data-fetcher";

import { sql } from "@/lib/db";

export async function GET(request: Request) {
  const isProduction = process.env.NODE_ENV === "production";
  try {
    const authHeader = request.headers.get("authorization");

    if (isProduction && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }

    console.log("Running cron job to update products...");

    const result = await fetchAndProcessAlkoData();

    const domain = new URL(request.url).hostname;

    const details = result.success
      ? `${result.productsProcessed} products processed from Alko data.`
      : `Error: ${result.error}`;

    // Add a trace to the metadata table
    await sql`
      INSERT INTO metadata (integration, details, success,  domain)
      VALUES (
        'Alko Products Update.',
        ${details},
        ${result.success},
        ${domain}
      )
    `;

    console.log("Metadata trace added successfully");

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Failed to process Alko data",
          details: isProduction
            ? "Check server logs for more details"
            : result.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${result.productsProcessed} products`,
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

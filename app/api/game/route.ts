import { NextResponse } from "next/server";
import { getProductsByCategory } from "@/actions/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;

    // Get 4 random products for the game options
    const products = await getProductsByCategory(category, 4);

    // If we don't have enough products, return an error
    if (products.length < 4) {
      return NextResponse.json(
        { error: "Not enough products available for the game" },
        { status: 400 }
      );
    }

    // Select one of the products as the correct answer
    const correctAnswerIndex = Math.floor(Math.random() * 4);

    return NextResponse.json({
      options: products,
      correctAnswer: products[correctAnswerIndex],
    });
  } catch (error) {
    console.error("Error setting up game:", error);
    return NextResponse.json(
      { error: "Failed to set up game" },
      { status: 500 }
    );
  }
}

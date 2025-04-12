import { NextResponse } from "next/server"

// This is a placeholder route that would normally fetch the actual product image
// In a real app, you would either:
// 1. Proxy the image from Alko's website
// 2. Store the images in a CDN like Vercel Blob
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const productId = params.id

    // For now, redirect to a placeholder image
    // In a real app, you would fetch the actual image URL
    return NextResponse.redirect(`/placeholder.svg?height=400&width=400&text=${productId}`)
  } catch (error) {
    console.error("Error fetching product image:", error)
    return NextResponse.redirect("/placeholder.svg?height=400&width=400&text=Error")
  }
}

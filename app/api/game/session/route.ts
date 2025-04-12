import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, categoryId } = body

    const sql = neon(process.env.DATABASE_URL!)

    // Create a new game session
    const session = await sql`
      INSERT INTO game_sessions (user_id, category_id)
      VALUES (${userId || null}, ${categoryId || null})
      RETURNING id
    `

    return NextResponse.json({ sessionId: session[0].id })
  } catch (error) {
    console.error("Error creating game session:", error)
    return NextResponse.json({ error: "Failed to create game session" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { sessionId, score, totalQuestions } = body

    const sql = neon(process.env.DATABASE_URL!)

    // Update the game session with the final score
    await sql`
      UPDATE game_sessions
      SET score = ${score}, total_questions = ${totalQuestions}, completed_at = NOW()
      WHERE id = ${sessionId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating game session:", error)
    return NextResponse.json({ error: "Failed to update game session" }, { status: 500 })
  }
}

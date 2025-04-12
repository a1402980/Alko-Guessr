import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { gameSessionId, productId, correctAnswerId, userAnswerId, isCorrect, timeTaken } = body

    const sql = neon(process.env.DATABASE_URL!)

    // Record the game round
    const round = await sql`
      INSERT INTO game_rounds (
        game_session_id, 
        product_id, 
        correct_answer_id, 
        user_answer_id, 
        is_correct, 
        time_taken
      )
      VALUES (
        ${gameSessionId}, 
        ${productId}, 
        ${correctAnswerId}, 
        ${userAnswerId || null}, 
        ${isCorrect}, 
        ${timeTaken || null}
      )
      RETURNING id
    `

    return NextResponse.json({ roundId: round[0].id })
  } catch (error) {
    console.error("Error recording game round:", error)
    return NextResponse.json({ error: "Failed to record game round" }, { status: 500 })
  }
}

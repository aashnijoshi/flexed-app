import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 })
    }

    // Mock streak data
    const mockStreak = {
      days: Math.floor(Math.random() * 15) + 1, // Random streak 1-15 days
      lastWorkout: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    }

    return NextResponse.json(mockStreak)
  } catch (error) {
    return NextResponse.json({ message: "something went wrong" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 })
    }

    const { date, day_name, notes } = await request.json()

    if (!date || !day_name) {
      return NextResponse.json({ message: "date and day_name are required" }, { status: 400 })
    }

    // Mock completion storage
    console.log("Workout completed:", { date, day_name, notes })

    return NextResponse.json({
      message: "workout completed successfully",
      completed_at: new Date().toISOString(),
      streak_updated: true,
    })
  } catch (error) {
    return NextResponse.json({ message: "something went wrong" }, { status: 500 })
  }
}

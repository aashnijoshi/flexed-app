import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]

    // Mock token validation
    if (!token || !token.startsWith("mock-jwt-token")) {
      return NextResponse.json({ message: "invalid token" }, { status: 401 })
    }

    // Return mock user data
    return NextResponse.json({
      email: "user@example.com",
      joined: "2024-01-15",
      preferences: {
        fitness_level: "intermediate",
        goal: "strength",
        available_days: ["mon", "wed", "fri"],
        workout_duration: 45,
        equipment: ["dumbbells", "bodyweight"],
      },
    })
  } catch (error) {
    return NextResponse.json({ message: "something went wrong" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"

// Mock preferences storage (in real app, use database)
let mockPreferences: any = null

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 })
    }

    // Return stored preferences or null
    return NextResponse.json(mockPreferences)
  } catch (error) {
    return NextResponse.json({ message: "something went wrong" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 })
    }

    const preferences = await request.json()

    // Store preferences (mock)
    mockPreferences = preferences

    return NextResponse.json({
      message: "preferences saved",
      preferences,
    })
  } catch (error) {
    return NextResponse.json({ message: "something went wrong" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 })
    }

    const preferences = await request.json()

    // Update preferences (mock)
    mockPreferences = { ...mockPreferences, ...preferences }

    return NextResponse.json({
      message: "preferences updated",
      preferences: mockPreferences,
    })
  } catch (error) {
    return NextResponse.json({ message: "something went wrong" }, { status: 500 })
  }
}

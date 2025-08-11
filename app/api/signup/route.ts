import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Basic validation
    if (!email || !password) {
      return NextResponse.json({ message: "email and password are required" }, { status: 400 })
    }

    if (!email.includes("@")) {
      return NextResponse.json({ message: "please enter a valid email" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "password must be at least 6 characters" }, { status: 400 })
    }

    // Mock user creation - in real app, save to database
    // Simulate email already exists for demo
    if (email === "taken@example.com") {
      return NextResponse.json({ message: "email already exists" }, { status: 400 })
    }

    // Simulate successful signup
    return NextResponse.json({
      message: "account created successfully",
      user: { email },
    })
  } catch (error) {
    return NextResponse.json({ message: "something went wrong" }, { status: 500 })
  }
}

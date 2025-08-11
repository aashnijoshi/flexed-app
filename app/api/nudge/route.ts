import { type NextRequest, NextResponse } from "next/server"

const NUDGE_MESSAGES = [
  {
    show: true,
    message: "missed a few days? try a 10-min reset.",
    cta: "do a tiny thing",
  },
  {
    show: true,
    message: "feeling unmotivated? start with just 5 minutes.",
    cta: "do a tiny thing",
  },
  {
    show: true,
    message: "been a while? no judgment. let's ease back in.",
    cta: "do a tiny thing",
  },
]

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 })
    }

    // Randomly show nudge or not (70% chance to show)
    const shouldShow = Math.random() > 0.3

    if (!shouldShow) {
      return NextResponse.json({ show: false })
    }

    // Return random nudge message
    const randomNudge = NUDGE_MESSAGES[Math.floor(Math.random() * NUDGE_MESSAGES.length)]

    return NextResponse.json(randomNudge)
  } catch (error) {
    return NextResponse.json({ message: "something went wrong" }, { status: 500 })
  }
}

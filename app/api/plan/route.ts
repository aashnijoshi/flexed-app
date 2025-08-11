import { type NextRequest, NextResponse } from "next/server"

const MOCK_WORKOUTS = {
  mon: {
    title: "push day",
    exercises: [
      { name: "push-ups", sets: 3, reps: 12, equipment: "bodyweight" },
      { name: "overhead press", sets: 4, reps: 8, equipment: "dumbbells" },
      { name: "chest press", sets: 3, reps: 10, equipment: "dumbbells" },
      { name: "tricep dips", sets: 3, reps: 15, equipment: "bodyweight" },
    ],
    completed: false,
  },
  tue: {
    title: "cardio",
    exercises: [
      { name: "jumping jacks", duration: "2 min", equipment: "bodyweight" },
      { name: "burpees", sets: 3, reps: 10, equipment: "bodyweight" },
      { name: "mountain climbers", duration: "1 min", equipment: "bodyweight" },
      { name: "high knees", duration: "30 sec", equipment: "bodyweight" },
    ],
    completed: true,
  },
  wed: {
    title: "pull day",
    exercises: [
      { name: "bent-over rows", sets: 4, reps: 10, equipment: "dumbbells" },
      { name: "pull-ups", sets: 3, reps: 8, equipment: "bodyweight" },
      { name: "bicep curls", sets: 3, reps: 12, equipment: "dumbbells" },
      { name: "reverse flies", sets: 3, reps: 15, equipment: "dumbbells" },
    ],
    completed: false,
  },
  thu: {
    title: "active recovery",
    exercises: [
      { name: "walking", duration: "20 min", equipment: "bodyweight" },
      { name: "stretching", duration: "10 min", equipment: "bodyweight" },
      { name: "foam rolling", duration: "5 min", equipment: "bodyweight" },
    ],
    completed: false,
  },
  fri: {
    title: "legs",
    exercises: [
      { name: "squats", sets: 4, reps: 15, equipment: "bodyweight" },
      { name: "lunges", sets: 3, reps: 12, equipment: "bodyweight" },
      { name: "calf raises", sets: 3, reps: 20, equipment: "bodyweight" },
      { name: "glute bridges", sets: 3, reps: 15, equipment: "bodyweight" },
    ],
    completed: false,
  },
  sat: {
    title: "full body",
    exercises: [
      { name: "deadlifts", sets: 3, reps: 8, equipment: "dumbbells" },
      { name: "thrusters", sets: 3, reps: 10, equipment: "dumbbells" },
      { name: "plank", duration: "1 min", equipment: "bodyweight" },
      { name: "russian twists", sets: 3, reps: 20, equipment: "bodyweight" },
    ],
    completed: false,
  },
  sun: null, // rest day
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")
    const day = searchParams.get("day")

    // If requesting specific day workout
    if (day && MOCK_WORKOUTS[day as keyof typeof MOCK_WORKOUTS]) {
      const workout = MOCK_WORKOUTS[day as keyof typeof MOCK_WORKOUTS]
      if (!workout) {
        return NextResponse.json({ message: "rest day - no workout planned" }, { status: 404 })
      }

      return NextResponse.json({
        ...workout,
        date: date || new Date().toISOString().split("T")[0],
      })
    }

    // Return full week plan
    return NextResponse.json(MOCK_WORKOUTS)
  } catch (error) {
    return NextResponse.json({ message: "something went wrong" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"

const ALTERNATIVE_EXERCISES = {
  push: [
    { name: "incline push-ups", sets: 3, reps: 10, equipment: "bodyweight" },
    { name: "diamond push-ups", sets: 2, reps: 8, equipment: "bodyweight" },
    { name: "shoulder press", sets: 3, reps: 12, equipment: "dumbbells" },
    { name: "chest flies", sets: 3, reps: 10, equipment: "dumbbells" },
  ],
  pull: [
    { name: "inverted rows", sets: 3, reps: 10, equipment: "bodyweight" },
    { name: "face pulls", sets: 3, reps: 15, equipment: "dumbbells" },
    { name: "hammer curls", sets: 3, reps: 12, equipment: "dumbbells" },
    { name: "lat pulldowns", sets: 3, reps: 10, equipment: "dumbbells" },
  ],
  legs: [
    { name: "goblet squats", sets: 3, reps: 12, equipment: "dumbbells" },
    { name: "step-ups", sets: 3, reps: 10, equipment: "bodyweight" },
    { name: "single-leg deadlifts", sets: 3, reps: 8, equipment: "dumbbells" },
    { name: "wall sits", duration: "45 sec", equipment: "bodyweight" },
  ],
  cardio: [
    { name: "jump rope", duration: "3 min", equipment: "bodyweight" },
    { name: "squat jumps", sets: 3, reps: 15, equipment: "bodyweight" },
    { name: "plank jacks", sets: 3, reps: 20, equipment: "bodyweight" },
    { name: "running in place", duration: "2 min", equipment: "bodyweight" },
  ],
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 })
    }

    const { date } = await request.json()

    if (!date) {
      return NextResponse.json({ message: "date is required" }, { status: 400 })
    }

    // Generate new random workout
    const workoutTypes = Object.keys(ALTERNATIVE_EXERCISES)
    const randomType = workoutTypes[Math.floor(Math.random() * workoutTypes.length)]
    const exercises = ALTERNATIVE_EXERCISES[randomType as keyof typeof ALTERNATIVE_EXERCISES]

    // Shuffle and pick 3-4 exercises
    const shuffled = [...exercises].sort(() => 0.5 - Math.random())
    const selectedExercises = shuffled.slice(0, Math.floor(Math.random() * 2) + 3)

    const newWorkout = {
      title: `${randomType} day (regenerated)`,
      exercises: selectedExercises,
      completed: false,
      date,
    }

    return NextResponse.json(newWorkout)
  } catch (error) {
    return NextResponse.json({ message: "something went wrong" }, { status: 500 })
  }
}

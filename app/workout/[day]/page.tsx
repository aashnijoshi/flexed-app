"use client"

import { Skeleton } from "@/components/ui/skeleton"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ArrowLeft, RotateCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import confetti from "canvas-confetti"

interface Exercise {
  name: string
  sets?: number
  reps?: number
  duration?: string
  equipment?: string
}

interface WorkoutData {
  title: string
  exercises: Exercise[]
  completed: boolean
  date: string
}

const DAY_LABELS: { [key: string]: string } = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
}

export default function WorkoutDayPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const day = params.day as string

  const [workout, setWorkout] = useState<WorkoutData | null>(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [notes, setNotes] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [regenerated, setRegenerated] = useState(false)

  // Get the nearest occurrence of this day
  const getNearestDayDate = (dayName: string) => {
    const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]
    const targetDay = days.indexOf(dayName)
    const today = new Date()
    const currentDay = today.getDay()

    let daysUntilTarget = targetDay - currentDay
    if (daysUntilTarget < 0) daysUntilTarget += 7

    const targetDate = new Date(today)
    targetDate.setDate(today.getDate() + daysUntilTarget)

    return targetDate.toISOString().split("T")[0]
  }

  useEffect(() => {
    if (!day) return

    const defaultDate = getNearestDayDate(day)
    setSelectedDate(defaultDate)
    loadWorkout(defaultDate)
  }, [day])

  const loadWorkout = async (date: string) => {
    setLoading(true)
    try {
      const token = localStorage.getItem("kf_token")
      const response = await fetch(`/api/plan?date=${date}&day=${day}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setWorkout(data)
      } else {
        toast({
          title: "couldn't load workout",
          description: "try going back and selecting again",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "something went wrong",
        description: "check your connection and try again",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    if (!workout) return

    setCompleting(true)
    try {
      const token = localStorage.getItem("kf_token")
      const response = await fetch("/api/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: selectedDate,
          day_name: day,
          notes: notes.trim() || undefined,
        }),
      })

      if (response.ok) {
        // Trigger confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        })

        setWorkout((prev) => (prev ? { ...prev, completed: true } : null))
        setShowNotesModal(false)
        setNotes("")

        toast({
          title: "nice. 🎉",
          description: "workout marked as complete",
        })
      } else {
        throw new Error("Failed to complete workout")
      }
    } catch (err) {
      toast({
        title: "couldn't mark complete",
        description: "try again in a moment",
        variant: "destructive",
      })
    } finally {
      setCompleting(false)
    }
  }

  const handleRegenerate = async () => {
    setRegenerating(true)
    try {
      const token = localStorage.getItem("kf_token")
      const response = await fetch("/api/regenerate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ date: selectedDate }),
      })

      if (response.ok) {
        const newWorkout = await response.json()
        setWorkout(newWorkout)
        setRegenerated(true)

        toast({
          title: "rerolled!",
          description: "fresh exercises loaded",
        })

        // Hide the regenerated chip after a few seconds
        setTimeout(() => setRegenerated(false), 3000)
      } else {
        throw new Error("Failed to regenerate workout")
      }
    } catch (err) {
      toast({
        title: "couldn't regenerate",
        description: "try again later",
        variant: "destructive",
      })
    } finally {
      setRegenerating(false)
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <WorkoutSkeleton />
        </div>
      </AppShell>
    )
  }

  if (!workout) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">workout not found</h1>
            <p className="text-gray-600">couldn't load the workout for this day</p>
            <Button asChild className="rounded-xl">
              <Link href="/dashboard">back to dashboard</Link>
            </Button>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button asChild variant="ghost" size="sm" className="rounded-xl">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                dashboard
              </Link>
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Day and Date */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <h1 className="text-2xl font-bold">{DAY_LABELS[day]}</h1>
              {regenerated && (
                <Badge variant="secondary" className="rounded-full">
                  rerolled
                </Badge>
              )}
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value)
                loadWorkout(e.target.value)
              }}
              className="text-sm text-gray-600 bg-transparent border-none text-center"
            />
            <h2 className="text-lg font-semibold text-gray-900">{workout.title}</h2>
          </div>

          {/* Completed State */}
          {workout.completed && (
            <Card className="rounded-2xl shadow-sm border-green-200 bg-green-50">
              <CardContent className="p-4 text-center">
                <div className="space-y-2">
                  <div className="text-2xl">✅</div>
                  <h3 className="font-semibold text-green-900">workout completed!</h3>
                  <p className="text-sm text-green-700">nice work on this one</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Exercise List */}
          <div className="space-y-4">
            {workout.exercises.map((exercise, index) => (
              <Card key={index} className="rounded-2xl shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{exercise.name}</h3>
                      <div className="flex items-center space-x-4 mt-1">
                        {exercise.sets && exercise.reps && (
                          <span className="text-sm text-gray-600">
                            {exercise.sets} × {exercise.reps}
                          </span>
                        )}
                        {exercise.duration && <span className="text-sm text-gray-600">{exercise.duration}</span>}
                      </div>
                    </div>
                    {exercise.equipment && (
                      <Badge variant="outline" className="rounded-full text-xs">
                        {exercise.equipment}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sticky Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="max-w-2xl mx-auto flex space-x-3">
            <Button
              variant="outline"
              onClick={handleRegenerate}
              disabled={regenerating || workout.completed}
              className="flex-1 rounded-xl bg-transparent"
            >
              <RotateCcw className={`h-4 w-4 mr-2 ${regenerating ? "animate-spin" : ""}`} />
              {regenerating ? "rerolling..." : "regenerate"}
            </Button>

            <Dialog open={showNotesModal} onOpenChange={setShowNotesModal}>
              <DialogTrigger asChild>
                <Button disabled={workout.completed} className="flex-1 rounded-xl">
                  mark complete
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                  <DialogTitle>complete workout</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="notes">notes (optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="how did it feel? any thoughts?"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="mt-1 rounded-xl"
                      rows={3}
                    />
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowNotesModal(false)}
                      className="flex-1 rounded-xl bg-transparent"
                    >
                      cancel
                    </Button>
                    <Button onClick={handleComplete} disabled={completing} className="flex-1 rounded-xl">
                      {completing ? "completing..." : "complete"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

function WorkoutSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="text-center space-y-2">
        <Skeleton className="h-8 w-32 mx-auto" />
        <Skeleton className="h-4 w-24 mx-auto" />
        <Skeleton className="h-6 w-40 mx-auto" />
      </div>

      {/* Exercise skeletons */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

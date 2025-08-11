"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Play, Pause, RotateCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface QuickWorkoutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Exercise {
  name: string
  duration?: string
  reps?: number
}

interface QuickWorkoutData {
  title: string
  exercises: Exercise[]
  totalDuration: number
}

export function QuickWorkoutModal({ open, onOpenChange }: QuickWorkoutModalProps) {
  const [workout, setWorkout] = useState<QuickWorkoutData | null>(null)
  const [checkedExercises, setCheckedExercises] = useState<boolean[]>([])
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Load quick workout data when modal opens
  useEffect(() => {
    if (open && !workout) {
      loadQuickWorkout()
    }
  }, [open])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsRunning(false)
      toast({
        title: "time's up!",
        description: "great job on your quick reset",
      })
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft, toast])

  const loadQuickWorkout = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("kf_token")
      const response = await fetch("/api/nudge", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()

        // Mock quick workout if no suggestion provided
        const quickWorkout = data.suggestion || {
          title: "10-minute reset",
          exercises: [
            { name: "deep breathing", duration: "2 min" },
            { name: "gentle stretches", duration: "3 min" },
            { name: "bodyweight squats", reps: 10 },
            { name: "wall push-ups", reps: 8 },
            { name: "walking in place", duration: "2 min" },
            { name: "mindful cooldown", duration: "1 min" },
          ],
          totalDuration: 600,
        }

        setWorkout(quickWorkout)
        setCheckedExercises(new Array(quickWorkout.exercises.length).fill(false))
      }
    } catch (err) {
      console.error("Failed to load quick workout:", err)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const toggleExercise = (index: number) => {
    const newChecked = [...checkedExercises]
    newChecked[index] = !newChecked[index]
    setCheckedExercises(newChecked)
  }

  const startTimer = () => setIsRunning(true)
  const pauseTimer = () => setIsRunning(false)
  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(600)
    setCheckedExercises(new Array(workout?.exercises.length || 0).fill(false))
  }

  const handleComplete = async () => {
    try {
      const token = localStorage.getItem("kf_token")
      await fetch("/api/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: new Date().toISOString().split("T")[0],
          day_name: "quick_reset",
          notes: "quick-mode",
        }),
      })

      setCompleted(true)
      toast({
        title: "nice work! 🎉",
        description: "quick reset completed",
      })

      // Auto-close after celebration
      setTimeout(() => {
        onOpenChange(false)
        resetModal()
      }, 2000)
    } catch (err) {
      toast({
        title: "couldn't save",
        description: "but you still did great!",
        variant: "destructive",
      })
    }
  }

  const resetModal = () => {
    setWorkout(null)
    setCompleted(false)
    setIsRunning(false)
    setTimeLeft(600)
    setCheckedExercises([])
  }

  const handleClose = () => {
    onOpenChange(false)
    resetModal()
  }

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md rounded-2xl glass border-glass-border animate-scale-in">
          <div className="text-center py-8 space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue mx-auto"></div>
            <p className="text-muted-foreground">loading your reset...</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-2xl glass border-glass-border animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{workout?.title || "10-minute reset"}</DialogTitle>
        </DialogHeader>

        {completed ? (
          <div className="text-center py-8 space-y-4 animate-fade-in">
            <div className="text-4xl">🎉</div>
            <div>
              <h3 className="font-semibold text-lg">you did it!</h3>
              <p className="text-sm text-muted-foreground">momentum is building</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Timer */}
            <Card className="rounded-xl glass border-glass-border">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold font-mono text-brand-blue mb-4">{formatTime(timeLeft)}</div>
                <div className="flex justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={isRunning ? pauseTimer : startTimer}
                    className="rounded-lg glass border-glass-border animate-press focus-ring bg-transparent"
                  >
                    {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetTimer}
                    className="rounded-lg glass border-glass-border animate-press focus-ring bg-transparent"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Exercise List */}
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">check off as you go</p>
              {workout?.exercises.map((exercise, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 rounded-xl glass border-glass-border animate-hover"
                >
                  <Checkbox
                    checked={checkedExercises[index]}
                    onCheckedChange={() => toggleExercise(index)}
                    className="focus-ring"
                  />
                  <div className="flex-1">
                    <span className={`text-sm ${checkedExercises[index] ? "line-through text-muted-foreground" : ""}`}>
                      {exercise.name}
                    </span>
                    {(exercise.duration || exercise.reps) && (
                      <span className="text-xs text-muted-foreground ml-2">
                        {exercise.duration || `${exercise.reps} reps`}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 rounded-xl glass border-glass-border animate-press focus-ring bg-transparent"
              >
                maybe later
              </Button>
              <Button
                onClick={handleComplete}
                className="flex-1 rounded-xl gradient-brand text-white animate-press focus-ring"
              >
                complete reset
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

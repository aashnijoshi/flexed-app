"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

const STEPS = ["fitness level", "your goal", "available days", "workout time", "equipment"]

const FITNESS_LEVELS = [
  { value: "beginner", label: "beginner", desc: "new to this whole thing" },
  { value: "intermediate", label: "intermediate", desc: "been around the block" },
  { value: "advanced", label: "advanced", desc: "basically a gym rat" },
]

const GOALS = [
  { value: "strength", label: "strength", desc: "get stronger" },
  { value: "weight_loss", label: "weight loss", desc: "shed some pounds" },
  { value: "general", label: "general fitness", desc: "just feel better" },
]

const DAYS = [
  { value: "mon", label: "mon" },
  { value: "tue", label: "tue" },
  { value: "wed", label: "wed" },
  { value: "thu", label: "thu" },
  { value: "fri", label: "fri" },
  { value: "sat", label: "sat" },
  { value: "sun", label: "sun" },
]

const EQUIPMENT = [
  { value: "dumbbells", label: "dumbbells" },
  { value: "machines", label: "machines" },
  { value: "bodyweight", label: "bodyweight" },
]

interface Preferences {
  fitness_level?: string
  goal?: string
  available_days?: string[]
  workout_duration?: number
  equipment?: string[]
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [preferences, setPreferences] = useState<Preferences>({
    available_days: [],
    workout_duration: 40,
    equipment: [],
  })
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Load existing preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const token = localStorage.getItem("kf_token")
        if (!token) {
          setInitialLoading(false)
          return
        }

        const response = await fetch("/api/preferences", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const data = await response.json()
          setPreferences((prev) => ({ ...prev, ...data }))
        }
      } catch (err) {
        console.error("Failed to load preferences:", err)
      } finally {
        setInitialLoading(false)
      }
    }

    loadPreferences()
  }, [])

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return !!preferences.fitness_level
      case 1:
        return !!preferences.goal
      case 2:
        return (preferences.available_days?.length || 0) >= 2
      case 3:
        return true // slider always has a value
      case 4:
        return (preferences.equipment?.length || 0) > 0
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleFinish()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFinish = async () => {
    setLoading(true)

    try {
      const token = localStorage.getItem("kf_token")
      const method = preferences.fitness_level ? "PUT" : "POST"

      const response = await fetch("/api/preferences", {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(preferences),
      })

      if (!response.ok) throw new Error("Failed to save preferences")

      toast({
        title: "preferences saved!",
        description: "let's see what we can do together",
      })

      router.push("/dashboard")
    } catch (err) {
      toast({
        title: "oops",
        description: "couldn't save your preferences. try again?",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    toast({
      title: "skipped for now",
      description: "some features will be empty, but you can set this up later",
    })
    router.push("/dashboard")
  }

  if (initialLoading) {
    return (
      <AppShell showBackButton>
        <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="text-gray-600">loading your vibe...</p>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell showBackButton>
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-lg rounded-2xl shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="space-y-2">
              <CardTitle className="text-2xl">let's set up your vibe</CardTitle>
              <p className="text-sm text-gray-500">no pressure. you can edit this later.</p>
            </div>

            {/* Progress Stepper */}
            <div className="flex justify-center">
              <div className="flex items-center space-x-2">
                {STEPS.map((_, index) => (
                  <div key={index} className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${index <= currentStep ? "bg-gray-900" : "bg-gray-200"}`} />
                    {index < STEPS.length - 1 && (
                      <div className={`w-8 h-0.5 ${index < currentStep ? "bg-gray-900" : "bg-gray-200"}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <p className="text-sm font-medium text-gray-700">
              {STEPS[currentStep]} ({currentStep + 1}/{STEPS.length})
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {currentStep === 0 && (
              <FitnessLevelStep
                value={preferences.fitness_level}
                onChange={(value) => setPreferences((prev) => ({ ...prev, fitness_level: value }))}
              />
            )}

            {currentStep === 1 && (
              <GoalStep
                value={preferences.goal}
                onChange={(value) => setPreferences((prev) => ({ ...prev, goal: value }))}
              />
            )}

            {currentStep === 2 && (
              <AvailableDaysStep
                value={preferences.available_days || []}
                onChange={(value) => setPreferences((prev) => ({ ...prev, available_days: value }))}
              />
            )}

            {currentStep === 3 && (
              <WorkoutTimeStep
                value={preferences.workout_duration || 40}
                onChange={(value) => setPreferences((prev) => ({ ...prev, workout_duration: value }))}
              />
            )}

            {currentStep === 4 && (
              <EquipmentStep
                value={preferences.equipment || []}
                onChange={(value) => setPreferences((prev) => ({ ...prev, equipment: value }))}
              />
            )}

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="rounded-xl bg-transparent"
              >
                back
              </Button>

              <div className="flex gap-2">
                <Button variant="ghost" onClick={handleSkip} className="rounded-xl text-gray-500">
                  skip for now
                </Button>

                <Button onClick={handleNext} disabled={!isStepValid() || loading} className="rounded-xl">
                  {loading ? "saving..." : currentStep === STEPS.length - 1 ? "save my vibe" : "next"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}

function FitnessLevelStep({ value, onChange }: { value?: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">what's your fitness level?</Label>
      <div className="space-y-3">
        {FITNESS_LEVELS.map((level) => (
          <button
            key={level.value}
            onClick={() => onChange(level.value)}
            className={`w-full p-4 rounded-xl border-2 text-left transition-colors ${
              value === level.value ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="font-medium">{level.label}</div>
            <div className="text-sm text-gray-500">{level.desc}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

function GoalStep({ value, onChange }: { value?: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">what's your main goal?</Label>
      <div className="space-y-3">
        {GOALS.map((goal) => (
          <button
            key={goal.value}
            onClick={() => onChange(goal.value)}
            className={`w-full p-4 rounded-xl border-2 text-left transition-colors ${
              value === goal.value ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="font-medium">{goal.label}</div>
            <div className="text-sm text-gray-500">{goal.desc}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

function AvailableDaysStep({ value, onChange }: { value: string[]; onChange: (value: string[]) => void }) {
  const toggleDay = (day: string) => {
    if (value.includes(day)) {
      onChange(value.filter((d) => d !== day))
    } else {
      onChange([...value, day])
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-medium">which days work for you?</Label>
        <p className="text-sm text-gray-500 mt-1">pick at least 2 days</p>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {DAYS.map((day) => (
          <button
            key={day.value}
            onClick={() => toggleDay(day.value)}
            className={`p-3 rounded-xl border-2 text-center transition-colors ${
              value.includes(day.value) ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-300"
            }`}
          >
            {day.label}
          </button>
        ))}
      </div>
      {value.length > 0 && value.length < 2 && <p className="text-sm text-red-500">please select at least 2 days</p>}
    </div>
  )
}

function WorkoutTimeStep({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">how long per workout?</Label>
        <p className="text-sm text-gray-500 mt-1">be realistic with yourself</p>
      </div>

      <div className="space-y-4">
        <div className="text-center">
          <span className="text-2xl font-bold">~{value} min</span>
        </div>

        <Slider
          value={[value]}
          onValueChange={(values) => onChange(values[0])}
          min={20}
          max={90}
          step={5}
          className="w-full"
        />

        <div className="flex justify-between text-xs text-gray-500">
          <span>20 min</span>
          <span>90 min</span>
        </div>
      </div>
    </div>
  )
}

function EquipmentStep({ value, onChange }: { value: string[]; onChange: (value: string[]) => void }) {
  const toggleEquipment = (equipment: string) => {
    if (value.includes(equipment)) {
      onChange(value.filter((e) => e !== equipment))
    } else {
      onChange([...value, equipment])
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-medium">what equipment do you have access to?</Label>
        <p className="text-sm text-gray-500 mt-1">select all that apply</p>
      </div>
      <div className="space-y-3">
        {EQUIPMENT.map((equipment) => (
          <button
            key={equipment.value}
            onClick={() => toggleEquipment(equipment.value)}
            className={`w-full p-4 rounded-xl border-2 text-left transition-colors ${
              value.includes(equipment.value) ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="font-medium">{equipment.label}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

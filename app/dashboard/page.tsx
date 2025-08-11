"use client"

import { useEffect, useState } from "react"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { QuickWorkoutModal } from "@/components/quick-workout-modal"

interface WorkoutPlan {
  [key: string]: {
    title: string
    exercises: Array<{
      name: string
      sets?: number
      reps?: number
      duration?: string
    }>
    completed: boolean
  }
}

interface NudgeData {
  show: boolean
  message: string
  cta: string
}

interface StreakData {
  days: number
}

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
const DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [planLoading, setPlanLoading] = useState(false)
  const [plan, setPlan] = useState<WorkoutPlan | null>(null)
  const [nudge, setNudge] = useState<NudgeData | null>(null)
  const [streak, setStreak] = useState<StreakData | null>(null)
  const [showNudge, setShowNudge] = useState(true)
  const [showQuickWorkout, setShowQuickWorkout] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const today = new Date()
  const todayFormatted = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  useEffect(() => {
    const token = localStorage.getItem("kf_token")
    if (!token) {
      router.push("/login")
      return
    }

    loadDashboardData()
  }, [router])

  const loadDashboardData = async () => {
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("kf_token")
      const headers = { Authorization: `Bearer ${token}` }

      // Load all dashboard data in parallel
      const [planRes, nudgeRes, streakRes] = await Promise.all([
        fetch("/api/plan", { headers }),
        fetch("/api/nudge", { headers }),
        fetch("/api/streak", { headers }),
      ])

      // Handle plan data
      if (planRes.status === 400) {
        setError("preferences_needed")
      } else if (planRes.ok) {
        const planData = await planRes.json()
        setPlan(planData)
      }

      // Handle nudge data
      if (nudgeRes.ok) {
        const nudgeData = await nudgeRes.json()
        setNudge(nudgeData)
      }

      // Handle streak data
      if (streakRes.ok) {
        const streakData = await streakRes.json()
        setStreak(streakData)
      }
    } catch (err) {
      console.error("Failed to load dashboard:", err)
      toast({
        title: "something went wrong",
        description: "couldn't load your dashboard. try refreshing?",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshPlan = async () => {
    setPlanLoading(true)
    try {
      const token = localStorage.getItem("kf_token")
      const response = await fetch("/api/plan", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.status === 400) {
        setError("preferences_needed")
      } else if (response.ok) {
        const planData = await response.json()
        setPlan(planData)
        setError("")
        toast({
          title: "refreshed",
          description: "your plan is up to date",
        })
      }
    } catch (err) {
      toast({
        title: "refresh failed",
        description: "couldn't update your plan",
        variant: "destructive",
      })
    } finally {
      setPlanLoading(false)
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
          <DashboardSkeleton />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold">hey, welcome back 👋</h1>
            <p className="text-sm text-muted-foreground">{todayFormatted}</p>
          </div>

          {/* Streak Chip */}
          {streak && (
            <Badge variant="secondary" className="px-4 py-2 rounded-full glass border-glass-border animate-scale-in">
              streak: {streak.days} days
            </Badge>
          )}
        </div>

        {/* Nudge Banner */}
        {nudge?.show && showNudge && (
          <Card className="rounded-2xl glass border-orange-200/50 bg-gradient-to-r from-orange-50/80 to-amber-50/80 animate-slide-up">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-orange-800/90 mb-3 leading-relaxed">{nudge.message}</p>
                  <Button
                    size="sm"
                    onClick={() => setShowQuickWorkout(true)}
                    className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white animate-press focus-ring"
                  >
                    {nudge.cta}
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNudge(false)}
                  className="ml-4 h-8 w-8 p-0 rounded-full animate-press focus-ring"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weekly Plan */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">this week's plan</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshPlan}
              disabled={planLoading}
              className="rounded-xl glass border-glass-border animate-press focus-ring bg-transparent"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${planLoading ? "animate-spin" : ""}`} />
              refresh
            </Button>
          </div>

          {error === "preferences_needed" ? (
            <PreferencesNeededCard />
          ) : plan ? (
            <WeeklyPlanGrid plan={plan} />
          ) : (
            <EmptyPlanCard />
          )}
        </div>
      </div>

      <QuickWorkoutModal open={showQuickWorkout} onOpenChange={setShowQuickWorkout} />
    </AppShell>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-4 w-48 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>

      {/* Plan grid skeleton */}
      <div className="space-y-6">
        <Skeleton className="h-8 w-40 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Card key={i} className="rounded-2xl glass">
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-12 rounded-lg" />
                <Skeleton className="h-5 w-20 rounded-lg" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-3 w-full rounded-md" />
                <Skeleton className="h-3 w-3/4 rounded-md" />
                <Skeleton className="h-3 w-1/2 rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

function PreferencesNeededCard() {
  return (
    <Card className="rounded-2xl glass border-blue-200/50 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 animate-scale-in">
      <CardContent className="p-8 text-center space-y-4">
        <div>
          <h3 className="font-semibold text-blue-900">set your preferences first</h3>
          <p className="text-sm text-blue-700/80 mt-2 leading-relaxed">
            we need to know your vibe before we can make a plan
          </p>
        </div>
        <Button
          asChild
          className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white animate-press focus-ring"
        >
          <Link href="/onboarding">set up preferences</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function EmptyPlanCard() {
  return (
    <Card className="rounded-2xl glass animate-scale-in">
      <CardContent className="p-8 text-center space-y-4">
        <div>
          <h3 className="font-semibold text-foreground">no plan yet</h3>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            looks like your plan is empty. try refreshing or check your preferences
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          className="rounded-xl glass border-glass-border animate-press focus-ring bg-transparent"
        >
          <Link href="/profile">check preferences</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function WeeklyPlanGrid({ plan }: { plan: WorkoutPlan }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
      {DAYS.map((day, index) => {
        const dayPlan = plan[day]
        const dayLabel = DAY_LABELS[index]

        return (
          <Link key={day} href={`/workout/${day}`}>
            <Card className="rounded-2xl glass border-glass-border hover:border-brand-blue/30 transition-all duration-200 cursor-pointer h-full animate-hover group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{day}</p>
                  {dayPlan?.completed && (
                    <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-scale-in"></div>
                  )}
                </div>
                <CardTitle className="text-sm font-semibold group-hover:text-brand-blue transition-colors">
                  {dayPlan?.title || "rest day"}
                </CardTitle>
              </CardHeader>

              {dayPlan && (
                <CardContent className="pt-0">
                  <div className="space-y-1">
                    {dayPlan.exercises.slice(0, 2).map((exercise, i) => (
                      <p key={i} className="text-xs text-muted-foreground leading-relaxed">
                        • {exercise.name}
                      </p>
                    ))}
                    {dayPlan.exercises.length > 2 && (
                      <p className="text-xs text-muted-foreground/70">+{dayPlan.exercises.length - 2} more</p>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          </Link>
        )
      })}
    </div>
  )
}

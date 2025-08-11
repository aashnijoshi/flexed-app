import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function LandingPage() {
  return (
    <AppShell>
      <div className="min-h-screen flex flex-col">
        {/* Hero Section */}
        <section className="flex-1 flex items-center justify-center px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center space-y-8 animate-slide-up">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight text-center">
                workouts that meet u where u are  
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                for every version of your gym era. 
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button
                asChild
                size="lg"
                className="rounded-2xl px-8 py-4 text-base gradient-brand text-white animate-press animate-hover focus-ring"
              >
                <Link href="/onboarding">get started</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-2xl px-8 py-4 text-base glass animate-press animate-hover focus-ring bg-transparent"
              >
                <Link href="/login">sign in</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Auth State Check */}
        <AuthStateCard />
      </div>
    </AppShell>
  )
}

function AuthStateCard() {
  const hasToken = typeof window !== "undefined" && localStorage.getItem("kf_token")

  if (!hasToken) return null

  return (
    <div className="px-4 pb-8 animate-scale-in">
      <Card className="max-w-md mx-auto p-6 rounded-2xl glass border-glass-border animate-hover">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">welcome back</p>
          <Button asChild className="rounded-2xl gradient-brand text-white animate-press focus-ring">
            <Link href="/dashboard">continue to dashboard</Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}

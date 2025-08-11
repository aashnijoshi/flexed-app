"use client"

import type React from "react"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  return (
    <AppShell showBackButton>
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md rounded-2xl shadow-lg">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl">welcome back :)</CardTitle>
            <CardDescription>sign in to your account or create a new one</CardDescription>
          </CardHeader>
          <CardContent>
            <AuthTabs />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}

function AuthTabs() {
  const [activeTab, setActiveTab] = useState("login")

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-2 rounded-xl">
        <TabsTrigger value="login" className="rounded-lg">
          log in
        </TabsTrigger>
        <TabsTrigger value="signup" className="rounded-lg">
          sign up
        </TabsTrigger>
      </TabsList>

      <TabsContent value="login" className="mt-6">
        <LoginForm />
      </TabsContent>

      <TabsContent value="signup" className="mt-6">
        <SignupForm onSuccess={() => setActiveTab("login")} />
      </TabsContent>
    </Tabs>
  )
}

function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const isValid = email.includes("@") && password.length >= 6

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "login failed")
      }

      localStorage.setItem("kf_token", data.token)

      toast({
        title: "welcome back!",
        description: "let's get moving (maybe)",
      })

      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="login-email">email</Label>
        <Input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl"
          placeholder="your@email.com"
        />
        {email && !email.includes("@") && <p className="text-sm text-red-500">please enter a valid email</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-password">password</Label>
        <Input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-xl"
          placeholder="••••••••"
        />
        {password && password.length < 6 && (
          <p className="text-sm text-red-500">password must be at least 6 characters</p>
        )}
      </div>

      <Button type="submit" className="w-full rounded-xl" disabled={!isValid || loading}>
        {loading ? "signing in..." : "log in"}
      </Button>

      <p className="text-sm text-gray-500 text-center">
        forgot password? <span className="text-gray-400">(not yet. soon.)</span>
      </p>
    </form>
  )
}

function SignupForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()

  const isValid = email.includes("@") && password.length >= 6

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "signup failed")
      }

      toast({
        title: "account created!",
        description: "now log in and let's do this",
      })

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="signup-email">email</Label>
        <Input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl"
          placeholder="your@email.com"
        />
        {email && !email.includes("@") && <p className="text-sm text-red-500">please enter a valid email</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-password">password</Label>
        <Input
          id="signup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-xl"
          placeholder="••••••••"
        />
        {password && password.length < 6 && (
          <p className="text-sm text-red-500">password must be at least 6 characters</p>
        )}
      </div>

      <Button type="submit" className="w-full rounded-xl" disabled={!isValid || loading}>
        {loading ? "creating account..." : "sign up"}
      </Button>
    </form>
  )
}

import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface AppShellProps {
  children: React.ReactNode
  showBackButton?: boolean
  backHref?: string
}

export function AppShell({ children, showBackButton = false, backHref = "/" }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      <Header showBackButton={showBackButton} backHref={backHref} />
      <main className="pb-16 animate-fade-in">{children}</main>
      <Footer />
    </div>
  )
}

function Header({ showBackButton, backHref }: { showBackButton: boolean; backHref: string }) {
  return (
    <header className="sticky top-0 z-50 glass border-b border-glass-border">
      <Container>
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <Button asChild variant="ghost" size="sm" className="rounded-xl animate-press focus-ring">
                <Link href={backHref}>← back</Link>
              </Button>
            )}
            <Link href="/" className="text-xl font-bold text-foreground tracking-tight">
              flexed
            </Link>
          </div>

          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="rounded-xl animate-press focus-ring">
              <Link href="/login">sign in</Link>
            </Button>
            <Button asChild size="sm" className="rounded-xl gradient-brand text-white animate-press focus-ring">
              <Link href="/onboarding">get started</Link>
            </Button>
          </nav>
        </div>
      </Container>
    </header>
  )
}

function Footer() {
  return (
    <footer className="border-t border-border/50 py-8 mt-16">
      <Container>
        <div className="text-center text-sm text-muted-foreground">
          <p>made for how you actually train</p>
        </div>
      </Container>
    </footer>
  )
}

export function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
}

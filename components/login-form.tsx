"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Sparkles } from "lucide-react"
import Image from "next/image"

interface LoginFormProps {
  onLogin: (email: string, name: string) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      })

      if (response.ok) {
        onLogin(email, name)
      }
    } catch (error) {
      console.error("Login error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-border bg-background p-8 shadow-lg">
        <div className="flex flex-col items-center gap-3">
          <div className="flex min-h-10 min-w-10 items-center justify-center rounded-lg bg-red-900">
            <Image src="/logo.png" alt="logo" width={10} height={10} className="min-h-10 min-w-10" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold">Welcome to Dora</h1>
            <p className="text-sm text-muted">Your AI Social Media Assistant</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-(--color-primary) hover:bg-(--color-primary-hover)"
            disabled={isLoading}
          >
            {isLoading ? "Getting Started..." : "Get Started"}
          </Button>
        </form>

        <p className="text-center text-xs text-muted">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}

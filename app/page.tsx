"use client"

import { useState, useEffect } from "react"
import { ChatInterface } from "@/components/chat-interface"
import { LoginForm } from "@/components/login-form"
import { useAuth } from "@/lib/hooks/use-auth"

export default function Home() {
  const { user, loading } = useAuth()
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      setShowLogin(true)
    }
  }, [user, loading])

  if (loading) return null

  if (showLogin) {
    return <LoginForm onLogin={() => setShowLogin(false)} />
  }

  return <ChatInterface />
}

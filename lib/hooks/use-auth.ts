"use client"

import { ClientUser } from "@/types/user"
import { useEffect, useState } from "react"
import { openOAuthPopup } from "../auth/oauth-popup"
import { useRouter } from "next/navigation"


export function useAuth() {
  const [user, setUser] = useState<ClientUser | null>(null)
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    fetchSession()
  }, [])

  const fetchSession = async () => {
    try {
      const response = await fetch("/api/auth/session")
      const data = await response.json()
      setUser(data.user)
    } catch (error) {
      console.error("Failed to fetch session:", error)
    } finally {
      setLoading(false)
    }
  }

  const connectAccount = async (platform: string) => {
    try {
      await openOAuthPopup(platform)
      // Refresh session after OAuth completes
      await fetchSession()
    } catch (error) {
      console.error("OAuth error:", error)
      alert(`Failed to connect ${platform}. Please try again.`)
    }
  }

  const disconnectAccount = async (platform: string) => {
    try {
      const response = await fetch("/api/auth/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      })

      if (response.ok) {
        await fetchSession()
      }
    } catch (error) {
      console.error("Failed to disconnect account:", error)
    }
  }

  const logout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })

      window.location.href = '/'
    } catch (error) {
      window.location.href = '/'
      console.error("Failed to disconnect account:", error)
    }
  }

  return {
    user,
    loading,
    connectAccount,
    disconnectAccount,
    refetch: fetchSession,
    logout
  }
}

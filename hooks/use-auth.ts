"use client"

import { useEffect, useState } from "react"
import { openOAuthPopup } from "@/lib/auth/oauth-popup"

interface User {
    id: string
    email: string
    name: string
    socialAccounts: Array<{
        platform: string
        profileId: string
        profileName: string
    }>
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
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
            console.error("[v0] Failed to fetch session:", error)
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
            console.error("[v0] OAuth error:", error)
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
            console.error("[v0] Failed to disconnect account:", error)
        }
    }

    return {
        user,
        loading,
        connectAccount,
        disconnectAccount,
        refetch: fetchSession,
    }
}

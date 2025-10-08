"use client"

import { useEffect, useState } from "react"
import type { AgentSettings } from "@/lib/db/settings"

export function useSettings() {
  const [settings, setSettings] = useState<AgentSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings")
      const data = await response.json()
      setSettings(data.settings)
    } catch (error) {
      console.error("Failed to fetch settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (updates: Partial<AgentSettings>) => {
    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        await fetchSettings()
        return true
      }
      return false
    } catch (error) {
      console.error("Failed to update settings:", error)
      return false
    }
  }

  return {
    settings,
    loading,
    updateSettings,
    refetch: fetchSettings,
  }
}

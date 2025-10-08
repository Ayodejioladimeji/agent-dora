"use client"

import type React from "react"
import { X, Linkedin, Twitter, Facebook } from "lucide-react"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { Switch } from "./ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Input } from "./ui/input"
import { MultiSelect } from "./ui/multi-select"
import { useAuth } from "@/lib/hooks/use-auth"
import { useSettings } from "@/lib/hooks/use-settings"
import { agentConfiguration } from "@/lib/agent-config"
import { Loading } from "./loading"
import { toast } from "./ui/use-toast"
import { showSuccess } from "@/lib/toast"

interface SettingsPanelProps {
  onClose: () => void
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { user, connectAccount, disconnectAccount } = useAuth()
  const { settings, updateSettings } = useSettings()

  const isConnected = (platform: string) => {
    return user?.socialAccounts.some((acc) => acc.platform === platform.toLowerCase())
  }

  const handleAccountAction = (platform: string) => {
    const platformLower = platform.toLowerCase()
    if (isConnected(platformLower)) {
      disconnectAccount(platformLower)
    } else {
      connectAccount(platformLower)
    }
  }

  const handleSettingChange = async (key: string, value: any) => {
    await updateSettings({ [key]: value })
    showSuccess("Settings Updated")
  }

  if (!settings) {
    return (
      <div className="w-96 border-l border-border bg-background">
        <div className="h-full flex flex-col items-center justify-center p-6">
          <Loading color="red-900" />
          <p className="text-sm text-muted">Loading settings</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-96 border-l border-border bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <h2 className="text-lg font-bold">Settings</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="h-[calc(100vh-73px)] overflow-y-auto p-6">
        <div className="space-y-6">
          {/* User Info */}
          {user && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold">Account</h3>
              <div className="rounded-lg bg-accent p-3">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted">{user.email}</p>
              </div>
            </div>
          )}

          {/* Connected Accounts */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold">Connected Accounts</h3>
            <div className="space-y-2">
              <AccountButton
                platform="LinkedIn"
                icon={<Linkedin className="h-4 w-4" />}
                connected={isConnected("linkedin")}
                onClick={() => handleAccountAction("linkedin")}
              />
              <AccountButton
                platform="Twitter"
                icon={<Twitter className="h-4 w-4" />}
                connected={isConnected("twitter")}
                onClick={() => handleAccountAction("twitter")}
              />
              <AccountButton
                platform="Facebook"
                icon={<Facebook className="h-4 w-4" />}
                connected={isConnected("facebook")}
                onClick={() => handleAccountAction("facebook")}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold">Agent Preferences</h3>

            {agentConfiguration.map((field) => {
              const value = settings[field.label] ?? field.default

              return (
                <div key={field.label} className="space-y-2">
                  <Label htmlFor={field.label} className="text-xs">
                    {field.label.charAt(0).toUpperCase() + field.label.slice(1).replace(/([A-Z])/g, " $1")}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <p className="text-xs text-muted">{field.description}</p>

                  {field.type === "dropdown" && (
                    <Select value={value} onValueChange={(val) => handleSettingChange(field.label, val)}>
                      <SelectTrigger id={field.label}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {field.options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {field.type === "multiselect" && (
                    <MultiSelect
                      options={field.options}
                      value={Array.isArray(value) ? value : []}
                      onChange={(val) => handleSettingChange(field.label, val)}
                      placeholder={`Select ${field.label}...`}

                    />
                  )}

                  {field.type === "text" && (
                    <Input
                      id={field.label}
                      type="text"
                      value={value}
                      onChange={(e) => handleSettingChange(field.label, e.target.value)}
                      placeholder={field.description}
                    />
                  )}

                  {field.type === "number" && (
                    <Input
                      id={field.label}
                      type="number"
                      value={value}
                      onChange={(e) => handleSettingChange(field.label, Number.parseFloat(e.target.value))}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function AccountButton({
  platform,
  icon,
  connected,
  onClick,
}: {
  platform: string
  icon: React.ReactNode
  connected: boolean | undefined
  onClick: () => void
}) {
  return (
    <Button variant="outline" className="w-full justify-between bg-transparent" size="sm" onClick={onClick}>
      <div className="flex items-center gap-2">
        {icon}
        <span>{platform}</span>
      </div>
      {connected ? (
        <div className="flex items-center gap-1 text-xs text-green-600">
          <div className="h-2 w-2 rounded-full bg-green-600" />
          Connected
        </div>
      ) : (
        <span className="text-xs text-muted">Connect</span>
      )}
    </Button>
  )
}

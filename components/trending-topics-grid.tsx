"use client"

import { Card } from "./ui/card"
import { Linkedin, Twitter, Facebook, TrendingUp } from "lucide-react"

interface TrendingTopic {
    id: string
    title: string
    platform: "linkedin" | "twitter" | "facebook"
    summary: string
    momentum: "high" | "medium" | "low"
}

interface TrendingTopicsGridProps {
    topics: TrendingTopic[]
    onSelect: (topic: TrendingTopic) => void
}

export function TrendingTopicsGrid({ topics, onSelect }: TrendingTopicsGridProps) {
    const getPlatformIcon = (platform: string) => {
        switch (platform) {
            case "linkedin":
                return <Linkedin className="h-4 w-4" />
            case "twitter":
                return <Twitter className="h-4 w-4" />
            case "facebook":
                return <Facebook className="h-4 w-4" />
            default:
                return null
        }
    }

    const getMomentumColor = (momentum: string) => {
        switch (momentum) {
            case "high":
                return "text-green-600 bg-green-500/10"
            case "medium":
                return "text-yellow-600 bg-yellow-500/10"
            case "low":
                return "text-blue-600 bg-blue-500/10"
            default:
                return "text-muted bg-muted/10"
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {topics.map((topic) => (
                <Card
                    key={topic.id}
                    className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => onSelect(topic)}
                >
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                            {getPlatformIcon(topic.platform)}
                            <span className="text-xs font-medium capitalize">{topic.platform}</span>
                        </div>
                        <div
                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getMomentumColor(topic.momentum)}`}
                        >
                            <TrendingUp className="h-3 w-3" />
                            {topic.momentum}
                        </div>
                    </div>
                    <h4 className="font-medium text-sm mb-1 line-clamp-2">{topic.title}</h4>
                    <p className="text-xs text-muted line-clamp-2">{topic.summary}</p>
                </Card>
            ))}
        </div>
    )
}

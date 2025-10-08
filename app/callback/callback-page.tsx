"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

export default function CallbackPageInner() {
    const searchParams = useSearchParams()
    const platform = searchParams.get("platform")

    useEffect(() => {
        if (!platform) return

        // Notify parent window
        window.opener?.postMessage(
            { type: "oauth_success", platform },
            process.env.NEXT_PUBLIC_BASE_URL!
        )

        // Close popup
        window.close()
    }, [platform])

    return <p className="text-sm">Finishing authentication for {platform}...</p>
}

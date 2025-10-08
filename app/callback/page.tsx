"use client"

import { Suspense } from "react"
import CallbackPageInner from "./callback-page"

export default function CallbackPage() {
    return (
        <Suspense fallback={<p className="text-sm">Loading...</p>}>
            <CallbackPageInner />
        </Suspense>
    )
}

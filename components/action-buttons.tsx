// "use client"

// import { Button } from "./ui/button"

// interface ActionButtonsProps {
//     actions: Array<{
//         label: string
//         value: string
//         variant?: "default" | "outline"
//     }>
//     onAction: (value: string) => void
// }

// export function ActionButtons({ actions, onAction }: ActionButtonsProps) {

//     return (
//         <div className="flex flex-wrap gap-2 mt-3">
//             {actions.map((action) => (
//                 <Button
//                     key={action.value}
//                     variant={action.variant || "outline"}
//                     size="sm"
//                     onClick={() => onAction(action.value)}
//                     className="text-sm"
//                 >
//                     {action.label}
//                 </Button>
//             ))}
//         </div>
//     )
// }

"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Loader2 } from "lucide-react"

interface ActionButtonsProps {
    actions: Array<{
        label: string
        value: string
        variant?: "default" | "outline"
    }>
    onAction: (value: string) => Promise<void> | void
}

export function ActionButtons({ actions, onAction }: ActionButtonsProps) {
    const [loadingAction, setLoadingAction] = useState<string | null>(null)

    const handleClick = async (value: string) => {
        setLoadingAction(value)
        try {
            await onAction(value)
        } finally {
            setLoadingAction(null)
        }
    }

    return (
        <div className="flex flex-wrap gap-2 mt-3">
            {actions.map((action) => (
                <Button
                    key={action.value}
                    variant={action.variant || "outline"}
                    size="sm"
                    onClick={() => handleClick(action.value)}
                    className="text-sm"
                    disabled={loadingAction === action.value}
                >
                    {loadingAction === action.value ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {action.label}
                        </div>
                    ) : (
                        action.label
                    )}
                </Button>
            ))}
        </div>
    )
}

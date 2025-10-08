export function openOAuthPopup(platform: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const width = 600
        const height = 700
        const left = window.screen.width / 2 - width / 2
        const top = window.screen.height / 2 - height / 2

        const popup = window.open(
            `/api/auth/${platform}`,
            `${platform}_oauth`,
            `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`,
        )

        if (!popup) {
            reject(new Error("Popup blocked. Please allow popups for this site."))
            return
        }

        const messageHandler = (event: MessageEvent) => {
            // Verify the message is from our OAuth callback
            if (event.data?.type === "oauth_success") {
                window.removeEventListener("message", messageHandler)
                clearInterval(pollTimer)
                clearTimeout(timeoutId)
                resolve(true)
            } else if (event.data?.type === "oauth_error") {
                window.removeEventListener("message", messageHandler)
                clearInterval(pollTimer)
                clearTimeout(timeoutId)
                reject(new Error(event.data.error || "OAuth failed"))
            }
        }

        window.addEventListener("message", messageHandler)

        // Poll for popup closure as fallback
        const pollTimer = setInterval(() => {
            if (popup.closed) {
                clearInterval(pollTimer)
                clearTimeout(timeoutId)
                window.removeEventListener("message", messageHandler)
                // Give a moment for the callback to complete
                setTimeout(() => {
                    resolve(true)
                }, 500)
            }
        }, 500)

        // Timeout after 5 minutes
        const timeoutId = setTimeout(
            () => {
                clearInterval(pollTimer)
                window.removeEventListener("message", messageHandler)
                if (!popup.closed) {
                    popup.close()
                }
                reject(new Error("OAuth timeout"))
            },
            5 * 60 * 1000,
        )
    })
}

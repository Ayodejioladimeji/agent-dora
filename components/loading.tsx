import React from "react"

interface Props{
    color?:string
}
export const Loading = ({color = "white"}:Props) => {
    
    return (
        <div className={`animate-spin rounded-full h-5 w-5 border-b-2 border-${color}`}></div>
    )
}
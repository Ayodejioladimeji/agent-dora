import { NextResponse } from "next/server";

export async function POST() {

    const response = NextResponse.json(
        { message: "User logged out successfully" },
        { status: 200 }
    );

    // Clear the cookie
    response.cookies.set("user_id", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: new Date(0),
        path: "/",
    });

    return response;
}

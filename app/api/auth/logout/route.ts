import { NextResponse } from "next/server"

// Force this route to use Node.js runtime
export const runtime = "nodejs"

export async function POST() {
  const response = NextResponse.json({ success: true })

  // Clear the auth token cookie
  response.cookies.set("auth-token", "", {
    path: "/",
    expires: new Date(0),
    httpOnly: false,
    sameSite: "lax",
  })

  return response
}

import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { verifyPassword, generateToken } from "@/lib/auth"

// Force this route to use Node.js runtime
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log("Login attempt for:", email) // Debug log

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("formcraft")
    const users = db.collection("users")

    const user = await users.findOne({ email: email.toLowerCase() })
    console.log("User found:", !!user) // Debug log

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const isValid = await verifyPassword(password, user.password)
    console.log("Password valid:", isValid) // Debug log

    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const token = generateToken(user._id.toString())

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role || 'user', // Default to 'user' if no role set
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
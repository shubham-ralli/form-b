import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { hashPassword, generateToken } from "@/lib/auth"

// Force this route to use Node.js runtime
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    console.log("Registration attempt for:", email) // Debug log

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("formcraft")
    const users = db.collection("users")

    // Check if user already exists (case insensitive)
    const existingUser = await users.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    const result = await users.insertOne({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date(),
    })

    console.log("User created with ID:", result.insertedId) // Debug log

    const token = generateToken(result.insertedId.toString())

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: result.insertedId.toString(),
        name: name.trim(),
        email: email.toLowerCase(),
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

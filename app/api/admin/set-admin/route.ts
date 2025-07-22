
import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { email, adminKey } = await request.json()
    
    // Simple admin key check - you should use a secure key
    if (adminKey !== "admin123") {
      return NextResponse.json({ error: "Invalid admin key" }, { status: 403 })
    }

    const client = await clientPromise
    const db = client.db("formcraft")
    const users = db.collection("users")

    const result = await users.updateOne(
      { email: email },
      { $set: { role: 'admin' } }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Admin role set successfully" })
  } catch (error) {
    console.error("Error setting admin role:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

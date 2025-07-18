
import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json()

    if (!["monthly", "yearly"].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan type" },
        { status: 400 }
      )
    }

    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const { db } = await connectToDatabase()

    // Calculate subscription expiry
    const now = new Date()
    const expiry = new Date()
    if (plan === "monthly") {
      expiry.setMonth(now.getMonth() + 1)
    } else {
      expiry.setFullYear(now.getFullYear() + 1)
    }

    // Update user plan
    await db.collection("users").updateOne(
      { _id: decoded.userId },
      { 
        $set: { 
          plan,
          subscriptionExpiry: expiry,
          updatedAt: now
        }
      }
    )

    return NextResponse.json({ 
      success: true,
      plan,
      expiry: expiry.toISOString()
    })

  } catch (error) {
    console.error("Upgrade error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

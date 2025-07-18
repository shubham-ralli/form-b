
import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const plans = [
      {
        id: "free",
        name: "Free Plan",
        price: 0,
        billing: "monthly",
        features: {
          maxForms: 3,
          maxSubmissions: 10,
          responseRate: true,
          analytics: false,
          customization: false
        }
      },
      {
        id: "pro-monthly",
        name: "Pro Monthly",
        price: 5,
        billing: "monthly",
        features: {
          maxForms: -1, // unlimited
          maxSubmissions: 25000,
          responseRate: true,
          analytics: true,
          customization: true
        }
      },
      {
        id: "pro-yearly",
        name: "Pro Yearly",
        price: 48, // $4/month * 12
        billing: "yearly",
        features: {
          maxForms: -1, // unlimited
          maxSubmissions: 25000,
          responseRate: true,
          analytics: true,
          customization: true
        }
      }
    ]

    return NextResponse.json({ plans })
  } catch (error) {
    console.error("Plans API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const { planId } = await request.json()

    const client = await clientPromise
    const db = client.db("formcraft")

    // Update user's plan
    await db.collection("users").updateOne(
      { _id: new ObjectId(decoded.userId) },
      { 
        $set: { 
          plan: planId,
          planUpdatedAt: new Date(),
          submissionCount: 0 // reset submission count on plan change
        } 
      }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Plan update error:", error)
    return NextResponse.json(
      { error: "Failed to update plan" },
      { status: 500 }
    )
  }
}

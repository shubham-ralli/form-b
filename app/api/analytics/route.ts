
import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const client = await clientPromise
    const db = client.db("formcraft")

    // Get current month start date
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Aggregate analytics data
    const [totalForms, totalSubmissions, thisMonthSubmissions] = await Promise.all([
      db.collection("forms").countDocuments({ userId: decoded.userId }),
      db.collection("submissions").countDocuments({ userId: decoded.userId }),
      db.collection("submissions").countDocuments({
        userId: decoded.userId,
        submittedAt: { $gte: monthStart }
      })
    ])

    // Calculate response rate (simplified - you can make this more sophisticated)
    const forms = await db.collection("forms").find({ userId: decoded.userId }).toArray()
    let totalViews = 0
    let totalResponses = 0

    for (const form of forms) {
      const submissions = await db.collection("submissions").countDocuments({ formId: form._id.toString() })
      const views = form.views || submissions * 2 // Estimate views if not tracked
      totalViews += views
      totalResponses += submissions
    }

    const responseRate = totalViews > 0 ? Math.round((totalResponses / totalViews) * 100) : 0

    return NextResponse.json({
      totalForms,
      totalSubmissions,
      thisMonth: thisMonthSubmissions,
      responseRate
    })
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}

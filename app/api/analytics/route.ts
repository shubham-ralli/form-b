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
    const { searchParams } = new URL(request.url)
    const days = searchParams.get("days")
    const formId = searchParams.get("formId")

    const client = await clientPromise
    const db = client.db("formcraft")

    // Build query filters
    let formQuery: any = { userId: new ObjectId(decoded.userId) }
    if (formId && formId !== "all") {
      formQuery._id = new ObjectId(formId)
    }

    // Get user's forms
    const forms = await db.collection("forms").find(formQuery).toArray()
    const formIds = forms.map(form => form._id.toString())

    // Build submission query with time filter
    let submissionQuery: any = { formId: { $in: formIds } }
    if (days && days !== "all") {
      const daysAgo = new Date()
      daysAgo.setDate(daysAgo.getDate() - parseInt(days))
      submissionQuery.createdAt = { $gte: daysAgo }
    }

    // Get submissions
    const submissions = await db.collection("submissions").find(submissionQuery).toArray()

    // Calculate analytics
    const totalForms = forms.length
    const totalSubmissions = submissions.length
    const activeForms = forms.filter(form => form.isActive).length

    // Calculate monthly submissions
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const monthlySubmissions = submissions.filter(sub => 
      new Date(sub.createdAt) >= currentMonth
    ).length

    // Bot detection analytics
    const botSubmissions = submissions.filter(sub => sub.isBotDetected).length
    const humanSubmissions = totalSubmissions - botSubmissions
    const botRate = totalSubmissions > 0 ? (botSubmissions / totalSubmissions) * 100 : 0

    // Location analytics
    const locationStats = submissions.reduce((acc: any, sub: any) => {
      const location = sub.location || 'Unknown'
      acc[location] = (acc[location] || 0) + 1
      return acc
    }, {})

    // Daily submission trends (last 30 days)
    const dailyStats = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const dayEnd = new Date(dayStart)
      dayEnd.setDate(dayEnd.getDate() + 1)

      const daySubmissions = submissions.filter(sub => {
        const subDate = new Date(sub.createdAt)
        return subDate >= dayStart && subDate < dayEnd
      }).length

      dailyStats.push({
        date: dayStart.toISOString().split('T')[0],
        submissions: daySubmissions
      })
    }

    // Response rate calculation
    const responseRate = totalForms > 0 ? (totalSubmissions / (totalForms * 100)) * 100 : 0

    return NextResponse.json({
      totalForms,
      totalSubmissions,
      activeForms,
      monthlySubmissions,
      responseRate: Math.round(responseRate * 100) / 100,
      botSubmissions,
      humanSubmissions,
      botRate: Math.round(botRate * 100) / 100,
      locationStats,
      dailyStats,
      submissions: submissions.map(sub => ({
        ...sub,
        id: sub._id.toString()
      }))
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get("token")?.value
  if (!token) {
    return null
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    return decoded.userId
  } catch (error) {
    console.error("JWT verification error:", error)
    return null
  }
}
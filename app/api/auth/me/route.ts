import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const client = await clientPromise
    const db = client.db("formcraft")

    const user = await db.collection("users").findOne(
      { _id: decoded.userId },
      { projection: { password: 0 } }
    )

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Get form count for this user
    const formsCount = await db.collection("forms").countDocuments({ userId: decoded.userId })

    // Get submissions count for this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const submissions = await db.collection("submissions").aggregate([
      {
        $lookup: {
          from: "forms",
          localField: "formId",
          foreignField: "_id",
          as: "form"
        }
      },
      {
        $match: {
          "form.userId": decoded.userId,
          submittedAt: { $gte: startOfMonth }
        }
      },
      {
        $count: "total"
      }
    ]).toArray()

    const submissionsThisMonth = submissions.length > 0 ? submissions[0].total : 0

    return NextResponse.json({
      ...user,
      formsUsed: formsCount,
      submissionsThisMonth,
      plan: user.plan || "free"
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid token" },
      { status: 401 }
    )
  }
}
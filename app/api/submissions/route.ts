import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { getUserIdFromRequest } from "@/lib/auth"

// Force this route to use Node.js runtime
export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("formcraft")
    const submissionsCollection = db.collection("submissions")
    const formsCollection = db.collection("forms")

    // Get all forms for this user
    const userForms = await formsCollection.find({ userId: new ObjectId(userId) }).toArray()
    const formIds = userForms.map((form) => form._id.toString())

    // Get submissions for user's forms
    const userSubmissions = await submissionsCollection
      .find({ formId: { $in: formIds } })
      .sort({ submittedAt: -1 })
      .toArray()

    return NextResponse.json(
      userSubmissions.map((sub) => ({
        ...sub,
        id: sub._id.toString(),
      })),
    )
  } catch (error) {
    console.error("Error fetching submissions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const submissionData = await request.json()

    const client = await clientPromise
    const db = client.db("formcraft")
    const submissionsCollection = db.collection("submissions")

    const newSubmission = {
      ...submissionData,
      submittedAt: new Date(),
      ipAddress: request.headers.get("x-forwarded-for") || request.ip || "127.0.0.1",
      userAgent: request.headers.get("user-agent") || "Unknown",
    }

    const result = await submissionsCollection.insertOne(newSubmission)

    const response = NextResponse.json(
      {
        ...newSubmission,
        id: result.insertedId.toString(),
      },
      { status: 201 },
    )

    // Add CORS headers for embed functionality
    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")

    return response
  } catch (error) {
    console.error("Error saving submission:", error)
    const response = NextResponse.json({ error: "Internal server error" }, { status: 500 })

    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")

    return response
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}

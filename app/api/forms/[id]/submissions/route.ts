import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { getUserIdFromRequest } from "@/lib/auth"

export const runtime = "nodejs"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("formcraft")
    const submissionsCollection = db.collection("submissions")
    const formsCollection = db.collection("forms")

    // Verify the form belongs to the user
    const form = await formsCollection.findOne({
      _id: new ObjectId(params.id),
      userId: new ObjectId(userId),
    })

    if (!form) {
      return NextResponse.json({ error: "Form not found or unauthorized" }, { status: 404 })
    }

    // Get submissions for this specific form
    const submissions = await submissionsCollection.find({ formId: params.id }).sort({ submittedAt: -1 }).toArray()

    return NextResponse.json(
      submissions.map((sub) => ({
        ...sub,
        id: sub._id.toString(),
      })),
    )
  } catch (error) {
    console.error("Error fetching form submissions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data } = await request.json()
    
    const client = await clientPromise
    const db = client.db("formcraft")
    const formsCollection = db.collection("forms")
    const submissionsCollection = db.collection("submissions")

    // Verify the form exists and is active
    const form = await formsCollection.findOne({ _id: new ObjectId(params.id) })
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    if (!form.isActive) {
      return NextResponse.json({ error: "Form is not active" }, { status: 400 })
    }

    // Get client IP and user agent
    const forwarded = request.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    // Create submission
    const submission = {
      formId: params.id,
      data: data,
      submittedAt: new Date().toISOString(),
      ipAddress: ip,
      userAgent: userAgent,
    }

    const result = await submissionsCollection.insertOne(submission)

    return NextResponse.json({ 
      success: true, 
      submissionId: result.insertedId.toString() 
    })
  } catch (error) {
    console.error("Error creating submission:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

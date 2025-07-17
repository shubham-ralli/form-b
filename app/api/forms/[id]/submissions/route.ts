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

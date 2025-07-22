
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
    const users = db.collection("users")
    const forms = db.collection("forms")
    const submissions = db.collection("submissions")

    // Check if current user is admin
    const currentUser = await users.findOne({ _id: new ObjectId(userId) })
    if (currentUser?.role !== 'admin') {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Get target user
    const targetUser = await users.findOne({ _id: new ObjectId(params.id) })
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get user's forms
    const userForms = await forms.find({ userId: new ObjectId(params.id) }).toArray()

    // Get submission counts for each form
    const formsWithCounts = await Promise.all(
      userForms.map(async (form) => {
        const submissionCount = await submissions.countDocuments({ formId: form._id.toString() })
        return {
          ...form,
          id: form._id.toString(),
          submissions: submissionCount,
        }
      }),
    )

    return NextResponse.json({
      user: {
        id: targetUser._id.toString(),
        name: targetUser.name || 'No name',
        email: targetUser.email
      },
      forms: formsWithCounts
    })
  } catch (error) {
    console.error("Error fetching user forms:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { getUserIdFromRequest } from "@/lib/auth"

export const runtime = "nodejs"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Validate user ID parameter
    if (!params.id || params.id === 'undefined' || !ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const client = await clientPromise
    const db = client.db("formcraft")
    const users = db.collection("users")
    const currentUser = await users.findOne({ _id: new ObjectId(userId) })

    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get target user and their forms
    const targetUser = await users.findOne({ _id: new ObjectId(params.id) })
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const forms = db.collection("forms")
    const userForms = await forms.find({ userId: new ObjectId(params.id) }).toArray()

    // Get submission counts for each form
    const submissions = db.collection("submissions")
    const formsWithSubmissions = await Promise.all(
      userForms.map(async (form) => {
        const submissionCount = await submissions.countDocuments({ formId: form._id.toString() })
        return {
          id: form._id.toString(),
          title: form.title,
          elements: form.elements || [],
          createdAt: form.createdAt,
          updatedAt: form.updatedAt,
          submissions: submissionCount,
          isActive: form.isActive
        }
      })
    )

    return NextResponse.json({
      user: {
        id: targetUser._id.toString(),
        name: targetUser.name,
        email: targetUser.email
      },
      forms: formsWithSubmissions
    })
  } catch (error) {
    console.error("Error fetching user forms:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
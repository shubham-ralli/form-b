import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const formId = searchParams.get('id')

    const client = await clientPromise
    const db = client.db("formcraft")
    const forms = db.collection("forms")
    const users = db.collection("users")
    const submissions = db.collection("submissions")

    // If specific form ID is requested, return only that form
    if (formId) {
      try {
        const form = await forms.findOne({ _id: new ObjectId(formId) })
        if (!form) {
          return NextResponse.json({ error: "Form not found" }, { status: 404 })
        }

        // Get creator info
        const creator = await users.findOne({ _id: new ObjectId(form.createdBy) })

        return NextResponse.json({
          id: form._id.toString(),
          title: form.title || "Untitled Form",
          description: form.description,
          elements: form.elements || [],
          isActive: form.isActive,
          createdAt: form.createdAt,
          updatedAt: form.updatedAt,
          submissionType: form.submissionType || "message",
          redirectUrl: form.redirectUrl,
          successMessageHtml: form.successMessageHtml,
          creatorName: creator?.name || "Unknown User"
        })
      } catch (error) {
        return NextResponse.json({ error: "Invalid form ID" }, { status: 400 })
      }
    }

    // Get all active forms
    const activeForms = await forms.find({ isActive: { $ne: false } }).toArray()

    // Get creator names and submission counts
    const formsWithDetails = await Promise.all(
      activeForms.map(async (form) => {
        let creator = null
        let createdBy = "Unknown"

        // Handle both userId and createdBy fields
        const creatorId = form.userId || form.createdBy
        if (creatorId) {
          creator = await users.findOne({ _id: new ObjectId(creatorId) })
          createdBy = creatorId.toString()
        }

        const submissionCount = await submissions.countDocuments({ 
          formId: form._id.toString() 
        })

        return {
          id: form._id.toString(),
          title: form.title,
          createdBy: createdBy,
          creatorName: creator?.name || "Unknown",
          createdAt: form.createdAt,
          submissions: submissionCount,
          isActive: form.isActive !== false
        }
      })
    )

    return NextResponse.json({ forms: formsWithDetails })
  } catch (error) {
    console.error("Error fetching public forms:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
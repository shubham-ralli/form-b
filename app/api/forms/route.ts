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
    const forms = db.collection("forms")
    const users = db.collection("users")

    // Always get only current user's forms
    const userForms = await forms.find({ userId: new ObjectId(userId) }).toArray()

    // Get submission counts for each form
    const submissions = db.collection("submissions")
    const formsWithCounts = await Promise.all(
      userForms.map(async (form) => {
        const submissionCount = await submissions.countDocuments({ formId: form._id.toString() })
        return {
          _id: form._id.toString(),
          title: form.title || "Untitled Form",
          description: form.description || "",
          isActive: form.isActive !== false,
          createdAt: form.createdAt || new Date().toISOString(),
          updatedAt: form.updatedAt || new Date().toISOString(),
          submissionCount: submissionCount || 0,
          userId: form.userId,
          elements: form.elements || []
        }
      }),
    )

    return NextResponse.json({ forms: formsWithCounts })
  } catch (error) {
    console.error("Error fetching forms:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("formcraft")

    // Get user to check plan and role
    const users = db.collection("users")
    const user = await users.findOne({ _id: new ObjectId(userId) })
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Any authenticated user can create forms
    // Admin restriction removed

    // Check form limits for free plan (admin users bypass this limit)
    if (user.role !== 'admin') {
      if (user.plan === "free" || !user.plan) {
        const forms = db.collection("forms")
        const formsCount = await forms.countDocuments({ userId: new ObjectId(userId) })
        if (formsCount >= 3) {
          return NextResponse.json(
            { error: "Free plan allows maximum 3 forms. Please upgrade to create more forms." },
            { status: 403 }
          )
        }
      }
    }

    const formData = await request.json()

    const forms = db.collection("forms")

    const newForm = {
      ...formData,
      userId: new ObjectId(userId),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await forms.insertOne(newForm)

    return NextResponse.json(
      {
        ...newForm,
        formId: result.insertedId.toString(),
        _id: result.insertedId.toString(),
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating form:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
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

    const userForms = await forms.find({ userId: new ObjectId(userId) }).toArray()

    // Get submission counts for each form
    const submissions = db.collection("submissions")
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

    return NextResponse.json(formsWithCounts)
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

    const formData = await request.json()

    const client = await clientPromise
    const db = client.db("formcraft")
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
        id: result.insertedId.toString(),
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating form:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

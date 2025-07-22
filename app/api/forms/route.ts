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

    // Optimize query with projection and sorting
    const userForms = await forms
      .find(
        { userId: new ObjectId(userId) },
        {
          projection: {
            title: 1,
            description: 1,
            isActive: 1,
            createdAt: 1,
            updatedAt: 1,
            elements: 1,
            userId: 1
          }
        }
      )
      .sort({ updatedAt: -1, createdAt: -1 })
      .toArray()

    // Get submission counts in batch for better performance
    const submissions = db.collection("submissions")
    const formIds = userForms.map(form => form._id.toString())
    
    const submissionCounts = await submissions.aggregate([
      {
        $match: {
          formId: { $in: formIds }
        }
      },
      {
        $group: {
          _id: "$formId",
          count: { $sum: 1 }
        }
      }
    ]).toArray()

    const submissionMap = submissionCounts.reduce((acc, item) => {
      acc[item._id] = item.count
      return acc
    }, {} as Record<string, number>)

    const formsWithCounts = userForms.map((form) => ({
      _id: form._id.toString(),
      title: form.title || `Form - ${new Date(form.createdAt).toLocaleDateString()}`,
      description: form.description || "",
      isActive: form.isActive !== false,
      createdAt: form.createdAt || new Date().toISOString(),
      updatedAt: form.updatedAt || new Date().toISOString(),
      submissionCount: submissionMap[form._id.toString()] || 0,
      userId: form.userId,
      elements: form.elements || []
    }))

    const response = NextResponse.json({ forms: formsWithCounts })
    
    // Add cache headers for better performance
    response.headers.set('Cache-Control', 'private, max-age=60, stale-while-revalidate=120')
    
    return response
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
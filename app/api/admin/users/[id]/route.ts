
import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { getUserIdFromRequest } from "@/lib/auth"

export const runtime = "nodejs"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("formcraft")
    const users = db.collection("users")

    // Check if current user is admin
    const currentUser = await users.findOne({ _id: new ObjectId(userId) })
    if (currentUser?.role !== 'admin') {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { isActive } = await request.json()

    const result = await users.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { isActive: isActive } }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating user status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Delete user's forms and their submissions
    const userForms = await forms.find({ userId: new ObjectId(params.id) }).toArray()
    for (const form of userForms) {
      await submissions.deleteMany({ formId: form._id.toString() })
    }
    await forms.deleteMany({ userId: new ObjectId(params.id) })

    // Delete user
    const result = await users.deleteOne({ _id: new ObjectId(params.id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

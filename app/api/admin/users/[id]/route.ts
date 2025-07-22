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
    const forms = db.collection("forms")

    // Check if current user is admin
    const currentUser = await users.findOne({ _id: new ObjectId(userId) })
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { isActive } = await request.json()

    // Update user status
    const result = await users.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { isActive } }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // If disabling user, also disable all their forms
    if (!isActive) {
      await forms.updateMany(
        { userId: new ObjectId(params.id) },
        { $set: { isActive: false } }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate the user ID parameter
    if (!params.id || params.id === 'undefined' || params.id.length !== 24) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("formcraft")
    const users = db.collection("users")
    const forms = db.collection("forms")
    const submissions = db.collection("submissions")

    // Check if current user is admin
    const currentUser = await users.findOne({ _id: new ObjectId(userId) })
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Check if user exists
    const userToDelete = await users.findOne({ _id: new ObjectId(params.id) })
    if (!userToDelete) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get all user's forms to delete their submissions
    const userForms = await forms.find({ userId: new ObjectId(params.id) }).toArray()
    const formIds = userForms.map(form => form._id.toString())

    // Delete all submissions for user's forms
    if (formIds.length > 0) {
      await submissions.deleteMany({ formId: { $in: formIds } })
    }

    // Delete all user's forms
    await forms.deleteMany({ userId: new ObjectId(params.id) })

    // Delete the user
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
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

    const { isActive } = await request.json()

    if (typeof isActive !== "boolean") {
      return NextResponse.json({ error: "isActive must be a boolean" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("formcraft")
    const formsCollection = db.collection("forms")

    const result = await formsCollection.updateOne(
      { _id: new ObjectId(params.id), userId: new ObjectId(userId) },
      { $set: { isActive: isActive, updatedAt: new Date() } },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Form not found or unauthorized" }, { status: 404 })
    }

    return NextResponse.json({ success: true, isActive })
  } catch (error) {
    console.error("Error toggling form status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
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

    const { isActive } = await request.json()
    
    const client = await clientPromise
    const db = client.db("formcraft")
    const forms = db.collection("forms")
    const users = db.collection("users")

    // Check if current user is admin
    const currentUser = await users.findOne({ _id: new ObjectId(userId) })
    if (currentUser?.role !== 'admin') {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const result = await forms.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { isActive, updatedAt: new Date() } }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Form status updated successfully" })
  } catch (error) {
    console.error("Error updating form status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

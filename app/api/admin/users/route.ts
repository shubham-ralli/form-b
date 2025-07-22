
import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { getUserIdFromRequest } from "@/lib/auth"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
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
    if (currentUser?.role !== 'admin') {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Get all users
    const allUsers = await users.find({}).toArray()

    // Get form statistics for each user
    const usersWithStats = await Promise.all(
      allUsers.map(async (user) => {
        const userForms = await forms.find({ userId: user._id }).toArray()
        const totalForms = userForms.length
        const activeForms = userForms.filter(form => form.isActive !== false).length

        return {
          id: user._id.toString(),
          name: user.name || 'No name',
          email: user.email,
          role: user.role || 'user',
          totalForms,
          activeForms,
          createdAt: user.createdAt,
          isActive: user.isActive !== false
        }
      })
    )

    return NextResponse.json(usersWithStats)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { getUserIdFromRequest } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ valid: false, reason: "no_token" })
    }

    const client = await clientPromise
    const db = client.db("formcraft")
    const users = db.collection("users")

    const user = await users.findOne({ _id: new ObjectId(userId) })
    
    if (!user) {
      // User was deleted
      const response = NextResponse.json({ 
        valid: false, 
        reason: "user_deleted",
        message: "Your account has been deleted. Please contact support if you believe this is an error."
      })
      response.cookies.delete("token")
      return response
    }

    if (!user.isActive) {
      return NextResponse.json({ 
        valid: false,
        reason: "user_disabled",
        message: "Your account has been disabled. Please contact customer support."
      })
    }

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error("Error validating session:", error)
    return NextResponse.json({ valid: false, reason: "error" })
  }
}

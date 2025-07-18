import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-fallback-secret-key-change-this"

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    return decoded
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

// Helper function to get user ID from request headers
export async function getUserIdFromRequest(request: Request): Promise<string | null> {
  const authHeader = request.headers.get("x-auth-token")
  const cookieHeader = request.headers.get("cookie")

  let token = authHeader

  if (!token && cookieHeader) {
    // Extract token from cookie
    const cookies = cookieHeader.split(";").map((c) => c.trim())
    const authCookie = cookies.find((c) => c.startsWith("token="))
    if (authCookie) {
      token = authCookie.split("=")[1]
    }
  }

  if (!token) {
    return null
  }

  const decoded = verifyToken(token)
  return decoded?.userId || null
}

"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Sidebar } from "./sidebar"

interface User {
  id: string
  name: string
  email: string
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Public pages that don't require authentication
  const publicPages = ["/login", "/register"]
  const isPublicPage = publicPages.includes(pathname)
  const isLivePage = pathname.startsWith("/live/")

  useEffect(() => {
    const checkAuth = async () => {
      if (isPublicPage || isLivePage) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          router.push("/login")
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        router.push("/login")
      }
      setLoading(false)
    }

    checkAuth()
  }, [pathname, router, isPublicPage, isLivePage])

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (isPublicPage || isLivePage) {
    return <>{children}</>
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
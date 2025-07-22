"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Sidebar } from "./sidebar"
import { FormsProvider } from "@/contexts/FormsContext"

interface User {
  id: string
  name: string
  email: string
}

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Public pages that don't require authentication
  const publicPages = ["/login", "/register", "/public-forms"]
  const isPublicPage = publicPages.includes(pathname)
  const isLivePage = pathname.startsWith("/live/")

  useEffect(() => {
    if (publicPages.includes(pathname) || isLivePage) {
      setLoading(false)
      return
    }

    fetchUser()
  }, [pathname])

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        router.push("/login")
      }
    } catch (error) {
      console.error("Error fetching user:", error)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Render public pages and live form pages without sidebar
  if (publicPages.includes(pathname) || isLivePage) {
    return <>{children}</>
  }

  // Render authenticated pages with sidebar
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar user={user} />
      <div className="lg:pl-64">
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FormsProvider>
              {children}
            </FormsProvider>
          </div>
        </main>
      </div>
    </div>
  )
}
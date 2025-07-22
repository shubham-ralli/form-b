"use client"

import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import MainLayout from "@/components/layout/main-layout"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FormCraft - Advanced Form Builder",
  description: "Create beautiful, responsive forms with drag-and-drop simplicity",
    generator: 'v0.dev'
}

function UserStatusChecker({ children }: { children: React.ReactNode }) {
  const [userStatus, setUserStatus] = useState<{ isActive: boolean; message?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const checkUserStatus = async () => {
      // Skip check for public pages
      const publicPages = ["/login", "/register"]
      if (publicPages.includes(pathname)) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch("/api/auth/validate-session")
        const data = await response.json()

        if (!data.valid) {
          if (data.reason === "user_deleted") {
            // Clear token and redirect to login with error message
            document.cookie = "token=; Max-Age=0; path=/;"
            router.push("/login?error=account_deleted")
            return
          } else if (data.reason === "user_disabled") {
            setUserStatus({ isActive: false, message: data.message })
          } else {
            router.push("/login")
            return
          }
        } else {
          setUserStatus({ isActive: true })
        }
      } catch (error) {
        console.error("Error checking user status:", error)
        router.push("/login")
      }
      setLoading(false)
    }

    checkUserStatus()
  }, [pathname, router])

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (userStatus && !userStatus.isActive) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {userStatus.message || "Your account has been disabled. Please contact customer support."}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return <>{children}</>
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MainLayout>
            <UserStatusChecker>
              {children}
            </UserStatusChecker>
          </MainLayout>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
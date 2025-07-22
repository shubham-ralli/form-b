
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  BarChart3, 
  FileText, 
  Users, 
  Globe,
  Plus,
  Eye,
  Settings,
  TrendingUp
} from "lucide-react"

interface DashboardStats {
  totalForms: number
  totalSubmissions: number
  activeForms: number
  recentSubmissions: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalForms: 0,
    totalSubmissions: 0,
    activeForms: 0,
    recentSubmissions: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const [formsResponse, submissionsResponse] = await Promise.all([
        fetch('/api/forms'),
        fetch('/api/submissions')
      ])

      const forms = await formsResponse.json()
      const submissions = await submissionsResponse.json()

      const formsData = Array.isArray(forms) ? forms : (forms.forms || [])
      const submissionsData = Array.isArray(submissions) ? submissions : (submissions.submissions || [])

      setStats({
        totalForms: formsData.length,
        totalSubmissions: submissionsData.length,
        activeForms: formsData.filter((form: any) => form.isActive !== false).length,
        recentSubmissions: submissionsData.filter((sub: any) => {
          const submissionDate = new Date(sub.createdAt)
          const sevenDaysAgo = new Date()
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
          return submissionDate >= sevenDaysAgo
        }).length
      })
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to your form management dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalForms}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeForms} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              All time submissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Forms</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeForms}</div>
            <p className="text-xs text-muted-foreground">
              Currently collecting data
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Form
            </CardTitle>
            <CardDescription>
              Build a new form with our drag-and-drop builder
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/builder">
              <Button className="w-full">
                Start Building
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              View My Forms
            </CardTitle>
            <CardDescription>
              Manage and edit your existing forms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/forms">
              <Button variant="outline" className="w-full">
                View Forms
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics
            </CardTitle>
            <CardDescription>
              View detailed analytics and insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/analytics">
              <Button variant="outline" className="w-full">
                View Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Public Forms Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Public Forms
          </CardTitle>
          <CardDescription>
            Explore and fill out forms from the community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Link href="/public-forms">
              <Button>
                Browse Public Forms
              </Button>
            </Link>
            <Link href="/live-forms">
              <Button variant="outline">
                View Live Forms
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

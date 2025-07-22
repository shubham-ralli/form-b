"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Eye, Code, BarChart3, FileText, TrendingUp, Clock } from "lucide-react"

interface DashboardStats {
  totalForms: number
  totalSubmissions: number
  activeUsers: number
  recentActivity: any[]
  thisMonthGrowth?: number
  responseRate?: number
}

export default function HomePage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalForms: 0,
    totalSubmissions: 0,
    activeUsers: 1,
    recentActivity: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const [formsResponse, submissionsResponse] = await Promise.all([fetch("/api/forms"), fetch("/api/submissions")])

      const forms = await formsResponse.json()
      const submissions = await submissionsResponse.json()

      // Calculate this month's submissions
      const now = new Date()
      const thisMonth = submissions.filter((sub: any) => {
        const subDate = new Date(sub.submittedAt)
        return subDate.getMonth() === now.getMonth() && subDate.getFullYear() === now.getFullYear()
      })

      const lastMonth = submissions.filter((sub: any) => {
        const subDate = new Date(sub.submittedAt)
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1)
        return subDate.getMonth() === lastMonthDate.getMonth() && subDate.getFullYear() === lastMonthDate.getFullYear()
      })

      // Calculate growth percentage
      const growth = lastMonth.length > 0 
        ? Math.round(((thisMonth.length - lastMonth.length) / lastMonth.length) * 100)
        : thisMonth.length > 0 ? 100 : 0

      // Handle both array response and object with forms property
      const formsArray = Array.isArray(forms) ? forms : (forms.forms || [])
      const submissionsArray = Array.isArray(submissions) ? submissions : (submissions.submissions || [])

      setStats({
        totalForms: formsArray.length,
        totalSubmissions: submissionsArray.length,
        activeUsers: 1,
        recentActivity: submissionsArray.slice(0, 5),
        thisMonthGrowth: growth,
        responseRate: formsArray.length > 0 ? Math.round((submissionsArray.length / (formsArray.length * 10)) * 100) : 0
      })
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your forms.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalForms || 0}</div>
            <p className="text-xs text-muted-foreground">Active forms created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">Form responses received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.responseRate || 0}%</div>
            <p className="text-xs text-muted-foreground">Estimated completion rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.thisMonthGrowth !== undefined ? 
                (stats.thisMonthGrowth >= 0 ? `+${stats.thisMonthGrowth}` : stats.thisMonthGrowth) : '0'}%
            </div>
            <p className="text-xs text-muted-foreground">Growth from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <PlusCircle className="h-12 w-12 text-blue-600 mx-auto mb-2" />
            <CardTitle>Create Form</CardTitle>
            <CardDescription>Build forms with drag-and-drop interface</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/builder">
              <Button className="w-full">Start Building</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <Eye className="h-12 w-12 text-green-600 mx-auto mb-2" />
            <CardTitle>View Forms</CardTitle>
            <CardDescription>Manage and preview your forms</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/forms">
              <Button variant="outline" className="w-full bg-transparent">
                View Forms
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <Code className="h-12 w-12 text-purple-600 mx-auto mb-2" />
            <CardTitle>Embed Code</CardTitle>
            <CardDescription>Get scripts to embed forms</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/embed">
              <Button variant="outline" className="w-full bg-transparent">
                Get Code
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <BarChart3 className="h-12 w-12 text-orange-600 mx-auto mb-2" />
            <CardTitle>Analytics</CardTitle>
            <CardDescription>View submissions and data</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/analytics">
              <Button variant="outline" className="w-full bg-transparent">
                View Data
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest form submissions and activities</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No recent activity</p>
              <p className="text-sm">Create your first form to see activity here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">New form submission</p>
                      <p className="text-xs text-gray-500">{new Date(activity.submittedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Link href={`/forms/${activity.formId}`}>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
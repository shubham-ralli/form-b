"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, FileText, TrendingUp } from "lucide-react"

interface Form {
  id: string
  title: string
}

interface Submission {
  id: string
  formId: string
  data: Record<string, any>
  submittedAt: string
  ipAddress: string
}

export default function AnalyticsPage() {
  const [forms, setForms] = useState<Form[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [selectedFormId, setSelectedFormId] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [formsResponse, submissionsResponse] = await Promise.all([fetch("/api/forms"), fetch("/api/submissions")])

      const formsData = await formsResponse.json()
      const submissionsData = await submissionsResponse.json()

      // Handle both array response and object with forms property
      const formsArray = Array.isArray(formsData) ? formsData : (formsData.forms || [])
      const submissionsArray = Array.isArray(submissionsData) ? submissionsData : (submissionsData.submissions || [])
      
      setForms(formsArray)
      setSubmissions(submissionsArray)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSubmissions =
    selectedFormId === "all" ? submissions : submissions.filter((sub) => sub.formId === selectedFormId)

  const totalSubmissions = filteredSubmissions.length
  const todaySubmissions = filteredSubmissions.filter(
    (sub) => new Date(sub.submittedAt).toDateString() === new Date().toDateString(),
  ).length

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading analytics...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">View form submissions and performance metrics</p>
      </div>

      <div className="mb-6">
        <Select value={selectedFormId} onValueChange={setSelectedFormId}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select a form" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Forms</SelectItem>
            {forms.map((form) => (
              <SelectItem key={form.id} value={form.id}>
                {form.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">All time submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Submissions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaySubmissions}</div>
            <p className="text-xs text-muted-foreground">Submissions today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Forms</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forms.length}</div>
            <p className="text-xs text-muted-foreground">Total forms created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {forms.length > 0 ? Math.round((totalSubmissions / (forms.length * 10)) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Estimated completion rate</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
          <CardDescription>Latest form submissions across all your forms</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No submissions yet. Share your forms to start collecting data!
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSubmissions.slice(0, 10).map((submission) => {
                const form = forms.find((f) => f.id === submission.formId)
                return (
                  <div key={submission.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{form?.title || "Unknown Form"}</Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(submission.submittedAt).toLocaleString()}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">{submission.ipAddress}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {Object.entries(submission.data).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium text-gray-700">{key}:</span>{" "}
                          <span className="text-gray-600">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
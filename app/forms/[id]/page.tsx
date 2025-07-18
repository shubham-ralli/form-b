"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Download, Edit, Code, BarChart3, Calendar, Users, FileText, ExternalLink } from "lucide-react"
import Link from "next/link"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface Form {
  id: string
  title: string
  elements: any[]
  createdAt: string
  updatedAt: string
  isActive: boolean
  submissionType: "redirect" | "message"
  redirectUrl?: string
  successMessageHtml?: string
}

interface Submission {
  id: string
  data: Record<string, any>
  submittedAt: string
  ipAddress: string
  userAgent: string
}

export default function FormDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [form, setForm] = useState<Form | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchFormDetails()
      fetchSubmissions()
    }
  }, [params.id])

  const fetchFormDetails = async () => {
    try {
      const response = await fetch(`/api/forms/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setForm(data)
      }
    } catch (error) {
      console.error("Error fetching form:", error)
    }
  }

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(`/api/forms/${params.id}/submissions`)
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data)
      }
    } catch (error) {
      console.error("Error fetching submissions:", error)
    } finally {
      setLoading(false)
    }
  }

  const downloadCSV = () => {
    if (!form || submissions.length === 0) return

    // Get all unique field names from form elements and submission metadata
    const formFieldNames = form.elements.map((el) => el.id)
    const submissionMetaFields = ["ipAddress", "userAgent"] // Add other meta fields if needed

    const allFieldNames = new Set<string>()
    formFieldNames.forEach((field) => allFieldNames.add(field))
    submissionMetaFields.forEach((field) => allFieldNames.add(field))

    // Ensure headers are in a consistent order: Submission Date, then form fields, then meta fields
    const headers = ["Submission Date", ...formFieldNames, ...submissionMetaFields]

    const csvContent = [
      headers.join(","),
      ...submissions.map((submission) => {
        const row = [
          new Date(submission.submittedAt).toLocaleString(),
          ...formFieldNames.map((field) => {
            const value = submission.data[field] || ""
            return `"${String(value).replace(/"/g, '""')}"`
          }),
          `"${String(submission.ipAddress || "").replace(/"/g, '""')}"`,
          `"${String(submission.userAgent || "").replace(/"/g, '""')}"`,
        ]
        return row.join(",")
      }),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${form.title.replace(/[^a-zA-Z0-9]/g, "_")}_submissions.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Form not found</h2>
        <Link href="/forms">
          <Button>Back to Forms</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{form.title}</h1>
            <p className="text-gray-600 mt-1">
              Created {new Date(form.createdAt).toLocaleDateString()} • {form.elements.length} fields
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={form.isActive ? "default" : "outline"}>{form.isActive ? "Active" : "Inactive"}</Badge>
          <Button variant="outline" onClick={downloadCSV} disabled={submissions.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Download CSV
          </Button>
          <Link href={`/builder?id=${form.id}`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Form
            </Button>
          </Link>
          <Link href={`/test?formId=${form.id}`} target="_blank">
            <Button>
              <ExternalLink className="h-4 w-4 mr-2" />
              Test Form
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Form Fields</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{form.elements.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {submissions.length > 0 ? Math.round((submissions.length / (submissions.length + 5)) * 100) : 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Submission</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {submissions.length > 0 ? new Date(submissions[0].submittedAt).toLocaleDateString() : "Never"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="submissions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="form-structure">Form Structure</TabsTrigger>
          <TabsTrigger value="embed">Embed Code</TabsTrigger>
          <TabsTrigger value="submission-settings">Submission Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Form Submissions</CardTitle>
              <CardDescription>All responses submitted through this form</CardDescription>
            </CardHeader>
            <CardContent>
              {submissions.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
                  <p className="text-gray-600 mb-4">Share your form to start collecting responses</p>
                  <Link href={`/test?formId=${form.id}`} target="_blank">
                    <Button>Test Form</Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>User Agent</TableHead>
                        {form.elements.map((element) => (
                          <TableHead key={element.id}>{element.label}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell>{new Date(submission.submittedAt).toLocaleString()}</TableCell>
                          <TableCell>{submission.ipAddress}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{submission.userAgent}</TableCell>
                          {form.elements.map((element) => (
                            <TableCell key={element.id}>
                              {Array.isArray(submission.data[element.id])
                                ? submission.data[element.id].join(", ")
                                : submission.data[element.id] || "-"}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="form-structure" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Form Structure</CardTitle>
              <CardDescription>Overview of all form fields and their configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {form.elements.map((element, index) => (
                  <div key={element.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{element.label}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{element.type}</Badge>
                        {element.required && <Badge variant="secondary">Required</Badge>}
                        {element.width && element.width !== "w-full" && (
                          <Badge variant="secondary">{element.width}</Badge>
                        )}
                      </div>
                    </div>
                    {element.placeholder && (
                      <p className="text-sm text-gray-600 mb-2">Placeholder: {element.placeholder}</p>
                    )}
                    {element.options && (
                      <div className="text-sm text-gray-600">
                        <p className="mb-1">Options:</p>
                        <ul className="list-disc list-inside ml-4">
                          {element.options.map((option: string, idx: number) => (
                            <li key={idx}>{option}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="embed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Embed Code</CardTitle>
              <CardDescription>Copy this code to embed the form on your website</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <code className="text-sm">
                    {`<div id="formcraft-${form.id}" data-formcraft-id="${form.id}"></div>
<script src="${typeof window !== "undefined" ? window.location.origin : ""}/embed.js"></script>`}
                  </code>
                </div>
                <Button
                  onClick={() => {
                    const embedCode = `<div id="formcraft-${form.id}" data-formcraft-id="${form.id}"></div>
<script src="${window.location.origin}/embed.js"></script>`
                    navigator.clipboard.writeText(embedCode)
                    alert("Embed code copied to clipboard!")
                  }}
                >
                  <Code className="h-4 w-4 mr-2" />
                  Copy Embed Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submission-settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>After Submission Behavior</CardTitle>
              <CardDescription>Configure what happens after a user submits this form.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="submissionType">Submission Action</Label>
                <Select value={form.submissionType} disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Select submission type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="message">Show Success Message</SelectItem>
                    <SelectItem value="redirect">Redirect to URL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.submissionType === "redirect" && (
                <div>
                  <Label htmlFor="redirectUrl">Redirect URL</Label>
                  <Input id="redirectUrl" value={form.redirectUrl || ""} readOnly />
                </div>
              )}

              {form.submissionType === "message" && (
                <div>
                  <Label htmlFor="successMessageHtml">Success Message (HTML)</Label>
                  <Textarea id="successMessageHtml" value={form.successMessageHtml || ""} readOnly rows={5} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

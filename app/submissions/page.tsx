"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Download, Filter } from "lucide-react"

interface Submission {
  id: string
  formId: string
  data: Record<string, any>
  submittedAt: string
  ipAddress: string
  userAgent: string
}

interface Form {
  id: string
  title: string
  elements: any[]
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase()
    const filtered = submissions.filter((submission) => {
      const formTitle = forms.find((f) => f.id === submission.formId)?.title || "Unknown Form"
      const submissionDataString = JSON.stringify(submission.data).toLowerCase()
      return (
        formTitle.toLowerCase().includes(lowerCaseSearchTerm) ||
        submissionDataString.includes(lowerCaseSearchTerm) ||
        submission.ipAddress.toLowerCase().includes(lowerCaseSearchTerm) ||
        submission.userAgent.toLowerCase().includes(lowerCaseSearchTerm)
      )
    })
    setFilteredSubmissions(filtered)
  }, [submissions, forms, searchTerm])

  const fetchData = async () => {
    try {
      const [submissionsResponse, formsResponse] = await Promise.all([fetch("/api/submissions"), fetch("/api/forms")])

      const submissionsData = await submissionsResponse.json()
      const formsData = await formsResponse.json()

      setSubmissions(submissionsData)
      setForms(formsData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getFormTitle = (formId: string) => {
    return forms.find((f) => f.id === formId)?.title || "Unknown Form"
  }

  const downloadAllSubmissionsCSV = () => {
    if (filteredSubmissions.length === 0) return

    // Collect all unique field names from all forms and submissions
    const allFieldNames = new Set<string>()
    forms.forEach((form) => form.elements.forEach((el: any) => allFieldNames.add(el.id)))
    filteredSubmissions.forEach((submission) => Object.keys(submission.data).forEach((key) => allFieldNames.add(key)))

    const headers = ["Form Title", "Submission Date", "IP Address", "User Agent", ...Array.from(allFieldNames)]

    const csvContent = [
      headers.join(","),
      ...filteredSubmissions.map((submission) => {
        const row = [
          `"${getFormTitle(submission.formId).replace(/"/g, '""')}"`,
          new Date(submission.submittedAt).toLocaleString(),
          `"${String(submission.ipAddress || "").replace(/"/g, '""')}"`,
          `"${String(submission.userAgent || "").replace(/"/g, '""')}"`,
          ...Array.from(allFieldNames).map((field) => {
            const value = submission.data[field] || ""
            return `"${String(value).replace(/"/g, '""')}"`
          }),
        ]
        return row.join(",")
      }),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "all_formcraft_submissions.csv"
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Submissions</h1>
          <p className="text-gray-600 mt-2">View and manage all form responses across your forms.</p>
        </div>
        <Button onClick={downloadAllSubmissionsCSV} disabled={filteredSubmissions.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Download All CSV
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search submissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
          <CardDescription>Latest form submissions from all your active forms.</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No submissions found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Form</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>User Agent</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">{getFormTitle(submission.formId)}</TableCell>
                      <TableCell>{new Date(submission.submittedAt).toLocaleString()}</TableCell>
                      <TableCell>{submission.ipAddress}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{submission.userAgent}</TableCell>
                      <TableCell>
                        <pre className="text-xs bg-gray-50 p-2 rounded max-h-24 overflow-auto">
                          {JSON.stringify(submission.data, null, 2)}
                        </pre>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

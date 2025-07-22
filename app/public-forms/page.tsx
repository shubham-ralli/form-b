
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, ExternalLink, FileText, Search, Globe, Calendar, Users } from "lucide-react"
import Link from "next/link"

interface Form {
  id: string
  title: string
  createdBy: string
  createdAt: string
  submissions: number
  isActive: boolean
  creatorName?: string
}

export default function PublicFormsPage() {
  const [forms, setForms] = useState<Form[]>([])
  const [filteredForms, setFilteredForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchForms()
  }, [])

  useEffect(() => {
    const filtered = forms.filter((form) =>
      form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (form.creatorName && form.creatorName.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    setFilteredForms(filtered)
  }, [forms, searchTerm])

  const fetchForms = async () => {
    try {
      const response = await fetch("/api/forms/public")
      if (response.ok) {
        const data = await response.json()
        const formsData = Array.isArray(data) ? data : (data.forms || [])
        // Only show active forms
        const activeForms = formsData.filter((form: Form) => form.isActive !== false)
        setForms(activeForms)
        setFilteredForms(activeForms)
      } else {
        console.error("Failed to fetch forms")
        setForms([])
        setFilteredForms([])
      }
    } catch (error) {
      console.error("Error fetching forms:", error)
      setForms([])
      setFilteredForms([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading forms...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              <Globe className="inline-block w-8 h-8 mr-3 text-blue-600" />
              Public Forms
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Browse and submit forms created by our community. No login required - just find a form and start filling it out!
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative w-full max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search forms by title or creator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Forms Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredForms.map((form) => (
            <Card key={form.id} className="hover:shadow-lg transition-shadow bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                      {form.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {form.creatorName && `Created by ${form.creatorName}`}
                    </CardDescription>
                  </div>
                  <Badge variant="default" className="ml-2 bg-green-100 text-green-800 border-green-200">
                    <Globe className="w-3 h-3 mr-1" />
                    Public
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(form.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{form.submissions} submissions</span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link href={`/live/${form.id}`} className="flex-1">
                      <Button className="w-full" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Fill Form
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/live/${form.id}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {(!filteredForms || filteredForms.length === 0) && !loading && (
          <div className="text-center py-12">
            {searchTerm ? (
              <>
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No forms found</h3>
                <p className="text-gray-600 mb-4">
                  No forms match your search criteria. Try adjusting your search terms.
                </p>
                <Button variant="outline" onClick={() => setSearchTerm("")}>
                  Clear Search
                </Button>
              </>
            ) : (
              <>
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No public forms available</h3>
                <p className="text-gray-600 mb-4">
                  There are currently no public forms available for submission.
                </p>
              </>
            )}
          </div>
        )}

        {/* Info Banner */}
        {filteredForms.length > 0 && (
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                How to Use Public Forms
              </h3>
              <p className="text-blue-800 mb-4">
                Simply click "Fill Form" on any form above to start submitting your responses. 
                No account or login required!
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-blue-700">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>View & Submit</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  <span>No Login Required</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>Community Created</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

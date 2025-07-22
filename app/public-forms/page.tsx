
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Globe, Search, Eye, ExternalLink, Calendar, BarChart3 } from "lucide-react"
import Link from "next/link"

interface Form {
  id: string
  title: string
  description?: string
  createdBy: string
  creatorName?: string
  createdAt: string
  submissions: number
  isActive: boolean
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
      (form.creatorName && form.creatorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (form.description && form.description.toLowerCase().includes(searchTerm.toLowerCase()))
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
            <div className="text-lg">Loading public forms...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Globe className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Public Forms</h1>
          </div>
          <p className="text-xl text-gray-600 mb-6">
            Discover and fill out forms from our community
          </p>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {filteredForms.length} Active Forms Available
          </Badge>
        </div>

        {/* Search */}
        <Card className="mb-8 max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search forms by title, creator, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 py-6 text-lg"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Forms Grid */}
        {filteredForms.length === 0 ? (
          <div className="text-center py-12">
            <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm ? "No forms found" : "No active forms available"}
            </h3>
            <p className="text-gray-500">
              {searchTerm 
                ? "Try adjusting your search terms" 
                : "Check back later for new forms"
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
            {filteredForms.map((form) => (
              <Card key={form.id} className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                      Live
                    </Badge>
                    <div className="flex items-center text-sm text-gray-500">
                      <BarChart3 className="h-4 w-4 mr-1" />
                      {form.submissions}
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 leading-tight">
                    {form.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {form.description && (
                      <div className="mb-2 line-clamp-2">{form.description}</div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span>
                        {form.creatorName && `By ${form.creatorName}`}
                      </span>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(form.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex gap-2">
                    <Link href={`/live/${form.id}`} className="flex-1">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                        <Eye className="h-4 w-4 mr-2" />
                        Fill Form
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => window.open(`/live/${form.id}`, '_blank')}
                      className="border-blue-200 hover:bg-blue-50"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-gray-200">
          <p className="text-gray-500">
            Want to create your own forms? 
            <Link href="/register" className="text-blue-600 hover:text-blue-700 ml-1 font-medium">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}


"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ExternalLink, Search, Eye, Globe } from "lucide-react"
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

export default function LiveFormsPage() {
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading live forms...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Globe className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Live Forms</h1>
        </div>
        <Badge variant="secondary">{filteredForms.length} Active Forms</Badge>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Browse Active Forms</CardTitle>
              <CardDescription>Discover and interact with live forms from all users</CardDescription>
            </div>
            <div className="w-64">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search forms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredForms.map((form) => (
          <Card key={form.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{form.title}</CardTitle>
                <Badge variant="default">Live</Badge>
              </div>
              <CardDescription>
                {form.creatorName && `Created by ${form.creatorName}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Created: {new Date(form.createdAt).toLocaleDateString()}</span>
                  <span>{form.submissions} submissions</span>
                </div>
                
                <div className="flex gap-2">
                  <Link href={`/live/${form.id}`} className="flex-1">
                    <Button className="w-full" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Form
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

      {filteredForms.length === 0 && !loading && (
        <div className="text-center py-12">
          <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No live forms found</h3>
          <p className="text-gray-600">
            {searchTerm ? "Try adjusting your search terms" : "No forms are currently live"}
          </p>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Eye,
  Code,
  Trash2,
  Plus,
  Edit,
  MoreHorizontal,
  Search,
  Filter,
  Copy,
  ExternalLink,
  ToggleRight,
  ToggleLeft,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface Form {
  id: string
  title: string
  elements: any[]
  createdAt: string
  updatedAt: string
  submissions: number
  isActive: boolean
}

export default function FormsPage() {
  const [forms, setForms] = useState<Form[]>([])
  const [filteredForms, setFilteredForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchForms()
  }, [])

  useEffect(() => {
    const filtered = forms.filter((form) => form.title.toLowerCase().includes(searchTerm.toLowerCase()))
    setFilteredForms(filtered)
  }, [forms, searchTerm])

  const fetchForms = async () => {
    try {
      const response = await fetch("/api/forms")
      const data = await response.json()
      setForms(data)
      setFilteredForms(data)
    } catch (error) {
      console.error("Error fetching forms:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteForm = async (formId: string) => {
    if (!confirm("Are you sure you want to delete this form? This will also delete all submissions for this form."))
      return

    try {
      await fetch(`/api/forms/${formId}`, { method: "DELETE" })
      setForms(forms.filter((form) => form.id !== formId))
    } catch (error) {
      console.error("Error deleting form:", error)
    }
  }

  const duplicateForm = async (form: Form) => {
    try {
      const response = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${form.title} (Copy)`,
          elements: form.elements,
          submissionType: form.submissionType,
          redirectUrl: form.redirectUrl,
          successMessageHtml: form.successMessageHtml,
          isActive: form.isActive,
        }),
      })

      if (response.ok) {
        fetchForms()
      }
    } catch (error) {
      console.error("Error duplicating form:", error)
    }
  }

  const toggleFormStatus = async (formId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/forms/${formId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (response.ok) {
        fetchForms() // Re-fetch forms to update status
      } else {
        alert("Failed to update form status.")
      }
    } catch (error) {
      console.error("Error toggling form status:", error)
      alert("An error occurred while updating form status.")
    }
  }

  const copyEmbedCode = (formId: string) => {
    const baseUrl = window.location.origin
    const embedCode = `<div id="formcraft-${formId}" data-formcraft-id="${formId}"></div>
<script src="${baseUrl}/embed.js"></script>`

    navigator.clipboard.writeText(embedCode)
    alert("Embed code copied to clipboard!")
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Forms</h1>
          <p className="text-gray-600 mt-2">Manage and view all your created forms</p>
        </div>
        <Link href="/builder">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New Form
          </Button>
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search forms..."
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

      {/* Forms Grid */}
      {filteredForms.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Plus className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{searchTerm ? "No forms found" : "No forms yet"}</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Create your first form to get started"}
            </p>
            {!searchTerm && (
              <Link href="/builder">
                <Button>Create Form</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredForms.map((form) => (
            <Card key={form.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{form.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {form.elements.length} fields • {form.submissions} submissions
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/forms/${form.id}`)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/builder?id=${form.id}`)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Form
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => duplicateForm(form)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => copyEmbedCode(form.id)}>
                        <Code className="h-4 w-4 mr-2" />
                        Copy Embed Code
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.open(`/test?formId=${form.id}`, "_blank")}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Test Form
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleFormStatus(form.id, form.isActive)}>
                        {form.isActive ? (
                          <ToggleLeft className="h-4 w-4 mr-2" />
                        ) : (
                          <ToggleRight className="h-4 w-4 mr-2" />
                        )}
                        {form.isActive ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteForm(form.id)} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <Badge variant={form.isActive ? "default" : "outline"}>{form.isActive ? "Active" : "Inactive"}</Badge>
                  <span className="text-sm text-gray-500">Updated {new Date(form.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2">
                  <Link href={`/forms/${form.id}`}>
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </Link>
                  <Link href={`/builder?id=${form.id}`}>
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

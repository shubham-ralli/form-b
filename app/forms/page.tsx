
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Copy, Edit, ExternalLink, Trash2, Plus, Eye, Power, PowerOff, Globe, Code, MoreHorizontal, FileText, Search } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Form {
  _id: string
  title: string
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  submissionCount: number
  elements: any[]
}

export default function FormsPage() {
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
      (form.description && form.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    setFilteredForms(filtered)
  }, [forms, searchTerm])

  const fetchForms = async () => {
    try {
      const response = await fetch("/api/forms")
      if (response.ok) {
        const data = await response.json()
        // Handle both array response and object with forms property
        const formsData = Array.isArray(data) ? data : (data.forms || [])
        setForms(formsData)
        setFilteredForms(formsData)
      } else {
        toast.error("Failed to fetch forms")
        setForms([])
        setFilteredForms([])
      }
    } catch (error) {
      console.error("Error fetching forms:", error)
      toast.error("Error fetching forms")
      setForms([])
      setFilteredForms([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateForm = () => {
    // Redirect directly to builder page
    window.location.href = '/builder'
  }

  const handleDeleteForm = async (formId: string) => {
    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Form deleted successfully")
        fetchForms()
      } else {
        toast.error("Failed to delete form")
      }
    } catch (error) {
      console.error("Error deleting form:", error)
      toast.error("Error deleting form")
    }
  }

  const handleToggleFormStatus = async (formId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/forms/${formId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        toast.success(`Form ${!isActive ? "activated" : "deactivated"} successfully`)
        fetchForms()
      } else {
        toast.error("Failed to update form status")
      }
    } catch (error) {
      console.error("Error updating form status:", error)
      toast.error("Error updating form status")
    }
  }

  const copyLiveUrl = (formId: string) => {
    const url = `${window.location.origin}/live/${formId}`
    navigator.clipboard.writeText(url)
    toast.success("Live URL copied to clipboard!")
  }

  const copyEmbedCode = (formId: string) => {
    const embedCode = `<div id="formcraft-${formId}" data-formcraft-id="${formId}"></div>
<script src="${window.location.origin}/embed.js"></script>`
    navigator.clipboard.writeText(embedCode)
    toast.success("Embed code copied to clipboard!")
  }

  const duplicateForm = async (formId: string) => {
    try {
      // Get form data first
      const response = await fetch(`/api/forms/${formId}`)
      if (response.ok) {
        const formData = await response.json()
        
        // Create new form with copied data
        const newFormData = {
          title: `${formData.title} (Copy)`,
          description: formData.description || "",
          elements: formData.elements || []
        }

        const createResponse = await fetch("/api/forms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newFormData),
        })

        if (createResponse.ok) {
          toast.success("Form duplicated successfully")
          fetchForms()
        } else {
          toast.error("Failed to duplicate form")
        }
      }
    } catch (error) {
      console.error("Error duplicating form:", error)
      toast.error("Error duplicating form")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading forms...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">My Forms</h1>
        <Button onClick={handleCreateForm}>
          <Plus className="h-4 w-4 mr-2" />
          Create Form
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search forms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredForms && filteredForms.length > 0 && filteredForms.map((form) => (
          <Card key={form._id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-semibold truncate">
                    {form.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-gray-600">
                      {form.elements?.length || 0} fields
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-600">
                      {form.submissionCount || 0} submissions
                    </span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => window.location.href = `/forms/${form._id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.location.href = `/builder?id=${form._id}`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Form
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => duplicateForm(form._id)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => copyEmbedCode(form._id)}>
                      <Code className="h-4 w-4 mr-2" />
                      Copy Embed Code
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.open(`/live/${form._id}`, '_blank')}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Test Form
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleFormStatus(form._id, form.isActive)}>
                      {form.isActive ? (
                        <>
                          <PowerOff className="h-4 w-4 mr-2" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Power className="h-4 w-4 mr-2" />
                          Activate
                        </>
                      )}
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Form</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{form.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteForm(form._id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <Badge variant={form.isActive ? "default" : "secondary"} className="rounded-full">
                  {form.isActive ? "Active" : "Inactive"}
                </Badge>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(`/live/${form._id}`, '_blank')}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = `/builder?id=${form._id}`}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
              <h3 className="text-lg font-semibold mb-2">No forms created yet</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first form</p>
              <Button onClick={handleCreateForm}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Form
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

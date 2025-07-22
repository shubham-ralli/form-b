
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
import { useForms } from "@/contexts/FormsContext"

export default function FormsPage() {
  const { forms, loading, error, refreshForms, updateForm, deleteForm, addForm } = useForms()
  const [filteredForms, setFilteredForms] = useState(forms)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const filtered = forms.filter((form) =>
      form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (form.description && form.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    setFilteredForms(filtered)
  }, [forms, searchTerm])

  const handleCreateForm = async () => {
    try {
      // Create a new form with a better default name
      const currentDate = new Date().toLocaleDateString()
      const defaultFormData = {
        title: `New Form - ${currentDate}`,
        description: "Created with FormCraft",
        elements: [],
        submissionType: "message",
        successMessageHtml: "<h3>Thank you for your submission!</h3><p>We have received your response.</p>",
        isActive: true
      }

      const response = await fetch("/api/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(defaultFormData),
      })

      if (response.ok) {
        const newForm = await response.json()
        // Add to context immediately for better UX
        addForm(newForm)
        // Navigate to builder with the new form ID
        window.location.href = `/builder?id=${newForm._id || newForm.formId}`
      } else {
        toast.error("Failed to create form")
      }
    } catch (error) {
      console.error("Error creating form:", error)
      toast.error("Error creating form")
    }
  }

  const handleDeleteForm = async (formId: string) => {
    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Form deleted successfully")
        deleteForm(formId) // Update local state immediately
      } else {
        toast.error("Failed to delete form")
      }
    } catch (error) {
      console.error("Error deleting form:", error)
      toast.error("Error deleting form")
    }
  }

  const handleToggleFormStatus = async (formId: string, isActive: boolean) => {
    // Update local state immediately for better UX
    updateForm(formId, { isActive: !isActive })
    
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
      } else {
        // Revert if failed
        updateForm(formId, { isActive })
        toast.error("Failed to update form status")
      }
    } catch (error) {
      // Revert if failed
      updateForm(formId, { isActive })
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
      // Find form in local state first
      const originalForm = forms.find(f => f._id === formId)
      if (!originalForm) {
        toast.error("Form not found")
        return
      }

      // Create new form with copied data
      const newFormData = {
        title: `${originalForm.title} (Copy)`,
        description: originalForm.description || "",
        elements: originalForm.elements || []
      }

      const createResponse = await fetch("/api/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newFormData),
      })

      if (createResponse.ok) {
        const newForm = await createResponse.json()
        addForm(newForm) // Add to local state immediately
        toast.success("Form duplicated successfully")
      } else {
        toast.error("Failed to duplicate form")
      }
    } catch (error) {
      console.error("Error duplicating form:", error)
      toast.error("Error duplicating form")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">My Forms</h1>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Create Form
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </CardContent>
            </Card>
          ))}
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
                      {(form.elements && Array.isArray(form.elements) ? form.elements.length : 0)} fields
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

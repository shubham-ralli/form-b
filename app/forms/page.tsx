
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Edit, ExternalLink, Trash2, Plus, Eye, Power, PowerOff, Globe, Code } from "lucide-react"
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
}

export default function FormsPage() {
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newForm, setNewForm] = useState({
    title: "",
    description: "",
  })

  useEffect(() => {
    fetchForms()
  }, [])

  const fetchForms = async () => {
    try {
      const response = await fetch("/api/forms")
      if (response.ok) {
        const data = await response.json()
        // Handle both array response and object with forms property
        const formsData = Array.isArray(data) ? data : (data.forms || [])
        setForms(formsData)
      } else {
        toast.error("Failed to fetch forms")
        setForms([])
      }
    } catch (error) {
      console.error("Error fetching forms:", error)
      toast.error("Error fetching forms")
      setForms([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateForm = async () => {
    if (!newForm.title.trim()) {
      toast.error("Form title is required")
      return
    }

    try {
      const response = await fetch("/api/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newForm),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success("Form created successfully")
        setShowCreateDialog(false)
        setNewForm({ title: "", description: "" })
        fetchForms()
        // Redirect to form builder
        window.location.href = `/forms/${data.formId}`
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to create form")
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

  const copyEmbedCode = (formId: string) => {
    const embedCode = `<div id="formcraft-${formId}"></div>
<script src="${window.location.origin}/embed.js"></script>
<script>
  FormCraft.render('${formId}', 'formcraft-${formId}');
</script>`
    
    navigator.clipboard.writeText(embedCode)
    toast.success("Embed code copied to clipboard!")
  }

  const copyLiveUrl = (formId: string) => {
    const liveUrl = `${window.location.origin}/live/${formId}`
    navigator.clipboard.writeText(liveUrl)
    toast.success("Live URL copied to clipboard!")
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
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Form
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Form</DialogTitle>
              <DialogDescription>
                Create a new form to start collecting responses.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Form Title</Label>
                <Input
                  id="title"
                  value={newForm.title}
                  onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
                  placeholder="Enter form title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={newForm.description}
                  onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                  placeholder="Enter form description"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateForm}>Create Form</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {forms && forms.length > 0 && forms.map((form) => (
          <Card key={form._id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {form.title}
                    <Badge variant={form.isActive ? "default" : "secondary"}>
                      {form.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{form.description || "No description"}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyLiveUrl(form._id)}
                  >
                    <Globe className="h-4 w-4 mr-1" />
                    Copy Live URL
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyEmbedCode(form._id)}
                  >
                    <Code className="h-4 w-4 mr-1" />
                    Copy Embed
                  </Button>
                  <Link href={`/forms/${form._id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/live/${form._id}`} target="_blank">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                  </Link>
                  <Button
                    variant={form.isActive ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleToggleFormStatus(form._id, form.isActive)}
                  >
                    {form.isActive ? (
                      <PowerOff className="h-4 w-4 mr-1" />
                    ) : (
                      <Power className="h-4 w-4 mr-1" />
                    )}
                    {form.isActive ? "Disable" : "Enable"}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
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
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Created:</span> {new Date(form.createdAt).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Updated:</span> {new Date(form.updatedAt).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Submissions:</span> {form.submissionCount}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!forms || forms.length === 0) && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No forms created yet</p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Form
          </Button>
        </div>
      )}
    </div>
  )
}

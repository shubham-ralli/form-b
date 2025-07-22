
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  ArrowLeft,
  Search,
  MoreHorizontal,
  Trash2,
  Eye,
  Edit,
  ExternalLink,
  PauseCircle,
  PlayCircle,
  Users,
  FileText,
  Calendar,
  BarChart3
} from "lucide-react"

interface Form {
  id: string
  title: string
  elements: any[]
  createdAt: string
  updatedAt: string
  submissions: number
  isActive: boolean
}

interface UserData {
  id: string
  name: string
  email: string
}

export default function AdminUserFormsPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [forms, setForms] = useState<Form[]>([])
  const [filteredForms, setFilteredForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (params.id) {
      fetchUserForms()
    }
  }, [params.id])

  useEffect(() => {
    const filtered = forms.filter((form) =>
      form.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredForms(filtered)
  }, [forms, searchTerm])

  const fetchUserForms = async () => {
    try {
      const response = await fetch(`/api/admin/users/${params.id}/forms`)
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setForms(data.forms)
        setFilteredForms(data.forms)
      } else {
        console.error("Failed to fetch user forms")
      }
    } catch (error) {
      console.error("Error fetching user forms:", error)
    } finally {
      setLoading(false)
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
        fetchUserForms()
      } else {
        alert("Failed to update form status")
      }
    } catch (error) {
      console.error("Error toggling form status:", error)
      alert("An error occurred while updating form status")
    }
  }

  const deleteForm = async (formId: string, formTitle: string) => {
    if (!confirm(`Are you sure you want to delete the form "${formTitle}"? This will also delete all submissions for this form.`)) {
      return
    }

    try {
      const response = await fetch(`/api/forms/${formId}`, { method: "DELETE" })
      if (response.ok) {
        fetchUserForms()
      } else {
        alert("Failed to delete form")
      }
    } catch (error) {
      console.error("Error deleting form:", error)
      alert("An error occurred while deleting form")
    }
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

  if (!user) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">User not found</h3>
        <Button onClick={() => router.push('/admin/users')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.push('/admin/users')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{user.name}'s Forms</h1>
            <p className="text-gray-600 mt-1">{user.email} • {forms.length} forms total</p>
          </div>
        </div>
        <Badge variant="secondary">
          <Users className="h-4 w-4 mr-2" />
          Admin View
        </Badge>
      </div>

      {/* Search */}
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
      </div>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forms.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Forms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {forms.filter(f => f.isActive !== false).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {forms.reduce((sum, form) => sum + form.submissions, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Fields/Form</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {forms.length > 0 ? Math.round(forms.reduce((sum, form) => sum + form.elements.length, 0) / forms.length) : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forms Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Forms</CardTitle>
          <CardDescription>
            All forms created by {user.name} with detailed information and management options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Form Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fields</TableHead>
                <TableHead>Submissions</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredForms.map((form) => (
                <TableRow key={form.id}>
                  <TableCell className="font-medium">{form.title}</TableCell>
                  <TableCell>
                    <Badge variant={form.isActive !== false ? 'default' : 'outline'}>
                      {form.isActive !== false ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>{form.elements.length}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <BarChart3 className="h-4 w-4 mr-1 text-gray-400" />
                      {form.submissions}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      {new Date(form.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(form.updatedAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
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
                        <DropdownMenuItem onClick={() => window.open(`/live/${form.id}`, '_blank')}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Live Form
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/builder?id=${form.id}`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Form
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toggleFormStatus(form.id, form.isActive)}
                          className={form.isActive !== false ? "text-orange-600" : "text-green-600"}
                        >
                          {form.isActive !== false ? (
                            <>
                              <PauseCircle className="h-4 w-4 mr-2" />
                              Disable Form
                            </>
                          ) : (
                            <>
                              <PlayCircle className="h-4 w-4 mr-2" />
                              Enable Form
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteForm(form.id, form.title)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Form
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredForms.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No forms found</h3>
              <p className="text-gray-600">
                {searchTerm ? "Try adjusting your search terms" : "This user hasn't created any forms yet"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

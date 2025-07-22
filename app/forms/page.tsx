"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  FileText,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Copy,
  ExternalLink,
  Calendar,
  Users,
  Activity,
  Filter,
} from "lucide-react";
import { useForms } from "@/contexts/FormsContext";
import { toast } from "sonner";

interface Form {
  _id: string;
  title: string;
  description: string;
  elements: any[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  submissionCount: number;
}

export default function MyFormsPage() {
  const router = useRouter();
  const { forms, loading, error, refreshForms, deleteForm } = useForms();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredForms, setFilteredForms] = useState<Form[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<Form | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    refreshForms();
  }, [refreshForms]);

  useEffect(() => {
    let filtered = forms;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((form) =>
        form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((form) =>
        statusFilter === "active" ? form.isActive : !form.isActive
      );
    }

    setFilteredForms(filtered);
  }, [forms, searchTerm, statusFilter]);

  const handleCreateForm = () => {
    router.push("/builder");
  };

  const handleEditForm = (formId: string) => {
    router.push(`/builder?id=${formId}`);
  };

  const handleViewForm = (formId: string) => {
    router.push(`/live/${formId}`);
  };

  const handleDeleteForm = async () => {
    if (!formToDelete) return;

    try {
      await deleteForm(formToDelete._id);
      toast.success("Form deleted successfully!");
      setDeleteDialogOpen(false);
      setFormToDelete(null);
    } catch (error) {
      console.error("Error deleting form:", error);
      toast.error("Failed to delete form. Please try again.");
    }
  };

  const handleCopyFormUrl = (formId: string) => {
    const url = `${window.location.origin}/live/${formId}`;
    navigator.clipboard.writeText(url);
    toast.success("Form URL copied to clipboard!");
  };

  const toggleFormStatus = async (formId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/forms/${formId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        refreshForms();
        toast.success(`Form ${!currentStatus ? "activated" : "deactivated"} successfully!`);
      } else {
        throw new Error("Failed to update form status");
      }
    } catch (error) {
      console.error("Error toggling form status:", error);
      toast.error("Failed to update form status. Please try again.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Forms</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={refreshForms}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Forms</h1>
          <p className="text-gray-600 mt-1">
            Create, manage, and share your forms
          </p>
        </div>

        <Button onClick={handleCreateForm} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Form
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search forms by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Status:</span>
        </div>
        <div className="flex gap-2">
          {[
            { value: "all", label: "All Forms" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ].map((option) => (
            <Button
              key={option.value}
              variant={statusFilter === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(option.value as any)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Forms</p>
                <p className="text-2xl font-bold">{forms.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Forms</p>
                <p className="text-2xl font-bold">
                  {forms.filter((f) => f.isActive).length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold">
                  {forms.reduce((acc, form) => acc + (form.submissionCount || 0), 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Fields</p>
                <p className="text-2xl font-bold">
                  {forms.length > 0 
                    ? Math.round(forms.reduce((acc, form) => acc + (form.elements?.length || 0), 0) / forms.length)
                    : 0
                  }
                </p>
              </div>
              <Eye className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredForms.map((form) => (
          <Card key={form._id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">{form.title}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {form.description || "No description provided"}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewForm(form._id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Form
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditForm(form._id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Form
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCopyFormUrl(form._id)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.open(`/live/${form._id}`, '_blank')}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in New Tab
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setFormToDelete(form);
                        setDeleteDialogOpen(true);
                      }}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Form
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <Badge 
                    variant={form.isActive ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => toggleFormStatus(form._id, form.isActive)}
                  >
                    {form.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    Click to toggle
                  </span>
                </div>

                {/* Form Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {form.elements?.length || 0} fields
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {form.submissionCount || 0} submissions
                    </span>
                  </div>
                </div>

                {/* Dates */}
                <div className="text-xs text-gray-500 space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>Created: {formatDate(form.createdAt)}</span>
                  </div>
                  {form.updatedAt !== form.createdAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>Updated: {formatDate(form.updatedAt)}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewForm(form._id)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditForm(form._id)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredForms.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm || statusFilter !== "all" ? "No forms found" : "No forms created yet"}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search terms or filters to find what you're looking for."
                  : "Get started by creating your first form. It's easy and takes just a few minutes!"
                }
              </p>
              {(!searchTerm && statusFilter === "all") && (
                <Button onClick={handleCreateForm} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Form
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the form "{formToDelete?.title}" and all its submissions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFormToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteForm} className="bg-red-600 hover:bg-red-700">
              Delete Form
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
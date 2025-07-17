"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Trash2, Settings, Save, Eye, Plus, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils" // Corrected import path

interface FormElement {
  id: string
  type: string
  label: string
  placeholder?: string
  required?: boolean
  options?: string[]
  width?: "w-full" | "w-1/2"
}

interface FormConfig {
  id?: string
  title: string
  elements: FormElement[]
  submissionType: "message" | "redirect"
  redirectUrl?: string
  successMessageHtml?: string
  isActive: boolean
}

const ELEMENT_TYPES = [
  { type: "text", label: "Text Input", icon: "📝" },
  { type: "email", label: "Email Input", icon: "📧" },
  { type: "textarea", label: "Text Area", icon: "📄" },
  { type: "select", label: "Select Dropdown", icon: "📋" },
  { type: "radio", label: "Radio Buttons", icon: "🔘" },
  { type: "checkbox", label: "Checkbox", icon: "☑️" },
]

function DraggableElement({ type, label, icon }: { type: string; label: string; icon: string }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "element",
    item: { type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  return (
    <div
      ref={drag}
      className={`p-3 border rounded-lg cursor-move hover:bg-gray-50 transition-colors ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
    </div>
  )
}

function ElementSettingsDialog({
  element,
  onUpdate,
  open,
  onOpenChange,
}: {
  element: FormElement
  onUpdate: (updates: Partial<FormElement>) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [label, setLabel] = useState(element.label)
  const [placeholder, setPlaceholder] = useState(element.placeholder || "")
  const [required, setRequired] = useState(element.required || false)
  const [options, setOptions] = useState(element.options || [])
  const [newOption, setNewOption] = useState("")
  const [width, setWidth] = useState(element.width || "w-full")

  useEffect(() => {
    // Reset state when element changes (dialog opens for a new element)
    setLabel(element.label)
    setPlaceholder(element.placeholder || "")
    setRequired(element.required || false)
    setOptions(element.options || [])
    setNewOption("")
    setWidth(element.width || "w-full")
  }, [element])

  const hasOptions = ["select", "radio", "checkbox"].includes(element.type)

  const handleSave = () => {
    onUpdate({
      label,
      placeholder: placeholder || undefined,
      required,
      options: hasOptions ? options : undefined,
      width,
    })
    onOpenChange(false)
  }

  const addOption = () => {
    if (newOption.trim()) {
      setOptions((prev) => [...prev, newOption.trim()])
      setNewOption("")
    }
  }

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Element Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Enter field label"
            />
          </div>

          {element.type !== "checkbox" && (
            <div>
              <Label htmlFor="placeholder">Placeholder</Label>
              <Input
                id="placeholder"
                value={placeholder}
                onChange={(e) => setPlaceholder(e.target.value)}
                placeholder="Enter placeholder text"
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch id="required" checked={required} onCheckedChange={setRequired} />
            <Label htmlFor="required">Required field</Label>
          </div>

          <div>
            <Label htmlFor="width">Width</Label>
            <Select value={width} onValueChange={setWidth}>
              <SelectTrigger id="width">
                <SelectValue placeholder="Select width" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="w-full">Full Width</SelectItem>
                <SelectItem value="w-1/2">Half Width</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasOptions && (
            <div>
              <Label>Options</Label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input value={option} readOnly />
                    <Button type="button" variant="outline" size="sm" onClick={() => removeOption(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <Input
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    placeholder="Add new option"
                    onKeyPress={(e) => e.key === "Enter" && addOption()}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addOption}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function FormElementRenderer({
  element,
  onUpdate,
  onDelete,
  isPreview = false,
}: {
  element: FormElement
  onUpdate: (id: string, updates: Partial<FormElement>) => void
  onDelete: (id: string) => void
  isPreview?: boolean
}) {
  const [settingsOpen, setSettingsOpen] = useState(false)

  const handleUpdateElement = (updates: Partial<FormElement>) => {
    onUpdate(element.id, updates)
  }

  const renderElement = () => {
    switch (element.type) {
      case "text":
      case "email":
        return (
          <Input
            type={element.type}
            placeholder={element.placeholder || `Enter ${element.label.toLowerCase()}`}
            disabled={!isPreview}
            required={element.required}
            name={element.id}
          />
        )
      case "textarea":
        return (
          <Textarea
            placeholder={element.placeholder || `Enter ${element.label.toLowerCase()}`}
            disabled={!isPreview}
            required={element.required}
            name={element.id}
          />
        )
      case "select":
        return (
          <Select disabled={!isPreview} name={element.id} required={element.required}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {element.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case "radio":
        return (
          <RadioGroup disabled={!isPreview} name={element.id} required={element.required}>
            {element.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${element.id}-${index}`} />
                <Label htmlFor={`${element.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )
      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name={element.id}
              value="true"
              disabled={!isPreview}
              required={element.required}
              className="h-4 w-4"
            />
            <label className="text-sm">{element.label}</label>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <>
      <div
        className={cn(
          "group relative p-4 border rounded-lg transition-colors",
          isPreview ? "border-gray-200" : "hover:border-blue-300",
          element.width, // Apply width class here
        )}
      >
        {!isPreview && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => setSettingsOpen(true)}>
                <Settings className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onDelete(element.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {element.type !== "checkbox" && (
            <Label className="text-sm font-medium">
              {element.label}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          )}
          {renderElement()}
        </div>
      </div>

      <ElementSettingsDialog
        element={element}
        onUpdate={handleUpdateElement}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </>
  )
}

function DropZone({
  elements,
  onDrop,
  onUpdate,
  onDelete,
}: {
  elements: FormElement[]
  onDrop: (item: { type: string }) => void
  onUpdate: (id: string, updates: Partial<FormElement>) => void
  onDelete: (id: string) => void
}) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "element",
    drop: onDrop,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }))

  return (
    <div
      ref={drop}
      className={cn(
        "min-h-96 p-6 border-2 border-dashed rounded-lg transition-colors",
        isOver ? "border-blue-400 bg-blue-50" : "border-gray-300",
        "flex flex-wrap gap-4", // Added flex-wrap and gap
      )}
    >
      {elements.length === 0 ? (
        <div className="text-center text-gray-500 py-12 w-full">
          <p className="text-lg mb-2">Drop form elements here</p>
          <p className="text-sm">Drag elements from the sidebar to build your form</p>
        </div>
      ) : (
        elements.map((element) => (
          <FormElementRenderer key={element.id} element={element} onUpdate={onUpdate} onDelete={onDelete} />
        ))
      )}
    </div>
  )
}

function FormPreview({ formConfig }: { formConfig: FormConfig }) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert("This is a preview - form submission is disabled")
  }

  return (
    <div className="bg-white p-6 rounded-lg border">
      <h3 className="text-xl font-semibold mb-4">{formConfig.title}</h3>
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-4">
        {" "}
        {/* Added flex-wrap and gap */}
        {formConfig.elements.map((element) => (
          <FormElementRenderer
            key={element.id}
            element={element}
            onUpdate={() => {}}
            onDelete={() => {}}
            isPreview={true}
          />
        ))}
        {formConfig.elements.length > 0 && (
          <Button type="submit" className="w-full mt-4">
            Submit Form
          </Button>
        )}
      </form>
    </div>
  )
}

export default function FormBuilder() {
  const [formConfig, setFormConfig] = useState<FormConfig>({
    title: "Untitled Form",
    elements: [],
    submissionType: "message",
    successMessageHtml: "<h3>Thank you for your submission!</h3><p>We have received your response.</p>",
    isActive: true,
  })
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Load existing form if editing
  useEffect(() => {
    const formId = searchParams.get("id")
    if (formId) {
      setIsEditing(true)
      loadForm(formId)
    }
  }, [searchParams])

  const loadForm = async (formId: string) => {
    try {
      const response = await fetch(`/api/forms/${formId}`)
      if (response.ok) {
        const form = await response.json()
        setFormConfig({
          id: form.id,
          title: form.title,
          elements: form.elements,
          submissionType: form.submissionType || "message",
          redirectUrl: form.redirectUrl || "",
          successMessageHtml:
            form.successMessageHtml || "<h3>Thank you for your submission!</h3><p>We have received your response.</p>",
          isActive: form.isActive !== undefined ? form.isActive : true,
        })
      }
    } catch (error) {
      console.error("Error loading form:", error)
    }
  }

  const handleDrop = useCallback((item: { type: string }) => {
    const newElement: FormElement = {
      id: `element_${Date.now()}`,
      type: item.type,
      label: `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} Field`,
      required: false,
      width: "w-full", // Default to full width
      ...(item.type === "select" || item.type === "radio" ? { options: ["Option 1", "Option 2"] } : {}),
      ...(item.type === "checkbox" ? { label: "Check this box" } : {}), // Default label for checkbox
    }

    setFormConfig((prev) => ({
      ...prev,
      elements: [...prev.elements, newElement],
    }))
  }, [])

  const handleUpdateElement = useCallback((id: string, updates: Partial<FormElement>) => {
    setFormConfig((prev) => ({
      ...prev,
      elements: prev.elements.map((el) => (el.id === id ? { ...el, ...updates } : el)),
    }))
  }, [])

  const handleDeleteElement = useCallback((id: string) => {
    setFormConfig((prev) => ({
      ...prev,
      elements: prev.elements.filter((el) => el.id !== id),
    }))
  }, [])

  const handleSaveForm = async () => {
    if (!formConfig.title.trim()) {
      alert("Please enter a form title")
      return
    }

    if (formConfig.elements.length === 0) {
      alert("Please add at least one form element")
      return
    }

    if (formConfig.submissionType === "redirect" && !formConfig.redirectUrl?.trim()) {
      alert("Please enter a redirect URL")
      return
    }

    if (formConfig.submissionType === "message" && !formConfig.successMessageHtml?.trim()) {
      alert("Please enter a success message HTML")
      return
    }

    setLoading(true)

    try {
      const url = isEditing ? `/api/forms/${formConfig.id}` : "/api/forms"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formConfig.title,
          elements: formConfig.elements,
          submissionType: formConfig.submissionType,
          redirectUrl: formConfig.redirectUrl,
          successMessageHtml: formConfig.successMessageHtml,
          isActive: formConfig.isActive,
        }),
      })

      if (response.ok) {
        alert(`Form ${isEditing ? "updated" : "saved"} successfully!`)
        router.push("/forms")
      } else {
        throw new Error(`Failed to ${isEditing ? "update" : "save"} form`)
      }
    } catch (error) {
      alert(`Error ${isEditing ? "updating" : "saving"} form`)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50">
        <div className="border-b bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Input
                value={formConfig.title}
                onChange={(e) => setFormConfig((prev) => ({ ...prev, title: e.target.value }))}
                className="text-lg font-semibold border-none shadow-none p-0 h-auto bg-transparent"
                placeholder="Enter form title"
              />
              <div className="flex items-center space-x-2">
                <Switch
                  id="form-active"
                  checked={formConfig.isActive}
                  onCheckedChange={(checked) => setFormConfig((prev) => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="form-active">{formConfig.isActive ? "Active" : "Inactive"}</Label>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? "Hide Preview" : "Show Preview"}
              </Button>
              <Button onClick={handleSaveForm} size="sm" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : isEditing ? "Update Form" : "Save Form"}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex">
          <div className="w-80 bg-white border-r p-6">
            <h3 className="font-semibold mb-4">Form Elements</h3>
            <div className="space-y-3">
              {ELEMENT_TYPES.map((elementType) => (
                <DraggableElement
                  key={elementType.type}
                  type={elementType.type}
                  label={elementType.label}
                  icon={elementType.icon}
                />
              ))}
            </div>
            <div className="mt-8">
              <h3 className="font-semibold mb-4">Submission Settings</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="submissionType">After Submission</Label>
                  <Select
                    value={formConfig.submissionType}
                    onValueChange={(value: "message" | "redirect") =>
                      setFormConfig((prev) => ({ ...prev, submissionType: value }))
                    }
                  >
                    <SelectTrigger id="submissionType">
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="message">Show Success Message</SelectItem>
                      <SelectItem value="redirect">Redirect to URL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formConfig.submissionType === "redirect" && (
                  <div>
                    <Label htmlFor="redirectUrl">Redirect URL</Label>
                    <Input
                      id="redirectUrl"
                      value={formConfig.redirectUrl || ""}
                      onChange={(e) => setFormConfig((prev) => ({ ...prev, redirectUrl: e.target.value }))}
                      placeholder="https://yourwebsite.com/thank-you"
                    />
                  </div>
                )}

                {formConfig.submissionType === "message" && (
                  <div>
                    <Label htmlFor="successMessageHtml">Success Message (HTML)</Label>
                    <Textarea
                      id="successMessageHtml"
                      value={formConfig.successMessageHtml || ""}
                      onChange={(e) => setFormConfig((prev) => ({ ...prev, successMessageHtml: e.target.value }))}
                      placeholder="<h3>Thank you!</h3><p>Your submission was received.</p>"
                      rows={5}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Form Builder</CardTitle>
                </CardHeader>
                <CardContent>
                  <DropZone
                    elements={formConfig.elements}
                    onDrop={handleDrop}
                    onUpdate={handleUpdateElement}
                    onDelete={handleDeleteElement}
                  />
                </CardContent>
              </Card>

              {showPreview && (
                <Card>
                  <CardHeader>
                    <CardTitle>Live Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormPreview formConfig={formConfig} />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  )
}

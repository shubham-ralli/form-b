
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Trash2, Settings, Save, Eye, Plus, X, ArrowLeft, Palette, Layers, Type, Hash, Calendar, Mail, Phone, Link, FileText, List, Circle, CheckSquare, Heading1, AlignLeft, Star, Copy, ChevronDown, HelpCircle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { useForms } from "@/contexts/FormsContext"
import { toast } from "sonner"

interface FormElement {
  id: string
  type: string
  label: string
  placeholder?: string
  required?: boolean
  options?: string[]
  width?: "w-full" | "w-1/2" | "w-1/3" | "w-2/3"
  min?: number
  max?: number
  content?: string
  description?: string
  defaultValue?: string
  validation?: {
    pattern?: string
    minLength?: number
    maxLength?: number
    customError?: string
  }
  logic?: {
    showIf?: string
    hideIf?: string
  }
  style?: {
    fontSize?: string
    color?: string
    backgroundColor?: string
  }
}

interface FormConfig {
  id?: string
  title: string
  subtitle?: string
  elements: FormElement[]
  submissionType: "message" | "redirect"
  redirectUrl?: string
  successMessageHtml?: string
  isActive: boolean
  buttonText?: string
  theme?: {
    primaryColor?: string
    backgroundColor?: string
    fontFamily?: string
    style?: string
    colorMode?: string
    language?: string
    rtlLayout?: boolean
    uppercaseLabels?: boolean
    inputSize?: string
    inputRoundness?: string
    formWidth?: string
    hideBranding?: boolean
    showProgressBar?: boolean
    transparentBackground?: boolean
    confettiOnSuccess?: boolean
    autoFocusFirst?: boolean
  }
}

const ELEMENT_TYPES = [
  { type: "text", label: "Text Input", icon: Type, category: "Input" },
  { type: "email", label: "Email", icon: Mail, category: "Input" },
  { type: "password", label: "Password", icon: Hash, category: "Input" },
  { type: "number", label: "Number", icon: Hash, category: "Input" },
  { type: "date", label: "Date", icon: Calendar, category: "Input" },
  { type: "tel", label: "Phone", icon: Phone, category: "Input" },
  { type: "url", label: "URL", icon: Link, category: "Input" },
  { type: "textarea", label: "Text Area", icon: FileText, category: "Input" },
  { type: "select", label: "Dropdown", icon: ChevronDown, category: "Choice" },
  { type: "radio", label: "Radio", icon: Circle, category: "Choice" },
  { type: "checkbox", label: "Checkbox", icon: CheckSquare, category: "Choice" },
  { type: "heading", label: "Heading", icon: Heading1, category: "Content" },
  { type: "paragraph", label: "Paragraph", icon: AlignLeft, category: "Content" },
  { type: "rating", label: "Rating", icon: Star, category: "Special" },
  { type: "file", label: "File Upload", icon: Plus, category: "Special" }
]

function ElementIcon({ type, className }: { type: string; className?: string }) {
  const elementType = ELEMENT_TYPES.find(el => el.type === type)
  const IconComponent = elementType?.icon || Type
  return <IconComponent className={className} />
}

function DraggableElement({ type, label, icon: IconComponent }: { type: string; label: string; icon: any }) {
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
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-move hover:border-blue-300 hover:bg-blue-50 transition-all duration-200",
        isDragging && "opacity-50"
      )}
    >
      <IconComponent className="h-4 w-4 text-gray-600" />
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
  )
}

function FormElementRenderer({
  element,
  onUpdate,
  onDelete,
  onSelect,
  isSelected = false,
  isPreview = false,
}: {
  element: FormElement
  onUpdate: (id: string, updates: Partial<FormElement>) => void
  onDelete: (id: string) => void
  onSelect: (element: FormElement | null) => void
  isSelected?: boolean
  isPreview?: boolean
}) {
  const renderElement = () => {
    switch (element.type) {
      case "text":
      case "email":
      case "password":
      case "tel":
      case "url":
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {element.label}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {element.description && (
              <p className="text-xs text-gray-500">{element.description}</p>
            )}
            <Input
              type={element.type}
              placeholder={element.placeholder || `Enter ${element.label.toLowerCase()}`}
              disabled={!isPreview}
              required={element.required}
              defaultValue={element.defaultValue}
              className="w-full"
            />
          </div>
        )
      
      case "number":
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {element.label}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {element.description && (
              <p className="text-xs text-gray-500">{element.description}</p>
            )}
            <Input
              type="number"
              placeholder={element.placeholder}
              disabled={!isPreview}
              required={element.required}
              min={element.min}
              max={element.max}
              defaultValue={element.defaultValue}
              className="w-full"
            />
          </div>
        )
      
      case "date":
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {element.label}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {element.description && (
              <p className="text-xs text-gray-500">{element.description}</p>
            )}
            <Input
              type="date"
              disabled={!isPreview}
              required={element.required}
              defaultValue={element.defaultValue}
              className="w-full"
            />
          </div>
        )
      
      case "textarea":
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {element.label}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {element.description && (
              <p className="text-xs text-gray-500">{element.description}</p>
            )}
            <Textarea
              placeholder={element.placeholder}
              disabled={!isPreview}
              required={element.required}
              defaultValue={element.defaultValue}
              className="w-full min-h-[100px]"
            />
          </div>
        )
      
      case "select":
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {element.label}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {element.description && (
              <p className="text-xs text-gray-500">{element.description}</p>
            )}
            <Select disabled={!isPreview}>
              <SelectTrigger className="w-full">
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
          </div>
        )
      
      case "radio":
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {element.label}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {element.description && (
              <p className="text-xs text-gray-500">{element.description}</p>
            )}
            <RadioGroup disabled={!isPreview} className="space-y-2">
              {element.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${element.id}-${index}`} />
                  <Label htmlFor={`${element.id}-${index}`} className="text-sm">{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )
      
      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              disabled={!isPreview}
              required={element.required}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <Label className="text-sm">
              {element.label}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          </div>
        )
      
      case "heading":
        return (
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">
              {element.content || element.label}
            </h2>
          </div>
        )
      
      case "paragraph":
        return (
          <div className="space-y-2">
            <p className="text-gray-600">
              {element.content || element.label}
            </p>
          </div>
        )
      
      case "rating":
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {element.label}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {element.description && (
              <p className="text-xs text-gray-500">{element.description}</p>
            )}
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-6 w-6 text-gray-300 hover:text-yellow-400 cursor-pointer" />
              ))}
            </div>
          </div>
        )
      
      case "file":
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {element.label}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {element.description && (
              <p className="text-xs text-gray-500">{element.description}</p>
            )}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
              <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div
      className={cn(
        "relative p-4 rounded-lg transition-all duration-200 cursor-pointer group",
        isSelected ? "bg-blue-50 border-2 border-blue-400" : "bg-white border border-gray-200 hover:border-gray-300",
        !isPreview && "hover:shadow-sm"
      )}
      onClick={() => !isPreview && onSelect(element)}
    >
      {!isPreview && (
        <>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(element.id)
                }}
                className="h-6 w-6 p-0 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3 text-red-600" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  // Copy element logic here
                }}
                className="h-6 w-6 p-0 hover:bg-gray-50"
              >
                <Copy className="h-3 w-3 text-gray-600" />
              </Button>
            </div>
          </div>
          
          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Badge variant="secondary" className="text-xs">
              <ElementIcon type={element.type} className="h-3 w-3 mr-1" />
              {element.type}
            </Badge>
          </div>
        </>
      )}
      
      <div className={cn("w-full", !isPreview && "mt-6")}>
        {renderElement()}
      </div>
    </div>
  )
}

function DropZone({
  elements,
  onDrop,
  onUpdate,
  onDelete,
  onSelectElement,
  selectedElement
}: {
  elements: FormElement[]
  onDrop: (item: { type: string }) => void
  onUpdate: (id: string, updates: Partial<FormElement>) => void
  onDelete: (id: string) => void
  onSelectElement: (element: FormElement | null) => void
  selectedElement: FormElement | null
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
        "min-h-[600px] p-6 rounded-lg transition-all duration-200",
        isOver ? "bg-blue-50 border-2 border-dashed border-blue-400" : "bg-gray-50 border border-gray-200"
      )}
    >
      {elements.length === 0 ? (
        <div className="text-center py-16">
          <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Start building your form</h3>
          <p className="text-sm text-gray-500">Drag elements from the sidebar to add them to your form</p>
        </div>
      ) : (
        <div className="space-y-4">
          {elements.map((element) => (
            <FormElementRenderer
              key={element.id}
              element={element}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onSelect={onSelectElement}
              isSelected={selectedElement?.id === element.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ElementPropertiesPanel({ 
  element, 
  onUpdate, 
  onClose 
}: { 
  element: FormElement | null
  onUpdate: (id: string, updates: Partial<FormElement>) => void
  onClose: () => void
}) {
  if (!element) {
    return (
      <div className="p-6 text-center text-gray-500">
        <Settings className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p>Select an element to edit its properties</p>
      </div>
    )
  }

  const [label, setLabel] = useState(element.label)
  const [placeholder, setPlaceholder] = useState(element.placeholder || "")
  const [required, setRequired] = useState(element.required || false)
  const [description, setDescription] = useState(element.description || "")
  const [options, setOptions] = useState(element.options || [])
  const [newOption, setNewOption] = useState("")

  const hasOptions = ["select", "radio"].includes(element.type)

  const updateElement = (updates: Partial<FormElement>) => {
    onUpdate(element.id, updates)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ElementIcon type={element.type} className="h-4 w-4" />
            <h3 className="font-medium">{element.type.charAt(0).toUpperCase() + element.type.slice(1)} Field</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="options" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
            <TabsTrigger value="options">Options</TabsTrigger>
            <TabsTrigger value="logic">Logic</TabsTrigger>
            <TabsTrigger value="validation">Validation</TabsTrigger>
          </TabsList>

          

          <TabsContent value="options" className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="field-name">Field Name</Label>
              <Input
                id="field-name"
                value={label}
                onChange={(e) => {
                  setLabel(e.target.value)
                  updateElement({ label: e.target.value })
                }}
                placeholder="Enter field name"
              />
            </div>

            {element.type !== "checkbox" && element.type !== "heading" && element.type !== "paragraph" && (
              <div className="space-y-2">
                <Label htmlFor="placeholder">Placeholder</Label>
                <Input
                  id="placeholder"
                  value={placeholder}
                  onChange={(e) => {
                    setPlaceholder(e.target.value)
                    updateElement({ placeholder: e.target.value })
                  }}
                  placeholder="Enter placeholder text"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value)
                  updateElement({ description: e.target.value })
                }}
                placeholder="Enter help text"
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="required"
                checked={required}
                onCheckedChange={(checked) => {
                  setRequired(checked)
                  updateElement({ required: checked })
                }}
              />
              <Label htmlFor="required">Required field</Label>
            </div>

            <div className="space-y-2">
              <Label>Block Width</Label>
              <Select
                value={element.width || "w-full"}
                onValueChange={(value) => updateElement({ width: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="w-full">Full Width</SelectItem>
                  <SelectItem value="w-1/2">Half Width</SelectItem>
                  <SelectItem value="w-1/3">One Third</SelectItem>
                  <SelectItem value="w-2/3">Two Thirds</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hasOptions && (
              <div className="space-y-2">
                <Label>Options</Label>
                <div className="space-y-2">
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input value={option} readOnly className="flex-1" />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newOptions = options.filter((_, i) => i !== index)
                          setOptions(newOptions)
                          updateElement({ options: newOptions })
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <Input
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                      placeholder="Add new option"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && newOption.trim()) {
                          const newOptions = [...options, newOption.trim()]
                          setOptions(newOptions)
                          updateElement({ options: newOptions })
                          setNewOption("")
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (newOption.trim()) {
                          const newOptions = [...options, newOption.trim()]
                          setOptions(newOptions)
                          updateElement({ options: newOptions })
                          setNewOption("")
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="logic" className="p-4 space-y-4">
            <div className="text-center py-8 text-gray-500">
              <HelpCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">Logic rules coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="validation" className="p-4 space-y-4">
            <div className="text-center py-8 text-gray-500">
              <HelpCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">Validation rules coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function FormBuilder() {
  const { addForm, updateForm } = useForms()
  const [formConfig, setFormConfig] = useState<FormConfig>({
    title: "Untitled Form",
    subtitle: "Created with FormCraft",
    elements: [],
    submissionType: "message",
    successMessageHtml: "<h3>Thank you for your submission!</h3><p>We have received your response.</p>",
    isActive: true,
    buttonText: "Submit Form",
    theme: {
      primaryColor: "#3b82f6",
      style: "simple",
      colorMode: "system",
      fontFamily: "default",
      language: "english",
      rtlLayout: false,
      uppercaseLabels: false,
      inputSize: "M",
      inputRoundness: "small",
      formWidth: "centered",
      hideBranding: false,
      showProgressBar: false,
      transparentBackground: false,
      confettiOnSuccess: false,
      autoFocusFirst: false
    }
  })
  const [selectedElement, setSelectedElement] = useState<FormElement | null>(null)
  const [activeTab, setActiveTab] = useState("build")
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Load existing form if editing or set title from URL
  useEffect(() => {
    const formId = searchParams.get("id")
    const titleParam = searchParams.get("title")
    
    if (formId) {
      setIsEditing(true)
      loadForm(formId)
    } else if (titleParam) {
      setFormConfig(prev => ({
        ...prev,
        title: decodeURIComponent(titleParam)
      }))
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
          successMessageHtml: form.successMessageHtml || "<h3>Thank you for your submission!</h3><p>We have received your response.</p>",
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
      width: "w-full",
      ...(item.type === "select" || item.type === "radio" ? { options: ["Option 1", "Option 2", "Option 3"] } : {}),
      ...(item.type === "checkbox" ? { label: "Check this box" } : {}),
    }

    setFormConfig((prev) => ({
      ...prev,
      elements: [...prev.elements, newElement],
    }))

    // Auto-select the new element
    setSelectedElement(newElement)
  }, [])

  const handleUpdateElement = useCallback((id: string, updates: Partial<FormElement>) => {
    setFormConfig((prev) => ({
      ...prev,
      elements: prev.elements.map((el) => (el.id === id ? { ...el, ...updates } : el)),
    }))
    
    // Update selected element if it's the one being updated
    if (selectedElement?.id === id) {
      setSelectedElement(prev => prev ? { ...prev, ...updates } : null)
    }
  }, [selectedElement])

  const handleDeleteElement = useCallback((id: string) => {
    setFormConfig((prev) => ({
      ...prev,
      elements: prev.elements.filter((el) => el.id !== id),
    }))
    
    // Clear selection if deleted element was selected
    if (selectedElement?.id === id) {
      setSelectedElement(null)
    }
  }, [selectedElement])

  const handleSaveForm = async () => {
    if (!formConfig.title.trim()) {
      toast.error("Please enter a form title")
      return
    }

    if (formConfig.elements.length === 0) {
      toast.error("Please add at least one form element")
      return
    }

    setLoading(true)

    try {
      const url = isEditing ? `/api/forms/${formConfig.id}` : "/api/forms"
      const method = isEditing ? "PUT" : "POST"

      const formData = {
        title: formConfig.title,
        description: formConfig.subtitle || "",
        elements: formConfig.elements,
        submissionType: formConfig.submissionType,
        redirectUrl: formConfig.redirectUrl,
        successMessageHtml: formConfig.successMessageHtml,
        isActive: formConfig.isActive,
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const result = await response.json()
        
        if (isEditing) {
          updateForm(formConfig.id!, {
            title: formData.title,
            description: formData.description,
            elements: formData.elements,
            isActive: formData.isActive,
            updatedAt: new Date().toISOString()
          })
          toast.success("Form updated successfully!")
        } else {
          const newForm = {
            _id: result._id || result.formId,
            title: formData.title,
            description: formData.description,
            elements: formData.elements,
            isActive: formData.isActive,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            submissionCount: 0
          }
          addForm(newForm)
          toast.success("Form created successfully!")
        }
        
        router.push("/forms")
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${isEditing ? "update" : "save"} form`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Error ${isEditing ? "updating" : "saving"} form`
      toast.error(errorMessage)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const groupedElements = ELEMENT_TYPES.reduce((acc, element) => {
    if (!acc[element.category]) {
      acc[element.category] = []
    }
    acc[element.category].push(element)
    return acc
  }, {} as Record<string, typeof ELEMENT_TYPES>)

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50">
        {/* Top Navigation */}
        <div className="bg-white border-b">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/forms")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="build" className="flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Build
                  </TabsTrigger>
                  <TabsTrigger value="design" className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Design
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>

            <div className="flex-1 max-w-md mx-8">
              <Input
                value={formConfig.title}
                onChange={(e) => setFormConfig((prev) => ({ ...prev, title: e.target.value }))}
                className="text-center font-medium border-none shadow-none text-lg"
                placeholder="My Form"
              />
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button onClick={handleSaveForm} size="sm" disabled={loading}>
                {loading ? "Publishing..." : "Publish Form"}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(100vh-73px)]">
          {/* Left Sidebar - Elements */}
          <div className="w-80 bg-white border-r overflow-y-auto">
            <div className="p-4">
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Add Block</h3>
                <p className="text-sm text-gray-500">Drag elements to your form</p>
              </div>

              <div className="space-y-6">
                {Object.entries(groupedElements).map(([category, elements]) => (
                  <div key={category}>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">{category}</h4>
                    <div className="space-y-2">
                      {elements.map((elementType) => (
                        <DraggableElement
                          key={elementType.type}
                          type={elementType.type}
                          label={elementType.label}
                          icon={elementType.icon}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center - Form Preview */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="p-6 border-b">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-3 h-3 rounded-full bg-red-400"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                          <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                        <span className="text-sm text-gray-500 ml-4">Form Preview</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="text-center mb-6">
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">{formConfig.title}</h1>
                      {formConfig.subtitle && (
                        <p className="text-gray-600">{formConfig.subtitle}</p>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    <DropZone
                      elements={formConfig.elements}
                      onDrop={handleDrop}
                      onUpdate={handleUpdateElement}
                      onDelete={handleDeleteElement}
                      onSelectElement={setSelectedElement}
                      selectedElement={selectedElement}
                    />
                    
                    {formConfig.elements.length > 0 && (
                      <div className="mt-8 text-center">
                        <Button className="w-full max-w-xs">
                          {formConfig.buttonText || "Submit"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Element Properties or Design */}
          <div className="w-80 bg-white border-l">
            {activeTab === "build" && (
              <ElementPropertiesPanel
                element={selectedElement}
                onUpdate={handleUpdateElement}
                onClose={() => setSelectedElement(null)}
              />
            )}
            {activeTab === "design" && (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b">
                  <h3 className="font-medium">Design Settings</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {/* Basic Appearance */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Palette className="h-4 w-4" />
                      <h4 className="font-medium">Basic Appearance</h4>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Form Theme */}
                      <div className="space-y-2">
                        <Label>Form Theme</Label>
                        <Select 
                          value={formConfig.theme?.style || "simple"}
                          onValueChange={(value) => setFormConfig(prev => ({
                            ...prev,
                            theme: { ...prev.theme, style: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select theme" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="simple">Simple (no shadows)</SelectItem>
                            <SelectItem value="modern">Modern</SelectItem>
                            <SelectItem value="classic">Classic</SelectItem>
                            <SelectItem value="minimal">Minimal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Accent Color */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Accent Color</Label>
                          <Button variant="ghost" size="sm" className="text-blue-600">Reset</Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={formConfig.theme?.primaryColor || "#3b82f6"}
                            onChange={(e) => setFormConfig(prev => ({
                              ...prev,
                              theme: { ...prev.theme, primaryColor: e.target.value }
                            }))}
                            className="w-12 h-8 rounded border"
                          />
                          <span className="text-sm text-gray-600">{formConfig.theme?.primaryColor || "#3b82f6"}</span>
                        </div>
                      </div>

                      {/* Color Mode */}
                      <div className="space-y-2">
                        <Label>Color Mode</Label>
                        <div className="flex gap-2">
                          {[
                            { value: "system", label: "System", icon: "🖥️" },
                            { value: "light", label: "Light", icon: "☀️" },
                            { value: "dark", label: "Dark", icon: "🌙" }
                          ].map((mode) => (
                            <Button
                              key={mode.value}
                              variant={formConfig.theme?.colorMode === mode.value ? "default" : "outline"}
                              size="sm"
                              className="flex-1 flex flex-col items-center gap-1 h-16"
                              onClick={() => setFormConfig(prev => ({
                                ...prev,
                                theme: { ...prev.theme, colorMode: mode.value }
                              }))}
                            >
                              <span className="text-lg">{mode.icon}</span>
                              <span className="text-xs">{mode.label}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Text & Language */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Type className="h-4 w-4" />
                      <h4 className="font-medium">Text & Language</h4>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Font Family */}
                      <div className="space-y-2">
                        <Label>Font Family</Label>
                        <Select 
                          value={formConfig.theme?.fontFamily || "default"}
                          onValueChange={(value) => setFormConfig(prev => ({
                            ...prev,
                            theme: { ...prev.theme, fontFamily: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">Default</SelectItem>
                            <SelectItem value="inter">Inter</SelectItem>
                            <SelectItem value="roboto">Roboto</SelectItem>
                            <SelectItem value="arial">Arial</SelectItem>
                            <SelectItem value="helvetica">Helvetica</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Language */}
                      <div className="space-y-2">
                        <Label>Language</Label>
                        <Select 
                          value={formConfig.theme?.language || "english"}
                          onValueChange={(value) => setFormConfig(prev => ({
                            ...prev,
                            theme: { ...prev.theme, language: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="english">English</SelectItem>
                            <SelectItem value="spanish">Spanish</SelectItem>
                            <SelectItem value="french">French</SelectItem>
                            <SelectItem value="german">German</SelectItem>
                            <SelectItem value="chinese">Chinese</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Layout Options */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="rtl-layout"
                            checked={formConfig.theme?.rtlLayout || false}
                            onCheckedChange={(checked) => setFormConfig(prev => ({
                              ...prev,
                              theme: { ...prev.theme, rtlLayout: checked }
                            }))}
                          />
                          <Label htmlFor="rtl-layout">Right-to-Left Layout</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="uppercase-labels"
                            checked={formConfig.theme?.uppercaseLabels || false}
                            onCheckedChange={(checked) => setFormConfig(prev => ({
                              ...prev,
                              theme: { ...prev.theme, uppercaseLabels: checked }
                            }))}
                          />
                          <Label htmlFor="uppercase-labels">Uppercase Input Labels</Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Layout & Sizing */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Layers className="h-4 w-4" />
                      <h4 className="font-medium">Layout & Sizing</h4>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Input Size */}
                      <div className="space-y-2">
                        <Label>Input Size</Label>
                        <div className="flex gap-2">
                          {["S", "M", "L"].map((size) => (
                            <Button
                              key={size}
                              variant={formConfig.theme?.inputSize === size ? "default" : "outline"}
                              size="sm"
                              className="flex-1"
                              onClick={() => setFormConfig(prev => ({
                                ...prev,
                                theme: { ...prev.theme, inputSize: size }
                              }))}
                            >
                              {size}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Input Roundness */}
                      <div className="space-y-2">
                        <Label>Input Roundness</Label>
                        <div className="flex gap-2">
                          {[
                            { value: "none", label: "□", title: "Square" },
                            { value: "small", label: "⬜", title: "Small" },
                            { value: "medium", label: "▢", title: "Medium" },
                            { value: "large", label: "◯", title: "Round" }
                          ].map((roundness) => (
                            <Button
                              key={roundness.value}
                              variant={formConfig.theme?.inputRoundness === roundness.value ? "default" : "outline"}
                              size="sm"
                              className="flex-1"
                              title={roundness.title}
                              onClick={() => setFormConfig(prev => ({
                                ...prev,
                                theme: { ...prev.theme, inputRoundness: roundness.value }
                              }))}
                            >
                              {roundness.label}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Form Width */}
                      <div className="space-y-2">
                        <Label>Form Width</Label>
                        <div className="flex gap-2">
                          <Button
                            variant={formConfig.theme?.formWidth === "centered" ? "default" : "outline"}
                            size="sm"
                            className="flex-1"
                            onClick={() => setFormConfig(prev => ({
                              ...prev,
                              theme: { ...prev.theme, formWidth: "centered" }
                            }))}
                          >
                            Centered
                          </Button>
                          <Button
                            variant={formConfig.theme?.formWidth === "full" ? "default" : "outline"}
                            size="sm"
                            className="flex-1"
                            onClick={() => setFormConfig(prev => ({
                              ...prev,
                              theme: { ...prev.theme, formWidth: "full" }
                            }))}
                          >
                            Full Width
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Branding & Media */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Settings className="h-4 w-4" />
                      <h4 className="font-medium">Branding & Media</h4>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Logo */}
                      <div className="space-y-2">
                        <Label>Logo</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                          <div className="text-gray-400 mb-2">📁</div>
                          <Button variant="outline" size="sm">Upload</Button>
                          <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 2MB</p>
                        </div>
                      </div>

                      {/* Cover Image */}
                      <div className="space-y-2">
                        <Label>Cover (~1500px)</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                          <div className="text-gray-400 mb-2">🖼️</div>
                          <Button variant="outline" size="sm">Upload</Button>
                          <p className="text-xs text-gray-500 mt-2">Recommended: 1500px width</p>
                        </div>
                      </div>

                      {/* Hide OpnForm Branding */}
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="hide-branding"
                          checked={formConfig.theme?.hideBranding || false}
                          onCheckedChange={(checked) => setFormConfig(prev => ({
                            ...prev,
                            theme: { ...prev.theme, hideBranding: checked }
                          }))}
                        />
                        <Label htmlFor="hide-branding" className="flex items-center gap-2">
                          Hide FormCraft Branding
                          <Badge variant="secondary" className="text-xs">PRO</Badge>
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Settings className="h-4 w-4" />
                      <h4 className="font-medium">Advanced Options</h4>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="progress-bar"
                          checked={formConfig.theme?.showProgressBar || false}
                          onCheckedChange={(checked) => setFormConfig(prev => ({
                            ...prev,
                            theme: { ...prev.theme, showProgressBar: checked }
                          }))}
                        />
                        <Label htmlFor="progress-bar">Show progress bar</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="transparent-bg"
                          checked={formConfig.theme?.transparentBackground || false}
                          onCheckedChange={(checked) => setFormConfig(prev => ({
                            ...prev,
                            theme: { ...prev.theme, transparentBackground: checked }
                          }))}
                        />
                        <Label htmlFor="transparent-bg">Transparent Background</Label>
                        <p className="text-xs text-gray-500">When form is embedded</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="confetti-success"
                          checked={formConfig.theme?.confettiOnSuccess || false}
                          onCheckedChange={(checked) => setFormConfig(prev => ({
                            ...prev,
                            theme: { ...prev.theme, confettiOnSuccess: checked }
                          }))}
                        />
                        <Label htmlFor="confetti-success">Confetti on successful submission</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="auto-focus"
                          checked={formConfig.theme?.autoFocusFirst || false}
                          onCheckedChange={(checked) => setFormConfig(prev => ({
                            ...prev,
                            theme: { ...prev.theme, autoFocusFirst: checked }
                          }))}
                        />
                        <Label htmlFor="auto-focus">Auto focus first input on page</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DndProvider>
  )
}


"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"

interface FormElement {
  id: string
  type: string
  label: string
  required: boolean
  placeholder?: string
  options?: string[]
}

interface Form {
  id: string
  title: string
  elements: FormElement[]
  isActive: boolean
  submissionType: "redirect" | "message"
  redirectUrl?: string
  successMessageHtml?: string
}

export default function LiveFormPage() {
  const params = useParams()
  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})

  useEffect(() => {
    if (params.id) {
      fetchForm(params.id as string)
    }
  }, [params.id])

  const fetchForm = async (formId: string) => {
    try {
      // Use public API endpoint that doesn't require authentication
      const response = await fetch(`/api/forms/public?id=${formId}`)
      if (response.ok) {
        const data = await response.json()
        const formData = Array.isArray(data) ? data.find(f => f.id === formId) : data
        if (!formData) {
          setError("Form not found")
        } else if (!formData.isActive) {
          setError("This form is currently inactive")
        } else {
          setForm(formData)
        }
      } else {
        setError("Form not found")
      }
    } catch (error) {
      setError("Error loading form")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (elementId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [elementId]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/forms/${form.id}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: formData }),
      })

      if (response.ok) {
        setSubmitted(true)
        if (form.submissionType === "redirect" && form.redirectUrl) {
          window.location.href = form.redirectUrl
        }
      } else {
        setError("Error submitting form")
      }
    } catch (error) {
      setError("Error submitting form")
    } finally {
      setSubmitting(false)
    }
  }

  const renderElement = (element: FormElement) => {
    switch (element.type) {
      case "text":
      case "email":
      case "tel":
      case "url":
        return (
          <Input
            type={element.type}
            placeholder={element.placeholder}
            required={element.required}
            onChange={(e) => handleInputChange(element.id, e.target.value)}
          />
        )
      case "textarea":
        return (
          <Textarea
            placeholder={element.placeholder}
            required={element.required}
            onChange={(e) => handleInputChange(element.id, e.target.value)}
          />
        )
      case "select":
        return (
          <Select 
            required={element.required}
            onValueChange={(value) => handleInputChange(element.id, value)}
          >
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
      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              required={element.required}
              onCheckedChange={(checked) => handleInputChange(element.id, checked)}
            />
            <Label>{element.label}</Label>
          </div>
        )
      case "radio":
        return (
          <RadioGroup onValueChange={(value) => handleInputChange(element.id, value)}>
            {element.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} />
                <Label>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (submitted && form?.submissionType === "message") {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <div dangerouslySetInnerHTML={{ __html: form.successMessageHtml || "" }} />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!form) return null

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">{form.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {form.elements.map((element) => (
              <div key={element.id} className="space-y-2">
                {element.type !== "checkbox" && (
                  <Label>
                    {element.label}
                    {element.required && <span className="text-red-500">*</span>}
                  </Label>
                )}
                {renderElement(element)}
              </div>
            ))}
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

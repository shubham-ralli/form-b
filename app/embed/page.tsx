"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Copy, ExternalLink, Check } from "lucide-react"

interface Form {
  id: string
  title: string
}

export default function EmbedPage() {
  const [forms, setForms] = useState<Form[]>([])
  const [selectedFormId, setSelectedFormId] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const searchParams = useSearchParams()
  const [baseUrl, setBaseUrl] = useState("")

  useEffect(() => {
    fetchForms()
    const formId = searchParams.get("formId")
    if (formId) {
      setSelectedFormId(formId)
    }

    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, [searchParams])

  const fetchForms = async () => {
    try {
      const response = await fetch("/api/forms")
      const data = await response.json()
      // Handle both array response and object with forms property
      const formsData = Array.isArray(data) ? data : (data.forms || [])
      setForms(formsData)
    } catch (error) {
      console.error("Error fetching forms:", error)
      setForms([])
    }
  }

  const generateEmbedCode = (formId: string) => {
    return `<div id="formcraft-${formId}" data-formcraft-id="${formId}"></div>
<script src="${baseUrl}/embed.js"></script>`
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    showAlert(`${type} copied to clipboard!`)
  }

  const showAlert = (message: string) => {
    // Create and show alert
    const alertDiv = document.createElement('div')
    alertDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50'
    alertDiv.textContent = message
    document.body.appendChild(alertDiv)

    // Remove alert after 5 seconds
    setTimeout(() => {
      document.body.removeChild(alertDiv)
    }, 5000)
  }

  const embedCode = selectedFormId ? generateEmbedCode(selectedFormId) : ""

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Embed Your Form</h1>
        <p className="text-gray-600">Copy the embed code below and paste it into any website to display your form.</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Form</CardTitle>
            <CardDescription>Choose which form you want to embed on your website</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedFormId || ""} onValueChange={setSelectedFormId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a form to embed" />
              </SelectTrigger>
              <SelectContent>
                {forms && forms.length > 0 ? forms.map((form) => (
                  <SelectItem key={form.id} value={form.id}>
                    {form.title || "Untitled Form"}
                  </SelectItem>
                )) : (
                  <SelectItem value="" disabled>No forms available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedFormId && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Live Form URL</CardTitle>
                <CardDescription>Direct link to your form hosted on this webapp</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Input 
                    value={`${baseUrl}/live/${selectedFormId}`}
                    readOnly
                    className="pr-20"
                  />
                  <Button
                    size="sm"
                    className="absolute top-1/2 right-1 transform -translate-y-1/2"
                    onClick={() => copyToClipboard(`${baseUrl}/live/${selectedFormId}`, "Live URL")}
                  >
                    {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                  </Button>
                </div>
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => window.open(`/live/${selectedFormId}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Preview Live Form
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Embed Code</CardTitle>
                <CardDescription>Copy and paste this code into your website's HTML to embed the form</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Textarea value={embedCode} readOnly className="font-mono text-sm min-h-32 pr-20" />
                  <Button
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(embedCode, "Embed Code")}
                  >
                    {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <Card>
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-blue-600">1</span>
              </div>
              <div>
                <h4 className="font-semibold">Copy the embed code</h4>
                <p className="text-gray-600 text-sm">Select your form and copy the generated embed code above.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-green-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-green-600">2</span>
              </div>
              <div>
                <h4 className="font-semibold">Paste into your website</h4>
                <p className="text-gray-600 text-sm">
                  Add the code to any HTML page where you want the form to appear.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-purple-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-purple-600">3</span>
              </div>
              <div>
                <h4 className="font-semibold">Start collecting data</h4>
                <p className="text-gray-600 text-sm">Form submissions will automatically appear in your dashboard.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
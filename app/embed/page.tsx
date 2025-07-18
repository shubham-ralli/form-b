"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Check } from "lucide-react"

interface Form {
  id: string
  title: string
}

export default function EmbedPage() {
  const [forms, setForms] = useState<Form[]>([])
  const [selectedFormId, setSelectedFormId] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    fetchForms()
    const formId = searchParams.get("formId")
    if (formId) {
      setSelectedFormId(formId)
    }
  }, [searchParams])

  const fetchForms = async () => {
    try {
      const response = await fetch("/api/forms")
      const data = await response.json()
      setForms(data)
    } catch (error) {
      console.error("Error fetching forms:", error)
    }
  }

  const generateEmbedCode = (formId: string) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    return `<!-- FormCraft Embed Script -->
<div id="formcraft-${formId}" data-formcraft-id="${formId}"></div>
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${baseUrl}/embed.js';
    script.onload = function() {
      if (window.FormCraft) {
        FormCraft.render('${formId}', 'formcraft-${formId}');
      }
    };
    script.onerror = function() {
      document.getElementById('formcraft-${formId}').innerHTML = 
        '<div style="color: red; padding: 20px;">Error loading FormCraft script</div>';
    };
    document.head.appendChild(script);
  })();
</script>

<!-- Alternative: Simple data attribute method -->
<!-- <div id="formcraft-${formId}" data-formcraft-id="${formId}"></div>
<script src="${baseUrl}/embed.js"></script> -->`
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
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
            <Select value={selectedFormId} onValueChange={setSelectedFormId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a form to embed" />
              </SelectTrigger>
              <SelectContent>
                {forms.map((form) => (
                  <SelectItem key={form.id} value={form.id}>
                    {form.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedFormId && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Embed Code</CardTitle>
                  <CardDescription>Copy this code and paste it into your website's HTML</CardDescription>
                </div>
                <Button onClick={() => copyToClipboard(embedCode)} size="sm" variant="outline">
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Code
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea value={embedCode} readOnly className="font-mono text-sm min-h-32" />
            </CardContent>
          </Card>
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
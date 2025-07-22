"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Form {
  id: string
  title: string
}

export default function TestPage() {
  const [forms, setForms] = useState<Form[]>([])
  const [selectedFormId, setSelectedFormId] = useState<string>("")

  useEffect(() => {
    fetchForms()
  }, [])

  const fetchForms = async () => {
    try {
      const response = await fetch("/api/forms")
      const data = await response.json()
      // Handle both array response and object with forms property
      const formsData = Array.isArray(data) ? data : (data.forms || [])
      setForms(formsData)
      if (formsData.length > 0) {
        setSelectedFormId(formsData[0]._id || formsData[0].id)
      }
    } catch (error) {
      console.error("Error fetching forms:", error)
      setForms([])
    }
  }

  const generateTestHTML = (formId: string) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FormCraft Test Page</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>My Website</h1>
        <p>This is a test page to demonstrate FormCraft embed functionality.</p>
    </div>

    <!-- FormCraft Embed Code -->
    <div id="formcraft-${formId}" data-formcraft-id="${formId}" data-api-url="${baseUrl}"></div>

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
                    '<div style="color: red; padding: 20px;">Error loading FormCraft script from ${baseUrl}/embed.js</div>';
            };
            document.head.appendChild(script);
        })();
    </script>
</body>
</html>`
  }

  const downloadTestFile = (formId: string) => {
    const html = generateTestHTML(formId)
    const blob = new Blob([html], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `formcraft-test-${formId}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const openInNewTab = (formId: string) => {
    const html = generateTestHTML(formId)
    const blob = new Blob([html], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    window.open(url, "_blank")
  }

  useEffect(() => {
    // Auto-load the form when component mounts
    if (selectedFormId && typeof window !== "undefined") {
      const script = document.createElement("script")
      script.src = "/embed.js"
      script.onload = () => {
        if (window.FormCraft) {
          window.FormCraft.render(selectedFormId, `formcraft-test-${selectedFormId}`)
        }
      }
      document.head.appendChild(script)

      return () => {
        // Cleanup
        document.head.removeChild(script)
      }
    }
  }, [selectedFormId])

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Form Embed</h1>
        <p className="text-gray-600">Test your forms in a simulated external website environment.</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Form to Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select value={selectedFormId || ""} onValueChange={setSelectedFormId}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select a form to test" />
                </SelectTrigger>
                <SelectContent>
                  {forms && forms.length > 0 ? forms.map((form) => (
                    <SelectItem key={form._id || form.id} value={form._id || form.id}>
                      {form.title || "Untitled Form"}
                    </SelectItem>
                  )) : (
                    <SelectItem value="no-forms-available" disabled>No forms available</SelectItem>
                  )}
                </SelectContent>
              </Select>

              {selectedFormId && (
                <div className="flex gap-4">
                  <Button onClick={() => openInNewTab(selectedFormId)}>Open Test Page in New Tab</Button>
                  <Button variant="outline" onClick={() => downloadTestFile(selectedFormId)}>
                    Download Test HTML File
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {selectedFormId && (
          <Card>
            <CardHeader>
              <CardTitle>Live Embed Test</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 p-6 rounded-lg">
                <div className="bg-white p-4 rounded border mb-4">
                  <h3 className="text-lg font-semibold mb-2">Simulated External Website</h3>
                  <p className="text-gray-600 mb-4">This shows how your form will appear on other websites:</p>
                </div>
                <div
                  id={`formcraft-test-${selectedFormId}`}
                  data-formcraft-id={selectedFormId}
                  data-api-url={typeof window !== "undefined" ? window.location.origin : ""}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-green-600">✅ Recommended: Use "Open Test Page in New Tab"</h4>
            <p className="text-sm text-gray-600">
              This creates a proper test environment that simulates how your form will work on external websites.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-blue-600">📁 Alternative: Download Test HTML File</h4>
            <p className="text-sm text-gray-600">
              Download the HTML file and serve it through a local web server (like Live Server in VS Code) instead of
              opening it directly in the browser.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-red-600">❌ Don't: Open HTML file directly</h4>
            <p className="text-sm text-gray-600">
              Opening HTML files directly in the browser (file:// protocol) will cause CORS errors.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from "next/link"
import { ExternalLink } from "lucide-react"

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
        <p className="text-gray-600 mt-2">Find answers to common questions and get assistance.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Browse our FAQs for quick answers.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How do I create a new form?</AccordionTrigger>
              <AccordionContent>
                Navigate to the "Create Form" section from the sidebar. Drag and drop elements from the left panel onto
                the canvas to build your form. You can customize each element's settings by clicking the gear icon.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How can I embed a form on my website?</AccordionTrigger>
              <AccordionContent>
                After creating and saving your form, go to "My Forms", click "View Details" on your form, then navigate
                to the "Embed Code" tab. Copy the provided HTML snippet and paste it into your website's HTML where you
                want the form to appear.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Where can I see my form submissions?</AccordionTrigger>
              <AccordionContent>
                You can view all submissions for a specific form by going to "My Forms", clicking "View Details" on the
                form, and then selecting the "Submissions" tab. For an overview of all submissions across all forms,
                visit the "Submissions" page from the sidebar.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Can I download my submission data?</AccordionTrigger>
              <AccordionContent>
                Yes! On the individual form details page (under the "Submissions" tab) or on the "All Submissions" page,
                you'll find a "Download CSV" button. Click it to export your data.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>How do I activate or deactivate a form?</AccordionTrigger>
              <AccordionContent>
                On the "My Forms" page, click the three dots menu next to your form. You will see an option to
                "Activate" or "Deactivate" the form. You can also toggle this from the form builder page.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Support</CardTitle>
          <CardDescription>If you can't find what you're looking for, feel free to reach out.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            For technical issues or further assistance, please contact our support team.
          </p>
          <Link href="mailto:support@formcraft.com" className="inline-flex items-center text-blue-600 hover:underline">
            Email Support <ExternalLink className="ml-1 h-4 w-4" />
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

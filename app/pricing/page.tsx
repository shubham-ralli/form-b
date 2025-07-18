"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"
import { useRouter } from "next/navigation"

interface Plan {
  id: string
  name: string
  price: number
  billing: string
  features: {
    maxForms: number
    maxSubmissions: number
    responseRate: boolean
    analytics: boolean
    customization: boolean
  }
}

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [currentPlan, setCurrentPlan] = useState<string>("free")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchPlans()
    fetchCurrentPlan()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/plans")
      if (response.ok) {
        const data = await response.json()
        setPlans(data.plans)
      }
    } catch (error) {
      console.error("Error fetching plans:", error)
    }
  }

  const fetchCurrentPlan = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setCurrentPlan(data.plan || "free")
      }
    } catch (error) {
      console.error("Error fetching current plan:", error)
    }
  }

  const upgradePlan = async (planId: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId })
      })

      if (response.ok) {
        setCurrentPlan(planId)
        alert("Plan updated successfully!")
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to update plan")
      }
    } catch (error) {
      alert("Error updating plan")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start with our free plan or upgrade to Pro for unlimited forms and advanced features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.id.includes("pro") ? "border-blue-500 shadow-lg" : ""}`}>
              {plan.id === "pro-yearly" && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500">
                  Save 20%
                </Badge>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-gray-600">/{plan.billing}</span>
                </div>
                {plan.id === "pro-yearly" && (
                  <p className="text-sm text-green-600">Equivalent to $4/month</p>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>
                      {plan.features.maxForms === -1 ? "Unlimited" : plan.features.maxForms} Forms
                    </span>
                  </div>

                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>{plan.features.maxSubmissions.toLocaleString()} Submissions/month</span>
                  </div>

                  <div className="flex items-center">
                    {plan.features.responseRate ? (
                      <Check className="h-5 w-5 text-green-500 mr-3" />
                    ) : (
                      <X className="h-5 w-5 text-gray-400 mr-3" />
                    )}
                    <span>Response Rate Analytics</span>
                  </div>

                  <div className="flex items-center">
                    {plan.features.analytics ? (
                      <Check className="h-5 w-5 text-green-500 mr-3" />
                    ) : (
                      <X className="h-5 w-5 text-gray-400 mr-3" />
                    )}
                    <span>Advanced Analytics</span>
                  </div>

                  <div className="flex items-center">
                    {plan.features.customization ? (
                      <Check className="h-5 w-5 text-green-500 mr-3" />
                    ) : (
                      <X className="h-5 w-5 text-gray-400 mr-3" />
                    )}
                    <span>Custom Styling</span>
                  </div>
                </div>

                <div className="pt-4">
                  {currentPlan === plan.id ? (
                    <Button className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      variant={plan.id === "free" ? "outline" : "default"}
                      onClick={() => upgradePlan(plan.id)}
                      disabled={loading}
                    >
                      {plan.id === "free" ? "Downgrade to Free" : "Upgrade to Pro"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600">
            Need a custom solution? <a href="/help" className="text-blue-600 hover:underline">Contact us</a>
          </p>
        </div>
      </div>
    </div>
  )
}
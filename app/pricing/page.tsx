
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  plan: "free" | "monthly" | "yearly"
  formsUsed: number
  submissionsThisMonth: number
  subscriptionExpiry?: string
}

export default function PricingPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      }
    } catch (error) {
      console.error("Error fetching user:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (plan: "monthly" | "yearly") => {
    if (!user) {
      router.push("/login")
      return
    }

    try {
      const response = await fetch("/api/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan })
      })

      if (response.ok) {
        alert(`Successfully upgraded to ${plan} plan!`)
        fetchUser()
      } else {
        alert("Failed to upgrade plan")
      }
    } catch (error) {
      console.error("Error upgrading:", error)
      alert("Error upgrading plan")
    }
  }

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "Up to 3 forms",
        "10 submissions per month",
        "Basic form fields",
        "Email notifications",
        "Basic analytics"
      ],
      limitations: [
        "Limited customization",
        "FormCraft branding"
      ],
      buttonText: "Get Started Free",
      planType: "free" as const,
      popular: false
    },
    {
      name: "Pro Monthly",
      price: "$5",
      period: "month", 
      description: "For growing businesses",
      features: [
        "Unlimited forms",
        "25,000 submissions per month",
        "All form field types",
        "Custom branding",
        "Advanced analytics",
        "Export to CSV",
        "Priority support",
        "Custom thank you pages"
      ],
      limitations: [],
      buttonText: "Start Monthly Plan",
      planType: "monthly" as const,
      popular: true
    },
    {
      name: "Pro Yearly",
      price: "$4",
      period: "month",
      yearlyPrice: "$48",
      description: "Best value for serious users",
      features: [
        "Unlimited forms",
        "25,000 submissions per month", 
        "All form field types",
        "Custom branding",
        "Advanced analytics",
        "Export to CSV",
        "Priority support",
        "Custom thank you pages",
        "2 months free!"
      ],
      limitations: [],
      buttonText: "Start Yearly Plan",
      planType: "yearly" as const,
      popular: false
    }
  ]

  const getCurrentPlanLimits = () => {
    if (!user) return { formsLimit: 3, submissionsLimit: 10 }
    
    switch (user.plan) {
      case "free":
        return { formsLimit: 3, submissionsLimit: 10 }
      case "monthly":
      case "yearly":
        return { formsLimit: -1, submissionsLimit: 25000 } // -1 means unlimited
      default:
        return { formsLimit: 3, submissionsLimit: 10 }
    }
  }

  const limits = getCurrentPlanLimits()

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Choose Your Plan</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Start free and upgrade as you grow. No hidden fees, cancel anytime.
        </p>
        
        {user && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <h3 className="font-semibold text-blue-900">Current Usage</h3>
            <p className="text-blue-700">
              Forms: {user.formsUsed}/{limits.formsLimit === -1 ? "Unlimited" : limits.formsLimit}
            </p>
            <p className="text-blue-700">
              Submissions this month: {user.submissionsThisMonth}/{limits.submissionsLimit === -1 ? "Unlimited" : limits.submissionsLimit}
            </p>
            <p className="text-sm text-blue-600 mt-2">
              Current plan: <span className="font-semibold capitalize">{user.plan}</span>
            </p>
          </div>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <Card key={plan.name} className={`relative ${plan.popular ? 'border-blue-500 shadow-lg' : ''}`}>
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                Most Popular
              </Badge>
            )}
            
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-gray-600">/{plan.period}</span>
              </div>
              {plan.yearlyPrice && (
                <p className="text-sm text-gray-500">
                  Billed yearly: {plan.yearlyPrice}
                </p>
              )}
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-green-600">What's included:</h4>
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              {plan.limitations.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-red-600">Limitations:</h4>
                  {plan.limitations.map((limitation, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <X className="h-4 w-4 text-red-500" />
                      <span className="text-sm">{limitation}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <Button 
                className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                variant={plan.popular ? 'default' : 'outline'}
                onClick={() => {
                  if (plan.planType === "free") {
                    router.push("/register")
                  } else {
                    handleUpgrade(plan.planType)
                  }
                }}
                disabled={user?.plan === plan.planType}
              >
                {user?.plan === plan.planType ? "Current Plan" : plan.buttonText}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-center">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
            <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">What happens if I exceed my submission limit?</h3>
            <p className="text-gray-600">Your forms will continue to work, but you'll be prompted to upgrade to handle additional submissions.</p>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">What's the difference between monthly and yearly plans?</h3>
            <p className="text-gray-600">Yearly plans offer the same features but at a discounted rate - you save $12 per year!</p>
          </div>
        </div>
      </div>
    </div>
  )
}

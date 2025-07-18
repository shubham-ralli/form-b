"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { User, Key, Bell, Shield, CreditCard, Crown, Zap } from "lucide-react"

interface User {
  id: string
  username: string
  email: string
  createdAt: string
  plan?: string
}

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

export default function Settings() {
  const [user, setUser] = useState<User | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
    fetchPlans()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      }
    } catch (error) {
      console.error("Error fetching user:", error)
    } finally {
      setLoading(false)
    }
  }

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

  const handleUpgrade = async (planId: string) => {
    try {
      const response = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: planId }),
      })

      if (response.ok) {
        await fetchUser()
        alert("Plan updated successfully!")
      } else {
        throw new Error("Failed to update plan")
      }
    } catch (error) {
      alert("Error updating plan")
      console.error(error)
    }
  }

  const getCurrentPlan = () => {
    return user?.plan || "free"
  }

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case "free":
        return <User className="h-4 w-4" />
      case "monthly":
        return <Zap className="h-4 w-4" />
      case "yearly":
        return <Crown className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getPlanBadgeVariant = (planName: string) => {
    switch (planName) {
      case "free":
        return "secondary"
      case "monthly":
        return "default"
      case "yearly":
        return "default"
      default:
        return "secondary"
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={user?.username || ""} disabled />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email || ""} disabled />
              </div>
            </div>
            <div>
              <Label>Member Since</Label>
              <p className="text-sm text-gray-600">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
              </p>
            </div>
            <div>
              <Label>Current Plan</Label>
              <div className="flex items-center gap-2 mt-1">
                {getPlanIcon(getCurrentPlan())}
                <Badge variant={getPlanBadgeVariant(getCurrentPlan())}>
                  {getCurrentPlan().charAt(0).toUpperCase() + getCurrentPlan().slice(1)} Plan
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscription & Billing
            </CardTitle>
            <CardDescription>Manage your subscription and upgrade your plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`border rounded-lg p-4 ${
                    getCurrentPlan() === plan.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {getPlanIcon(plan.name)}
                        <h3 className="font-semibold capitalize">{plan.name}</h3>
                        {getCurrentPlan() === plan.id && (
                          <Badge variant="default">Current</Badge>
                        )}
                      </div>
                      <p className="text-2xl font-bold mt-1">
                        ${plan.price}
                        <span className="text-sm font-normal text-gray-600">
                          /{plan.billing}
                        </span>
                      </p>
                      <ul className="text-sm text-gray-600 mt-2 space-y-1">
                        <li>• {plan.features.maxForms === -1 ? "Unlimited" : plan.features.maxForms} Forms</li>
                        <li>• {plan.features.maxSubmissions.toLocaleString()} Submissions/month</li>
                        {plan.features.responseRate && <li>• Response Rate Analytics</li>}
                        {plan.features.analytics && <li>• Advanced Analytics</li>}
                        {plan.features.customization && <li>• Custom Styling</li>}
                      </ul>
                    </div>
                    <div>
                      {getCurrentPlan() !== plan.id && (
                        <Button
                          onClick={() => handleUpgrade(plan.id)}
                          variant={plan.id.includes("yearly") ? "default" : "outline"}
                        >
                          {getCurrentPlan() === "free" ? "Upgrade" : "Switch"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline">Change Password</Button>
            <Separator />
            <Button variant="outline">Enable Two-Factor Authentication</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Configure your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive email updates about your forms</p>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Form Submission Alerts</p>
                <p className="text-sm text-gray-600">Get notified when someone submits a form</p>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Data
            </CardTitle>
            <CardDescription>Control your data and privacy settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline">Download My Data</Button>
            <Separator />
            <Button variant="destructive">Delete Account</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
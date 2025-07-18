"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function SettingsPage() {
  const [userName, setUserName] = useState("John Doe")
  const [userEmail, setUserEmail] = useState("john.doe@example.com")
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault()
    alert("Profile settings saved!")
    // Implement actual save logic here
  }

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmNewPassword) {
      alert("New passwords do not match!")
      return
    }
    alert("Password changed successfully!")
    // Implement actual password change logic here
    setOldPassword("")
    setNewPassword("")
    setConfirmNewPassword("")
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account and application settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={userName} onChange={(e) => setUserName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                disabled
              />
            </div>
            <Button type="submit">Save Profile</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <Label htmlFor="old-password">Current Password</Label>
              <Input
                id="old-password"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="confirm-new-password">Confirm New Password</Label>
              <Input
                id="confirm-new-password"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
            </div>
            <Button type="submit">Change Password</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>Manage your API keys for integrations.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">API key management coming soon!</p>
        </CardContent>
      </Card>
    </div>
  )
}

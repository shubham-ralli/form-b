
"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { storage } from '@/lib/storage'

interface Form {
  _id: string
  title: string
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  submissionCount: number
  elements?: any[]
}

interface FormsContextType {
  forms: Form[]
  loading: boolean
  error: string | null
  refreshForms: () => Promise<void>
  updateForm: (formId: string, updates: Partial<Form>) => void
  deleteForm: (formId: string) => void
  addForm: (form: Form) => void
}

const FormsContext = createContext<FormsContextType | undefined>(undefined)

export function FormsProvider({ children }: { children: React.ReactNode }) {
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const lastFetchRef = useRef<number>(0)
  const isInitializedRef = useRef(false)
  
  // Clear any stale cached data on initialization
  useEffect(() => {
    // Clear old cache to ensure fresh data
    storage.clearForms()
    isInitializedRef.current = false
  }, [])

  const fetchForms = useCallback(async (force = false) => {
    // Prevent multiple simultaneous requests
    if (loading && !force) return

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch("/api/forms", {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log("Raw API response:", data) // Debug log
        
        let formsData = []
        if (Array.isArray(data)) {
          formsData = data
        } else if (data.forms && Array.isArray(data.forms)) {
          formsData = data.forms
        } else {
          console.warn("Unexpected API response format:", data)
          formsData = []
        }
        
        console.log("Processed forms data:", formsData) // Debug log
        
        // Ensure all forms have required fields and normalize the data
        const normalizedForms = formsData.map(form => ({
          _id: form._id || form.id,
          title: form.title || `Form - ${new Date().toLocaleDateString()}`,
          description: form.description || "",
          isActive: form.isActive !== false,
          createdAt: form.createdAt || new Date().toISOString(),
          updatedAt: form.updatedAt || new Date().toISOString(),
          submissionCount: form.submissionCount || 0,
          elements: form.elements || []
        }))
        
        // Sort forms by most recent first
        const sortedForms = normalizedForms.sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        
        console.log("Final sorted forms:", sortedForms) // Debug log
        
        setForms(sortedForms)
        storage.setForms(sortedForms)
        lastFetchRef.current = Date.now()
        isInitializedRef.current = true
      } else {
        const errorText = await response.text()
        console.error("API response error:", response.status, errorText)
        setError(`Failed to fetch forms: ${response.status}`)
      }
    } catch (error) {
      console.error("Error fetching forms:", error)
      setError("Error fetching forms")
      setForms([]) // Clear forms on error
    } finally {
      setLoading(false)
    }
  }, [loading])

  const refreshForms = useCallback(async () => {
    await fetchForms(true)
  }, [fetchForms])

  const updateForm = useCallback((formId: string, updates: Partial<Form>) => {
    setForms(prev => {
      const updated = prev.map(form => 
        form._id === formId ? { ...form, ...updates } : form
      )
      storage.setForms(updated) // Update cache
      return updated
    })
  }, [])

  const deleteForm = useCallback((formId: string) => {
    setForms(prev => {
      const filtered = prev.filter(form => form._id !== formId)
      storage.setForms(filtered) // Update cache
      return filtered
    })
  }, [])

  const addForm = useCallback((form: Form) => {
    setForms(prev => {
      const updated = [form, ...prev]
      storage.setForms(updated) // Update cache
      return updated
    })
  }, [])

  // Initial load - only run once
  useEffect(() => {
    if (!isInitializedRef.current) {
      fetchForms()
    }
  }, []) // Empty dependency array to run only once

  const value: FormsContextType = {
    forms,
    loading,
    error,
    refreshForms,
    updateForm,
    deleteForm,
    addForm
  }

  return (
    <FormsContext.Provider value={value}>
      {children}
    </FormsContext.Provider>
  )
}

export function useForms() {
  const context = useContext(FormsContext)
  if (context === undefined) {
    throw new Error('useForms must be used within a FormsProvider')
  }
  return context
}

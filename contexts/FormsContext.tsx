
"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
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
  const [lastFetch, setLastFetch] = useState<number>(0)
  
  // Initialize with cached data
  useEffect(() => {
    const cachedForms = storage.getForms()
    if (cachedForms) {
      setForms(cachedForms)
      setLoading(false)
    }
  }, [])

  const fetchForms = useCallback(async (force = false) => {
    // Check cache first
    const cachedForms = storage.getForms()
    if (!force && cachedForms) {
      setForms(cachedForms)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch("/api/forms")
      if (response.ok) {
        const data = await response.json()
        const formsData = Array.isArray(data) ? data : (data.forms || [])
        setForms(formsData)
        storage.setForms(formsData) // Cache the data
        setLastFetch(Date.now())
      } else {
        setError("Failed to fetch forms")
      }
    } catch (error) {
      console.error("Error fetching forms:", error)
      setError("Error fetching forms")
    } finally {
      setLoading(false)
    }
  }, [])

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

  // Initial load
  useEffect(() => {
    fetchForms()
  }, [fetchForms])

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

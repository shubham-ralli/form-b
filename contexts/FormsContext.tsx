
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
  
  // Initialize with cached data
  useEffect(() => {
    const cachedForms = storage.getForms()
    if (cachedForms) {
      setForms(cachedForms)
      setLoading(false)
      isInitializedRef.current = true
    }
  }, [])

  const fetchForms = useCallback(async (force = false) => {
    // Prevent multiple simultaneous requests
    if (loading && !force) return
    
    // Check cache first and if it's fresh (less than 5 minutes old)
    const cachedForms = storage.getForms()
    const cacheAge = Date.now() - lastFetchRef.current
    const isCacheFresh = cacheAge < 5 * 60 * 1000 // 5 minutes
    
    if (!force && cachedForms && cachedForms.length > 0 && isCacheFresh && isInitializedRef.current) {
      setForms(cachedForms)
      setLoading(false)
      return
    }

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
        const formsData = Array.isArray(data) ? data : (data.forms || [])
        
        // Sort forms by most recent first
        const sortedForms = formsData.sort((a, b) => 
          new Date(b.createdAt || b.updatedAt).getTime() - new Date(a.createdAt || a.updatedAt).getTime()
        )
        
        setForms(sortedForms)
        storage.setForms(sortedForms)
        lastFetchRef.current = Date.now()
        isInitializedRef.current = true
      } else {
        setError("Failed to fetch forms")
      }
    } catch (error) {
      console.error("Error fetching forms:", error)
      setError("Error fetching forms")
      // Fallback to cached data if available
      if (cachedForms && cachedForms.length > 0) {
        setForms(cachedForms)
        setError(null)
      }
    } finally {
      setLoading(false)
    }
  }, [loading]) // Only depend on loading to prevent infinite loops

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

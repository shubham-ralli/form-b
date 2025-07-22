
"use client"

import { useState } from 'react'
import { toast } from 'sonner'

type OptimisticUpdateOptions<T> = {
  onSuccess?: (data: T) => void
  onError?: (error: any) => void
  successMessage?: string
  errorMessage?: string
}

export function useOptimisticUpdate<T = any>() {
  const [loading, setLoading] = useState(false)

  const execute = async (
    apiCall: () => Promise<Response>,
    optimisticUpdate: () => void,
    revertUpdate: () => void,
    options: OptimisticUpdateOptions<T> = {}
  ) => {
    const {
      onSuccess,
      onError,
      successMessage,
      errorMessage = "Operation failed"
    } = options

    setLoading(true)
    
    // Apply optimistic update immediately
    optimisticUpdate()

    try {
      const response = await apiCall()
      
      if (response.ok) {
        const data = await response.json()
        if (successMessage) {
          toast.success(successMessage)
        }
        onSuccess?.(data)
      } else {
        // Revert optimistic update on failure
        revertUpdate()
        toast.error(errorMessage)
        onError?.(new Error(errorMessage))
      }
    } catch (error) {
      // Revert optimistic update on error
      revertUpdate()
      toast.error(errorMessage)
      onError?.(error)
    } finally {
      setLoading(false)
    }
  }

  return { execute, loading }
}

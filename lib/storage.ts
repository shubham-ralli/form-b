const STORAGE_KEYS = {
  FORMS: 'formcraft_forms',
  FORMS_TIMESTAMP: 'formcraft_forms_timestamp',
  USER_PREFERENCES: 'formcraft_user_preferences'
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const storage = {
  // Forms caching
  getForms: () => {
    if (typeof window === 'undefined') return null

    try {
      const timestamp = localStorage.getItem(STORAGE_KEYS.FORMS_TIMESTAMP)
      const now = Date.now()

      // Check if cache is still valid
      if (timestamp && (now - parseInt(timestamp)) < CACHE_DURATION) {
        const forms = localStorage.getItem(STORAGE_KEYS.FORMS)
        return forms ? JSON.parse(forms) : null
      }

      // Cache expired, clear it
      storage.clearForms()
      return null
    } catch (error) {
      console.error('Error reading forms from cache:', error)
      return null
    }
  },

  setForms: (forms: any[]) => {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(STORAGE_KEYS.FORMS, JSON.stringify(forms))
      localStorage.setItem(STORAGE_KEYS.FORMS_TIMESTAMP, Date.now().toString())
    } catch (error) {
      console.error('Error saving forms to cache:', error)
    }
  },

  clearForms: () => {
    if (typeof window === 'undefined') return

    localStorage.removeItem(STORAGE_KEYS.FORMS)
    localStorage.removeItem(STORAGE_KEYS.FORMS_TIMESTAMP)
  },

  // User preferences
  getUserPreferences: () => {
    if (typeof window === 'undefined') return {}

    try {
      const prefs = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES)
      return prefs ? JSON.parse(prefs) : {}
    } catch (error) {
      console.error('Error reading user preferences:', error)
      return {}
    }
  },

  setUserPreferences: (preferences: any) => {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences))
    } catch (error) {
      console.error('Error saving user preferences:', error)
    }
  },

  // Clear all app data
  clearAll: () => {
    if (typeof window === 'undefined') return

    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
  }
}
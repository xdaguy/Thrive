'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/db/schema'
import { DataEvents, DATA_EVENTS } from '@/lib/events'
import { logger } from '@/lib/logger'

interface UseSettingsReturn {
  currency: string
  dateFormat: string
  weightUnit: 'kg' | 'lbs'
  name?: string
  loading: boolean
  error: Error | null
}

const DEFAULT_CURRENCY = 'USD'
const DEFAULT_DATE_FORMAT = 'MM/DD/YYYY'
const DEFAULT_WEIGHT_UNIT = 'kg' as const

/**
 * Custom hook to load and manage user settings
 * Automatically listens to SETTINGS_CHANGED events
 * Eliminates duplicate settings loading logic across components
 */
export function useSettings(): UseSettingsReturn {
  const [currency, setCurrency] = useState<string>(DEFAULT_CURRENCY)
  const [dateFormat, setDateFormat] = useState<string>(DEFAULT_DATE_FORMAT)
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>(DEFAULT_WEIGHT_UNIT)
  const [name, setName] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      const settings = await db.settings.get('user_settings')
      
      if (settings) {
        if (settings.currency) setCurrency(settings.currency)
        if (settings.dateFormat) setDateFormat(settings.dateFormat)
        if (settings.weightUnit) setWeightUnit(settings.weightUnit)
        if (settings.name) setName(settings.name)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load settings')
      logger.error('Failed to load settings', { error: error.message }, error)
      setError(error)
      // Use defaults on error
      setCurrency(DEFAULT_CURRENCY)
      setDateFormat(DEFAULT_DATE_FORMAT)
      setWeightUnit(DEFAULT_WEIGHT_UNIT)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()

    // Listen for settings changes
    DataEvents.on(DATA_EVENTS.SETTINGS_CHANGED, loadSettings)

    return () => {
      DataEvents.off(DATA_EVENTS.SETTINGS_CHANGED, loadSettings)
    }
  }, [])

  return {
    currency,
    dateFormat,
    weightUnit,
    name,
    loading,
    error
  }
}


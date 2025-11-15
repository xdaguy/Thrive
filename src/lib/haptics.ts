// Haptic feedback utility for mobile devices

export const haptics = {
  /**
   * Light tap feedback (selection, toggle)
   */
  light: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10)
    }
  },

  /**
   * Medium tap feedback (button press)
   */
  medium: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(20)
    }
  },

  /**
   * Heavy feedback (important action, error)
   */
  heavy: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(50)
    }
  },

  /**
   * Success pattern (task completed, saved)
   */
  success: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([10, 50, 10])
    }
  },

  /**
   * Error pattern (failed action)
   */
  error: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([50, 100, 50, 100, 50])
    }
  },

  /**
   * Selection feedback (for nav items, tabs)
   */
  selection: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(15)
    }
  },

  /**
   * Impact feedback (swipe, drag)
   */
  impact: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(30)
    }
  },
}

// Check if haptics are supported
export const isHapticsSupported = () => {
  return typeof window !== 'undefined' && 'vibrate' in navigator
}

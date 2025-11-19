/**
 * Accessibility utilities for Thrive
 * Provides helpers for ARIA labels, focus management, and screen reader announcements
 */

/**
 * Generate accessible ARIA label for action buttons
 */
export function getActionLabel(action: string, item?: string): string {
  if (item) {
    return `${action} ${item}`.trim()
  }
  return action
}

/**
 * Generate accessible description for form fields
 */
export function getFieldDescription(field: string, required?: boolean): string {
  const base = `${field} field`
  return required ? `${base}, required` : base
}

/**
 * Screen reader announcement utility
 */
export class ScreenReader {
  private static announcementId = 'sr-announcement'
  private static container: HTMLElement | null = null

  /**
   * Initialize the screen reader announcement container
   */
  static init() {
    if (typeof window === 'undefined') return

    if (!this.container) {
      this.container = document.createElement('div')
      this.container.id = this.announcementId
      this.container.setAttribute('role', 'status')
      this.container.setAttribute('aria-live', 'polite')
      this.container.setAttribute('aria-atomic', 'true')
      this.container.className = 'sr-only'
      this.container.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      `
      document.body.appendChild(this.container)
    }
  }

  /**
   * Announce a message to screen readers
   */
  static announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    if (typeof window === 'undefined') return

    this.init()

    if (this.container) {
      this.container.setAttribute('aria-live', priority)
      this.container.textContent = message

      // Clear after announcement
      setTimeout(() => {
        if (this.container) {
          this.container.textContent = ''
        }
      }, 1000)
    }
  }

  /**
   * Announce an error to screen readers
   */
  static announceError(message: string) {
    this.announce(message, 'assertive')
  }

  /**
   * Announce a success message to screen readers
   */
  static announceSuccess(message: string) {
    this.announce(`Success: ${message}`, 'polite')
  }
}

/**
 * Focus trap utility for modals
 */
export function trapFocus(element: HTMLElement, autoFocus = false) {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  function handleTabKey(e: KeyboardEvent) {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }
  }

  element.addEventListener('keydown', handleTabKey)

  // Only auto-focus first element if explicitly requested and no element is already focused
  // This prevents stealing focus from input fields when user is typing
  if (autoFocus && !element.contains(document.activeElement)) {
    // Find first input/textarea/select, otherwise use first focusable element
    const firstInput = element.querySelector<HTMLElement>('input, textarea, select')
    if (firstInput) {
      firstInput.focus()
    } else if (firstElement) {
      firstElement.focus()
    }
  }

  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleTabKey)
  }
}

/**
 * Restore focus to previously focused element
 */
export function restoreFocus(previousElement: HTMLElement | null) {
  if (previousElement && typeof previousElement.focus === 'function') {
    previousElement.focus()
  }
}

/**
 * Get keyboard shortcut description
 */
export function getKeyboardShortcut(key: string, description: string): string {
  return `${description} (Press ${key})`
}

/**
 * Common ARIA labels
 */
export const A11Y_LABELS = {
  // Actions
  ADD: 'Add new item',
  EDIT: 'Edit item',
  DELETE: 'Delete item',
  SAVE: 'Save changes',
  CANCEL: 'Cancel',
  CLOSE: 'Close',
  SUBMIT: 'Submit form',
  SEARCH: 'Search',
  FILTER: 'Filter results',
  SORT: 'Sort',
  RESET: 'Reset filters',
  
  // Navigation
  NAVIGATE_HOME: 'Navigate to home',
  NAVIGATE_FINANCE: 'Navigate to finance',
  NAVIGATE_HEALTH: 'Navigate to health',
  NAVIGATE_TASKS: 'Navigate to tasks',
  NAVIGATE_ROUTINES: 'Navigate to routines',
  NAVIGATE_SETTINGS: 'Navigate to settings',
  
  // Status
  LOADING: 'Loading',
  SUCCESS: 'Success',
  ERROR: 'Error',
  EMPTY: 'No items found',
  
  // Forms
  REQUIRED_FIELD: 'Required field',
  OPTIONAL_FIELD: 'Optional field',
  
  // Charts
  CHART: 'Chart showing data visualization',
  CHART_DATA: 'Chart data',
} as const

/**
 * Generate accessible button label
 */
export function getButtonLabel(action: string, itemType?: string): string {
  if (itemType) {
    return `${action} ${itemType}`
  }
  return action
}

/**
 * Check if color contrast meets WCAG AA standards
 * Returns true if contrast ratio >= 4.5:1 for normal text or 3:1 for large text
 */
export function checkContrast(foreground: string, background: string, isLargeText = false): boolean {
  const threshold = isLargeText ? 3 : 4.5
  
  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null
  }

  // Calculate relative luminance
  const getLuminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map((val) => {
      val = val / 255
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  const fg = hexToRgb(foreground)
  const bg = hexToRgb(background)

  if (!fg || !bg) return true // Assume valid if can't parse

  const fgLum = getLuminance(fg.r, fg.g, fg.b)
  const bgLum = getLuminance(bg.r, bg.g, bg.b)

  const contrast =
    (Math.max(fgLum, bgLum) + 0.05) / (Math.min(fgLum, bgLum) + 0.05)

  return contrast >= threshold
}


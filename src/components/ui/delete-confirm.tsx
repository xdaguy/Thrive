'use client'

import { useState, useRef } from 'react'
import { ConfirmDialog } from './confirm-dialog'

/**
 * Simple Delete Confirmation Hook
 * Use this for standard delete operations
 * 
 * Supports both callback and Promise-based patterns:
 * - Callback: confirm(id, () => { ... }, title, message)
 * - Promise: const confirmed = await confirm(title, message)
 */
export function useDeleteConfirm() {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('Delete Item')
  const [message, setMessage] = useState('Are you sure you want to delete this item? This action cannot be undone.')
  const resolveRef = useRef<((value: boolean) => void) | null>(null)

  // Overloaded confirm function that supports both patterns
  function confirm(
    titleOrId?: string,
    messageOrCallback?: string | (() => void),
    customTitle?: string,
    customMessage?: string
  ): Promise<boolean> {
    return new Promise((resolve) => {
      resolveRef.current = resolve

      // Promise-based pattern: confirm(title?, message?)
      if (typeof messageOrCallback === 'string' || messageOrCallback === undefined) {
        setTitle(titleOrId || 'Delete Item')
        setMessage(messageOrCallback || 'Are you sure you want to delete this item? This action cannot be undone.')
        setIsOpen(true)
      }
      // Callback pattern (legacy): confirm(id, callback, title?, message?)
      else if (typeof messageOrCallback === 'function') {
        setTitle(customTitle || 'Delete Item')
        setMessage(customMessage || 'Are you sure you want to delete this item? This action cannot be undone.')
        setIsOpen(true)
        // For callback pattern, auto-resolve to true and call callback on confirm
        resolveRef.current = (confirmed) => {
          if (confirmed) {
            messageOrCallback()
          }
          resolve(confirmed)
        }
      }
      // No arguments: use defaults
      else {
        setTitle('Delete Item')
        setMessage('Are you sure you want to delete this item? This action cannot be undone.')
        setIsOpen(true)
      }
    })
  }

  const handleConfirm = () => {
    if (resolveRef.current) {
      resolveRef.current(true)
      resolveRef.current = null
    }
    setIsOpen(false)
  }

  const handleClose = () => {
    if (resolveRef.current) {
      resolveRef.current(false)
      resolveRef.current = null
    }
    setIsOpen(false)
  }

  const DeleteDialog = () => (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title={title}
      message={message}
      variant="danger"
      confirmText="Delete"
      cancelText="Cancel"
    />
  )

  return { confirm, DeleteDialog }
}

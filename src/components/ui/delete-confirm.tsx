'use client'

import { useState } from 'react'
import { ConfirmDialog } from './confirm-dialog'

/**
 * Simple Delete Confirmation Hook
 * Use this for standard delete operations
 */
export function useDeleteConfirm() {
  const [isOpen, setIsOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string>('')
  const [onConfirmCallback, setOnConfirmCallback] = useState<(() => void) | null>(null)
  const [title, setTitle] = useState('Delete Item')
  const [message, setMessage] = useState('Are you sure you want to delete this item? This action cannot be undone.')

  const confirm = (
    id: string,
    onConfirm: () => void,
    customTitle?: string,
    customMessage?: string
  ) => {
    setDeleteId(id)
    setOnConfirmCallback(() => onConfirm)
    if (customTitle) setTitle(customTitle)
    if (customMessage) setMessage(customMessage)
    setIsOpen(true)
  }

  const handleConfirm = () => {
    if (onConfirmCallback) {
      onConfirmCallback()
    }
    setIsOpen(false)
    setOnConfirmCallback(null)
  }

  const handleClose = () => {
    setIsOpen(false)
    setDeleteId('')
    setOnConfirmCallback(null)
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

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface EditableFieldProps {
  label: string
  value: string | null | undefined
  displayValue?: string | null
  fieldName: string
  type?: 'text' | 'select' | 'textarea' | 'multi-select'
  options?: { value: string; label: string }[]
  multiValue?: string[]
  onSave: (fieldName: string, value: string | string[] | null) => Promise<void>
  validate?: (value: string) => string | null
  placeholder?: string
  wrapperClassName?: string
}

export function EditableField({
  label,
  value,
  displayValue,
  fieldName,
  type = 'text',
  options = [],
  multiValue = [],
  onSave,
  validate,
  placeholder,
  wrapperClassName,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [localValue, setLocalValue] = useState(value || '')
  const [isSaving, setIsSaving] = useState(false)
  const [hasError, setHasError] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  // Reset local value when prop changes
  useEffect(() => {
    setLocalValue(value || '')
  }, [value])

  // Auto-focus when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      // Place cursor at end for text inputs
      if (type === 'text' || type === 'textarea') {
        const el = inputRef.current
        const len = el.value.length
        el.setSelectionRange(len, len)
      }
    }
  }, [isEditing, type])

  // Click outside to save (for text/textarea)
  useEffect(() => {
    if (!isEditing) return
    if (type === 'select' || type === 'multi-select') {
      const handleClickOutside = (event: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
          setIsEditing(false)
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isEditing, type])

  const handleSaveAndClose = useCallback(async () => {
    const trimmed = typeof localValue === 'string' ? localValue : ''
    // Skip save if value unchanged
    if (trimmed === (value || '')) {
      setIsEditing(false)
      return
    }
    // Validate
    if (validate) {
      const errorMsg = validate(trimmed)
      if (errorMsg) {
        setHasError(true)
        setTimeout(() => setHasError(false), 1500)
        setLocalValue(value || '')
        setIsEditing(false)
        return
      }
    }
    setIsSaving(true)
    try {
      await onSave(fieldName, trimmed || null)
    } finally {
      setIsSaving(false)
      setIsEditing(false)
    }
  }, [localValue, value, validate, onSave, fieldName])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && type !== 'textarea') {
      e.preventDefault()
      handleSaveAndClose()
    }
    if (e.key === 'Escape') {
      setLocalValue(value || '')
      setIsEditing(false)
    }
  }

  const handleSelectOption = async (optionValue: string) => {
    if (optionValue === (value || '')) {
      setIsEditing(false)
      return
    }
    setIsSaving(true)
    try {
      await onSave(fieldName, optionValue || null)
    } finally {
      setIsSaving(false)
      setIsEditing(false)
    }
  }

  const handleMultiToggle = async (toggleValue: string) => {
    const current = [...multiValue]
    const updated = current.includes(toggleValue)
      ? current.filter((v) => v !== toggleValue)
      : [...current, toggleValue]
    setIsSaving(true)
    try {
      await onSave(fieldName, updated)
    } finally {
      setIsSaving(false)
    }
  }

  const shownValue = displayValue ?? value

  return (
    <div
      ref={wrapperRef}
      className={cn(
        'group relative px-2 py-1.5 -mx-2 -my-1.5 rounded-lg transition-colors',
        !isEditing && 'cursor-pointer hover:bg-secondary-50',
        isSaving && 'opacity-60 pointer-events-none',
        hasError && 'ring-1 ring-red-400',
        wrapperClassName
      )}
      onClick={() => {
        if (!isEditing && !isSaving) setIsEditing(true)
      }}
    >
      {/* Hover pencil icon */}
      {!isEditing && (
        <svg
          className="absolute top-1.5 right-1.5 w-3 h-3 text-secondary-300 opacity-0 group-hover:opacity-100 transition-opacity"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
          />
        </svg>
      )}

      <p className="text-xs font-medium text-secondary-500">{label}</p>

      {isEditing ? (
        <>
          {type === 'text' && (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSaveAndClose}
              placeholder={placeholder}
              className="w-full px-2 py-1 mt-0.5 text-sm rounded-lg border border-secondary-300 bg-white text-secondary-900 placeholder:text-secondary-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          )}

          {type === 'textarea' && (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setLocalValue(value || '')
                  setIsEditing(false)
                }
              }}
              onBlur={handleSaveAndClose}
              placeholder={placeholder}
              rows={2}
              className="w-full px-2 py-1 mt-0.5 text-sm rounded-lg border border-secondary-300 bg-white text-secondary-900 placeholder:text-secondary-400 resize-none focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          )}

          {type === 'select' && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-secondary-200 rounded-xl shadow-lg z-50 py-1">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelectOption(opt.value)
                  }}
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm hover:bg-secondary-50 transition-colors',
                    opt.value === (value || '') && 'font-medium text-primary-600'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {type === 'multi-select' && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-secondary-200 rounded-xl shadow-lg z-50 py-1">
              {options.map((opt) => {
                const isSelected = multiValue.includes(opt.value)
                return (
                  <button
                    key={opt.value}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMultiToggle(opt.value)
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-secondary-50 transition-colors"
                  >
                    <span
                      className={cn(
                        'w-4 h-4 rounded border flex items-center justify-center shrink-0',
                        isSelected
                          ? 'bg-primary-100 text-primary-700 border-transparent'
                          : 'border-secondary-300'
                      )}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    {opt.label}
                  </button>
                )
              })}
            </div>
          )}

          {/* Show current value text for select/multi-select while dropdown is open */}
          {(type === 'select' || type === 'multi-select') && (
            <p className="text-sm text-secondary-900 mt-0.5">{shownValue || '—'}</p>
          )}
        </>
      ) : (
        <p className="text-sm text-secondary-900 mt-0.5">{shownValue || '—'}</p>
      )}
    </div>
  )
}

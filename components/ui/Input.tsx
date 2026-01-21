'use client'

import { cn } from '@/lib/utils'
import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

const baseInputStyles = 'w-full px-4 py-3 rounded-xl border border-secondary-300 bg-white text-secondary-900 placeholder:text-secondary-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
const errorInputStyles = 'border-red-500 focus:ring-red-500 focus:border-red-500'
const labelStyles = 'block text-sm font-medium text-secondary-700 mb-2'
const errorTextStyles = 'text-red-500 text-sm mt-1'

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className={labelStyles}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(baseInputStyles, error && errorInputStyles, className)}
          {...props}
        />
        {error && <p className={errorTextStyles}>{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, rows = 4, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className={labelStyles}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          className={cn(baseInputStyles, 'resize-none', error && errorInputStyles, className)}
          {...props}
        />
        {error && <p className={errorTextStyles}>{error}</p>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className={labelStyles}>
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(baseInputStyles, 'cursor-pointer', error && errorInputStyles, className)}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className={errorTextStyles}>{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'

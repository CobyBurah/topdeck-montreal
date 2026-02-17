'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useTranslations, useLocale } from 'next-intl'
import imageCompression from 'browser-image-compression'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { AddressAutocomplete } from '@/components/forms/AddressAutocomplete'

interface FormDataState {
  name: string
  email: string
  phone: string
  address: string
  service: string
  size: string
  message: string
  images: File[]
}

interface FormErrors {
  name?: string
  email?: string
  phone?: string
  service?: string
}

const formFieldVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  }),
}

const successIconVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 200,
      damping: 15,
      delay: 0.2,
    },
  },
}

const checkmarkVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.5, delay: 0.5 },
      opacity: { duration: 0.2, delay: 0.5 },
    },
  },
}

const confettiColors = ['#F97316', '#22C55E', '#3B82F6', '#EAB308', '#EC4899']

const initialFormData: FormDataState = {
  name: '',
  email: '',
  phone: '',
  address: '',
  service: '',
  size: '',
  message: '',
  images: [],
}

interface QuoteFormProps {
  onSubmitStateChange?: (isSubmitted: boolean) => void
}

export function QuoteForm({ onSubmitStateChange }: QuoteFormProps) {
  const t = useTranslations('quoteForm')
  const locale = useLocale()

  const surfaceOptions = [
    { value: 'deck', label: t('surfaces.deck') },
    { value: 'fence', label: t('surfaces.fence') },
    { value: 'pergola', label: t('surfaces.pergola') },
    { value: 'multiple', label: t('surfaces.multiple') },
    { value: 'other', label: t('surfaces.other') },
  ]

  const [formData, setFormData] = useState<FormDataState>(initialFormData)

  const [errors, setErrors] = useState<FormErrors>({})
  const [isCompressing, setIsCompressing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [clientPortalLink, setClientPortalLink] = useState<string | null>(null)
  const shouldReduceMotion = useReducedMotion()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const successMessageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isSubmitted && successMessageRef.current) {
      // Small delay to ensure DOM is updated
      const timeoutId = setTimeout(() => {
        successMessageRef.current?.scrollIntoView({
          behavior: shouldReduceMotion ? 'auto' : 'smooth',
          block: 'center',
        })
      }, 100)

      return () => clearTimeout(timeoutId)
    }
  }, [isSubmitted, shouldReduceMotion])

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '')

    // Limit to 10 digits
    const truncated = numbers.slice(0, 10)

    // Apply formatting based on length
    if (truncated.length === 0) {
      return ''
    } else if (truncated.length <= 2) {
      return `(${truncated}`
    } else if (truncated.length === 3) {
      return `(${truncated}) `
    } else if (truncated.length <= 5) {
      return `(${truncated.slice(0, 3)}) ${truncated.slice(3)}`
    } else if (truncated.length === 6) {
      return `(${truncated.slice(0, 3)}) ${truncated.slice(3)}-`
    } else {
      return `(${truncated.slice(0, 3)}) ${truncated.slice(3, 6)}-${truncated.slice(6)}`
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = t('errors.nameRequired')
    }

    if (!formData.email.trim()) {
      newErrors.email = t('errors.emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('errors.emailInvalid')
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t('errors.phoneRequired')
    }

    if (!formData.service) {
      newErrors.service = t('errors.serviceRequired')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const submitData = new FormData()
      submitData.append('name', formData.name)
      submitData.append('email', formData.email)
      submitData.append('phone', formData.phone)
      submitData.append('address', formData.address)
      submitData.append('service', formData.service)
      submitData.append('size', formData.size)
      submitData.append('message', formData.message)

      formData.images.forEach((file) => {
        submitData.append('images', file)
      })

      // Include the user's language preference
      submitData.append('language', locale)

      const response = await fetch('/api/contact', {
        method: 'POST',
        body: submitData,
      })

      if (!response.ok) {
        throw new Error('Failed to submit form')
      }

      const data = await response.json()
      setClientPortalLink(data.clientPortalLink || null)
      setIsSubmitted(true)
      onSubmitStateChange?.(true)
    } catch {
      setSubmitError(t('errors.submitFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target

    // Apply phone formatting for phone field
    const formattedValue = name === 'phone' ? formatPhoneNumber(value) : value

    setFormData(prev => ({ ...prev, [name]: formattedValue }))

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleEmailBlur = () => {
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrors(prev => ({ ...prev, email: t('errors.emailInvalid') }))
    }
  }

  const handlePhoneBlur = () => {
    const digits = formData.phone.replace(/\D/g, '')
    if (digits.length > 0 && digits.length < 10) {
      setErrors(prev => ({ ...prev, phone: t('errors.phoneInvalid') }))
    }
  }

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const input = e.currentTarget
      const cursorPos = input.selectionStart || 0
      const value = input.value

      // Check if cursor is right after a formatting character
      if (cursorPos > 0) {
        const charBeforeCursor = value[cursorPos - 1]
        // Formatting characters: (, ), space, -
        if (['(', ')', ' ', '-'].includes(charBeforeCursor)) {
          e.preventDefault()
          const digits = value.replace(/\D/g, '')
          // Find which digit position corresponds to cursor
          let digitCount = 0
          for (let i = 0; i < cursorPos; i++) {
            if (/\d/.test(value[i])) digitCount++
          }
          // Remove the digit before the formatting character
          const newDigits = digits.slice(0, digitCount - 1) + digits.slice(digitCount)
          const newValue = formatPhoneNumber(newDigits)
          setFormData(prev => ({ ...prev, phone: newValue }))

          // Set cursor position after React re-renders
          setTimeout(() => {
            let newCursorPos = 0
            let count = 0
            for (let i = 0; i < newValue.length && count < digitCount - 1; i++) {
              if (/\d/.test(newValue[i])) count++
              newCursorPos = i + 1
            }
            input.setSelectionRange(newCursorPos, newCursorPos)
          }, 0)
        }
      }
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setIsCompressing(true)
    try {
      const compressed = await Promise.all(
        files.map((file) =>
          imageCompression(file, {
            maxSizeMB: 0.8,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          })
        )
      )
      const compressedFiles = compressed.map(
        (blob, i) => new File([blob], files[i].name, { type: blob.type })
      )
      setFormData(prev => ({ ...prev, images: [...prev.images, ...compressedFiles] }))
    } catch {
      setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }))
    } finally {
      setIsCompressing(false)
    }
  }

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  if (isSubmitted) {
    return (
      <motion.div
        ref={successMessageRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12 relative overflow-hidden"
      >
        {/* Confetti particles */}
        {!shouldReduceMotion && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  backgroundColor: confettiColors[i % confettiColors.length],
                  left: `${10 + Math.random() * 80}%`,
                  top: '-10px',
                }}
                initial={{ y: 0, opacity: 1, rotate: 0 }}
                animate={{
                  y: 400,
                  opacity: 0,
                  rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                  x: (Math.random() - 0.5) * 100,
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  delay: Math.random() * 0.5,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>
        )}

        <motion.div
          variants={successIconVariants}
          initial="hidden"
          animate="visible"
          className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mx-auto mb-6"
        >
          <motion.svg
            className="h-10 w-10 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <motion.path
              variants={checkmarkVariants}
              initial="hidden"
              animate="visible"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </motion.svg>
        </motion.div>

        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-2xl font-bold text-secondary-900 mb-2"
        >
          {t('success.title')}
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-secondary-600 mb-6"
        >
          {t('success.message')}
        </motion.p>

        {clientPortalLink && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-4"
          >
            <motion.div
              whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
            >
              <Button
                href={clientPortalLink}
                size="lg"
              >
                {t('success.trackProject')}
              </Button>
            </motion.div>
            <p className="text-sm text-secondary-500 mt-2">
              {t('success.trackProjectDescription')}
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: clientPortalLink ? 0.9 : 0.8 }}
          whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
          whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
        >
          <Button
            onClick={() => {
              setIsSubmitted(false)
              setFormData(initialFormData)
              setErrors({})
              setClientPortalLink(null)
              onSubmitStateChange?.(false)
            }}
            variant="outline"
          >
            {t('success.button')}
          </Button>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-2"
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="grid sm:grid-cols-2 gap-x-6 gap-y-2"
        custom={0}
        variants={shouldReduceMotion ? {} : formFieldVariants}
      >
        <Input
          label={t('labels.fullName')}
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder={t('placeholders.name')}
          error={errors.name}
        />
        <Input
          label={t('labels.email')}
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleEmailBlur}
          placeholder={t('placeholders.email')}
          error={errors.email}
        />
      </motion.div>

      <motion.div
        className="grid sm:grid-cols-2 gap-x-6 gap-y-2"
        custom={1}
        variants={shouldReduceMotion ? {} : formFieldVariants}
      >
        <Input
          label={t('labels.phone')}
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          onKeyDown={handlePhoneKeyDown}
          onBlur={handlePhoneBlur}
          placeholder={t('placeholders.phone')}
          error={errors.phone}
        />
        <AddressAutocomplete
          label={t('labels.address')}
          name="address"
          value={formData.address}
          onChange={(val) => setFormData(prev => ({ ...prev, address: val }))}
          onAddressSelect={(addr) => setFormData(prev => ({ ...prev, address: addr }))}
          placeholder={t('placeholders.address')}
        />
      </motion.div>

      <motion.div
        className="grid sm:grid-cols-2 gap-x-6 gap-y-2"
        custom={2}
        variants={shouldReduceMotion ? {} : formFieldVariants}
      >
        <Select
          label={t('labels.service')}
          name="service"
          value={formData.service}
          onChange={handleChange}
          options={surfaceOptions}
          placeholder={t('placeholders.service')}
          error={errors.service}
        />
        <Input
          label={t('labels.size')}
          name="size"
          value={formData.size}
          onChange={handleChange}
          placeholder={t('placeholders.size')}
        />
      </motion.div>

      <motion.div
        custom={3}
        variants={shouldReduceMotion ? {} : formFieldVariants}
      >
        <Textarea
          label={t('labels.message')}
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder={t('placeholders.message')}
          rows={3}
        />
      </motion.div>

      <motion.div
        custom={4}
        variants={shouldReduceMotion ? {} : formFieldVariants}
      >
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          {t('labels.images')}
        </label>
        <div
          className="border-2 border-dashed border-secondary-300 rounded-xl p-6 text-center hover:border-primary-400 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <svg
            className="mx-auto h-12 w-12 text-secondary-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
          <p className="mt-2 text-sm text-secondary-600">
            {isCompressing ? t('compressingImages') : t('placeholders.images')}
          </p>
        </div>

        {formData.images.length > 0 && (
          <div className="mt-4 space-y-2">
            {formData.images.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-secondary-50 rounded-lg px-4 py-2"
              >
                <span className="text-sm text-secondary-700 truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-secondary-400 hover:text-red-500 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {submitError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm"
        >
          {submitError}
        </motion.div>
      )}

      <motion.div
        className="pt-4"
        custom={5}
        variants={shouldReduceMotion ? {} : formFieldVariants}
      >
        <motion.div
          whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
          whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
          className="inline-block"
        >
          <Button
            type="submit"
            size="lg"
            className="w-full sm:w-auto"
            disabled={isSubmitting || isCompressing}
          >
            <AnimatePresence mode="wait">
              {isSubmitting ? (
                <motion.span
                  key="submitting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <motion.svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </motion.svg>
                  {t('submitting')}
                </motion.span>
              ) : (
                <motion.span
                  key="submit"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {t('submit')}
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </motion.div>

      <motion.p
        className="text-sm text-secondary-500"
        custom={6}
        variants={shouldReduceMotion ? {} : formFieldVariants}
      >
        {t('disclaimer')}
      </motion.p>
    </motion.form>
  )
}

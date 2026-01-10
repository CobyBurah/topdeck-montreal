'use client'

import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface FormData {
  name: string
  email: string
  phone: string
  address: string
  service: string
  size: string
  timeline: string
  message: string
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

export function QuoteForm() {
  const t = useTranslations('quoteForm')

  const surfaceOptions = [
    { value: 'deck', label: t('surfaces.deck') },
    { value: 'fence', label: t('surfaces.fence') },
    { value: 'railing', label: t('surfaces.railing') },
    { value: 'pergola', label: t('surfaces.pergola') },
    { value: 'multiple', label: t('surfaces.multiple') },
    { value: 'other', label: t('surfaces.other') },
  ]

  const timelineOptions = [
    { value: 'asap', label: t('timelines.asap') },
    { value: '1-2-weeks', label: t('timelines.1-2weeks') },
    { value: '1-month', label: t('timelines.1month') },
    { value: 'flexible', label: t('timelines.flexible') },
  ]

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    service: '',
    size: '',
    timeline: '',
    message: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const shouldReduceMotion = useReducedMotion()

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

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500))

    console.log('Form submitted:', formData)
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  if (isSubmitted) {
    return (
      <motion.div
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
          whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
        >
          <Button onClick={() => setIsSubmitted(false)} variant="outline">
            {t('success.button')}
          </Button>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="grid sm:grid-cols-2 gap-6"
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
          placeholder={t('placeholders.email')}
          error={errors.email}
        />
      </motion.div>

      <motion.div
        className="grid sm:grid-cols-2 gap-6"
        custom={1}
        variants={shouldReduceMotion ? {} : formFieldVariants}
      >
        <Input
          label={t('labels.phone')}
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder={t('placeholders.phone')}
          error={errors.phone}
        />
        <Input
          label={t('labels.address')}
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder={t('placeholders.address')}
        />
      </motion.div>

      <motion.div
        className="grid sm:grid-cols-2 gap-6"
        custom={2}
        variants={shouldReduceMotion ? {} : formFieldVariants}
      >
        <Select
          label={t('labels.service')}
          name="service"
          value={formData.service}
          onChange={handleChange}
          options={surfaceOptions}
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
        <Select
          label={t('labels.timeline')}
          name="timeline"
          value={formData.timeline}
          onChange={handleChange}
          options={timelineOptions}
        />
      </motion.div>

      <motion.div
        custom={4}
        variants={shouldReduceMotion ? {} : formFieldVariants}
      >
        <Textarea
          label={t('labels.message')}
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder={t('placeholders.message')}
          rows={5}
        />
      </motion.div>

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
            disabled={isSubmitting}
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

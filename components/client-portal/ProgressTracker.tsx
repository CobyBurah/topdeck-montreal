'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'

interface ProgressStep {
  key: string
  completed: boolean
}

interface ProgressTrackerProps {
  steps: ProgressStep[]
  estimateLink?: string | null
}

export function ProgressTracker({ steps, estimateLink }: ProgressTrackerProps) {
  const t = useTranslations('clientPortal')

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
      <h2 className="text-lg font-semibold text-secondary-900 mb-8">
        {t('progressTitle')}
      </h2>

      {/* Desktop: Horizontal */}
      <div className="hidden md:flex items-start justify-between relative">
        {steps.map((step, index) => (
          <div key={step.key} className="flex flex-col items-center relative z-10 flex-1">
            {/* Circle */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.2, type: 'spring', stiffness: 200, damping: 15 }}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step.completed
                  ? 'bg-green-500 text-white'
                  : 'bg-secondary-200 text-secondary-400'
              }`}
            >
              {step.completed ? (
                <motion.svg
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: index * 0.2 + 0.3, duration: 0.4 }}
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                  stroke="currentColor"
                >
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: index * 0.2 + 0.3, duration: 0.4 }}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </motion.svg>
              ) : (
                index + 1
              )}
            </motion.div>

            {/* Label */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 + 0.1 }}
              className={`mt-3 text-sm font-medium text-center ${
                step.completed ? 'text-secondary-900' : 'text-secondary-400'
              }`}
            >
              {t(`steps.${step.key}`)}
            </motion.p>

            {/* Description */}
            {step.completed && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.2 + 0.2 }}
                className="mt-1 text-xs text-secondary-500 text-center max-w-[140px]"
              >
                {t(`stepsDescription.${step.key}`)}
              </motion.p>
            )}

          </div>
        ))}

        {/* Connecting lines (behind circles via lower z-index) */}
        <div className="absolute top-6 left-0 right-0 flex -translate-y-1/2 px-[16.67%]">
          {steps.slice(0, -1).map((step, index) => (
            <motion.div
              key={index}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: index * 0.2 + 0.15, duration: 0.3 }}
              className={`flex-1 h-0.5 origin-left ${
                step.completed ? 'bg-green-500' : 'bg-secondary-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Mobile: Vertical */}
      <div className="md:hidden space-y-0">
        {steps.map((step, index) => (
          <div key={step.key} className="flex items-start gap-4">
            {/* Circle + vertical line */}
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.15, type: 'spring', stiffness: 200, damping: 15 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  step.completed
                    ? 'bg-green-500 text-white'
                    : 'bg-secondary-200 text-secondary-400'
                }`}
              >
                {step.completed ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  index + 1
                )}
              </motion.div>
              {index < steps.length - 1 && (
                <div className={`w-0.5 h-8 ${
                  step.completed ? 'bg-green-500' : 'bg-secondary-200'
                }`} />
              )}
            </div>

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15 + 0.1 }}
              className="pt-2 pb-4"
            >
              <p className={`text-sm font-medium ${
                step.completed ? 'text-secondary-900' : 'text-secondary-400'
              }`}>
                {t(`steps.${step.key}`)}
              </p>
              {step.completed && (
                <p className="text-xs text-secondary-500 mt-0.5">
                  {t(`stepsDescription.${step.key}`)}
                </p>
              )}
            </motion.div>
          </div>
        ))}
      </div>

      {/* Estimate Link */}
      {estimateLink && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex justify-center"
        >
          <Button
            href={estimateLink}
            size="lg"
            target="_blank"
            rel="noopener noreferrer"
            className="gap-2"
          >
            {t('estimateCard.viewEstimate')}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </Button>
        </motion.div>
      )}
    </div>
  )
}

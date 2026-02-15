'use client'

import { useTranslations } from 'next-intl'

export function StainDisclaimer() {
  const t = useTranslations('clientPortal.stainSelector')

  return (
    <div className="mt-6 flex gap-3 rounded-xl bg-secondary-50 p-4">
      <svg
        className="w-5 h-5 text-secondary-400 flex-shrink-0 mt-0.5"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
        />
      </svg>
      <p className="text-xs text-secondary-500 leading-relaxed">
        {t('disclaimer')}
      </p>
    </div>
  )
}

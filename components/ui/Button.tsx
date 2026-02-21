'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react'

interface ButtonBaseProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  className?: string
}

interface ButtonAsButton extends ButtonBaseProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> {
  href?: never
}

interface ButtonAsLink extends ButtonBaseProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps> {
  href: string
}

type ButtonProps = ButtonAsButton | ButtonAsLink

const variantStyles = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-md hover:shadow-lg',
  secondary: 'bg-secondary-800 text-white hover:bg-secondary-700 active:bg-secondary-900',
  outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white hover:scale-105 active:bg-primary-700 active:text-white active:scale-95',
  ghost: 'text-secondary-700 hover:bg-secondary-100 active:bg-secondary-200',
}

const sizeStyles = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className,
  ...props
}: ButtonProps) {
  const baseStyles = cn(
    'inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
    variantStyles[variant],
    sizeStyles[size],
    className
  )

  if ('href' in props && props.href) {
    const { href, ...linkProps } = props as ButtonAsLink
    return (
      <Link href={href} className={baseStyles} {...linkProps}>
        {children}
      </Link>
    )
  }

  return (
    <button className={baseStyles} {...(props as ButtonAsButton)}>
      {children}
    </button>
  )
}

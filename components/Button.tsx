'use client'

import Link from 'next/link'
import { hapticLight } from '@/lib/haptics'
import { ComponentProps, MouseEvent, ReactNode } from 'react'
import clsx from 'clsx'

type Common = {
  children: ReactNode
  className?: string
  variant?: 'brand' | 'ghost' | 'glass' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  disabled?: boolean
  onClick?: ComponentProps<'button'>['onClick']
  'aria-label'?: string
}

type ButtonProps =
  | (Common & { href?: undefined; type?: ComponentProps<'button'>['type'] })
  | (Common & { href: string; type?: undefined; onClick?: undefined })

const sizes = {
  sm: 'h-8 px-3 text-sm rounded-lg',
  md: 'h-9 px-4 text-sm rounded-xl',
  lg: 'h-11 px-5 text-base rounded-2xl',
}

const variants = {
  brand:
    // App-like primary (HYPED gradient)
    'brand-gradient text-black font-medium shadow-cta brand-press relative overflow-hidden',
  ghost:
    'border border-white/10 bg-white/5 hover:bg-white/10 brand-press',
  glass:
    'bg-white/7.5 backdrop-blur border border-white/10 hover:bg-white/12 brand-press',
  danger:
    'bg-red-600/90 hover:bg-red-600 text-white brand-press',
}

export default function Button(props: ButtonProps) {
  const {
    children,
    className,
    variant = 'brand',
    size = 'md',
    fullWidth,
    disabled,
    ...rest
  } = props

  const base = clsx(
    'inline-flex items-center justify-center select-none',
    sizes[size],
    variants[variant],
    fullWidth && 'w-full',
    disabled && 'opacity-60 pointer-events-none',
    className
  )

  function addRipple(e: MouseEvent<HTMLElement>) {
    // minimal ripple
    const target = e.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    const ripple = document.createElement('span')
    const d = Math.max(rect.width, rect.height)
    ripple.className = 'ui-ripple'
    ripple.style.width = ripple.style.height = `${d}px`
    ripple.style.left = `${e.clientX - rect.left - d / 2}px`
    ripple.style.top = `${e.clientY - rect.top - d / 2}px`
    target.appendChild(ripple)
    // auto-clean
    setTimeout(() => ripple.remove(), 450)
  }

  const handlePointerDown = (e: MouseEvent<HTMLElement>) => {
    if (disabled) return
    addRipple(e)
    hapticLight()
  }

  if ('href' in props && props.href) {
    const { href } = props
    return (
      <Link
        href={href}
        className={base}
        onMouseDown={handlePointerDown}
        onTouchStart={(e) => handlePointerDown(e as any)}
        aria-label={props['aria-label']}
      >
        {children}
      </Link>
    )
  }

  const { type = 'button', onClick } = props as any
  return (
    <button
      type={type}
      className={base}
      disabled={disabled}
      onClick={onClick}
      onMouseDown={handlePointerDown}
      onTouchStart={(e) => handlePointerDown(e as any)}
      aria-label={props['aria-label']}
    >
      {children}
    </button>
  )
}
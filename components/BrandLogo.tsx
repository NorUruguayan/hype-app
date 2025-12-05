// components/BrandLogo.tsx
import Image from 'next/image'

export default function BrandLogo({ className = '' }: { className?: string }) {
  return (
    <Image
      src="/logo.png"          // uses your existing public/logo.png
      alt="HYPED"
      width={28}
      height={28}
      priority
      className={`rounded-md ${className}`}
    />
  )
}
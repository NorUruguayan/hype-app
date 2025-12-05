// components/Avatar.tsx
import type { FC } from 'react'

type Props = {
  size?: number
  avatarUrl?: string | null
  name?: string | null
}

const Avatar: FC<Props> = ({ size = 40, avatarUrl, name }) => {
  const initial = (name?.trim()?.[0] ?? 'H').toUpperCase()

  return (
    <div
      className="rounded-xl overflow-hidden shrink-0"
      style={{ width: size, height: size }}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt={name ?? 'avatar'}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full brand-gradient text-white font-bold grid place-items-center">
          {initial}
        </div>
      )}
    </div>
  )
}

export default Avatar
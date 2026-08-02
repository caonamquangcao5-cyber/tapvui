const MALE_AVATARS = ['💪', '🦾', '🏋️‍♂️', '🤸‍♂️', '🚴‍♂️', '🏃‍♂️', '🥊', '🤼‍♂️', '⚽', '🏀']
const FEMALE_AVATARS = ['💃', '🧘‍♀️', '🤸‍♀️', '🚴‍♀️', '🏃‍♀️', '🥊', '🤼‍♀️', '🏋️‍♀️', '🧗‍♀️', '🏐']
const NEUTRAL_AVATARS = ['🏋️', '🤸', '🚴', '🏃', '🧘', '🥋', '🎯', '🔥', '⚡', '🏆']

export function getAvatarPresets(gender) {
  if (gender === 'male') return MALE_AVATARS
  if (gender === 'female') return FEMALE_AVATARS
  return NEUTRAL_AVATARS
}

export function getGenderStyle(gender) {
  if (gender === 'male') {
    return {
      bg: 'bg-gradient-to-br from-blue-400 to-blue-600',
      border: 'border-l-4 border-l-blue-400',
      tint: 'bg-blue-50',
      badge: 'bg-blue-100 text-blue-600',
      icon: '👨',
      label: 'Nam',
      ring: 'ring-2 ring-blue-300',
      text: 'text-blue-600',
    }
  }
  if (gender === 'female') {
    return {
      bg: 'bg-gradient-to-br from-pink-400 to-pink-600',
      border: 'border-l-4 border-l-pink-400',
      tint: 'bg-pink-50',
      badge: 'bg-pink-100 text-pink-600',
      icon: '👩',
      label: 'Nữ',
      ring: 'ring-2 ring-pink-300',
      text: 'text-pink-600',
    }
  }
  return {
    bg: 'bg-gradient-to-br from-secondary to-primary',
    border: '',
    tint: '',
    badge: 'bg-gray-100 text-gray-500',
    icon: '🏋️',
    label: '',
    ring: '',
    text: 'text-gray-500',
  }
}

export default function Avatar({ name, avatar, gender, size = 'md' }) {
  const style = getGenderStyle(gender)
  const sizes = {
    sm: 'w-8 h-8 text-sm rounded-lg',
    md: 'w-12 h-12 text-xl rounded-2xl',
    lg: 'w-16 h-16 text-3xl rounded-3xl',
    xl: 'w-20 h-20 text-4xl rounded-full',
  }
  const sizeClass = sizes[size] || sizes.md
  const isPhoto = avatar && avatar.startsWith('data:image')

  if (isPhoto) {
    return (
      <img
        src={avatar}
        alt={name || 'avatar'}
        className={`${sizeClass} object-cover shrink-0 ${style.ring}`}
      />
    )
  }

  if (avatar) {
    return (
      <div className={`${sizeClass} ${style.bg} flex items-center justify-center shrink-0`}>
        <span className="text-2xl" style={{ fontSize: size === 'lg' ? '2rem' : size === 'xl' ? '2.5rem' : undefined }}>{avatar}</span>
      </div>
    )
  }

  return (
    <div className={`${sizeClass} ${style.bg} flex items-center justify-center text-white font-bold shrink-0`}>
      {name?.charAt(0).toUpperCase() || '?'}
    </div>
  )
}

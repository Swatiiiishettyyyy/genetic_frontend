import type { UpcomingModuleIcon } from '../../navigation/upcomingModules'

type Props = {
  icon: UpcomingModuleIcon
  size?: number
}

const STROKE = '#8B5CF6'
const FILL = '#EDE9FE'
const ACCENT = '#A78BFA'

export default function UpcomingIcon({ icon, size = 22 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill={FILL} />
      {icon === 'genetic' && (
        <>
          <path d="M8.1 5.3c4.9 1.7 7.8 5.1 7.8 13.4" stroke={STROKE} strokeWidth="1.6" strokeLinecap="round" />
          <path d="M15.9 5.3c-4.9 1.7-7.8 5.1-7.8 13.4" stroke={STROKE} strokeWidth="1.6" strokeLinecap="round" />
          <path d="M9.9 7.4h4.2M8.7 10.4h6.6M8.7 13.6h6.6M9.9 16.6h4.2" stroke={ACCENT} strokeWidth="1.25" strokeLinecap="round" />
          <circle cx="8.1" cy="5.3" r="0.9" fill={STROKE} />
          <circle cx="15.9" cy="5.3" r="0.9" fill={STROKE} />
          <circle cx="8.1" cy="18.7" r="0.9" fill={STROKE} />
          <circle cx="15.9" cy="18.7" r="0.9" fill={STROKE} />
        </>
      )}
      {icon === 'lab' && (
        <>
          <path d="M10 5.5h4M11 5.5v4.1l-3.6 6.6A2 2 0 0 0 9.2 19h5.6a2 2 0 0 0 1.8-2.8L13 9.6V5.5" stroke={STROKE} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9.1 15h5.8" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="11" cy="17" r="0.8" fill={STROKE} />
        </>
      )}
      {icon === 'gut' && (
        <>
          <path d="M10.4 4.9v2.7c0 1.1-.5 2-1.4 2.7-1.5 1.1-2.4 2.6-2.4 4.6 0 2.8 2.1 4.6 5.1 4.6h1.9c2.9 0 5-1.9 5-4.6 0-2.4-1.6-4.2-4.2-4.7-1.9-.4-2.9-1.5-3-3.3l-.1-2" fill="#DDD6FE" stroke={STROKE} strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12.6 9.2c-.1 1.7 1 2.9 3 3.3" stroke="#F5F3FF" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M9.5 13.1c1.6.9 4.1.9 5.9-.2" stroke={ACCENT} strokeWidth="1.35" strokeLinecap="round" />
          <path d="M9.6 16.2c.9.7 2.1 1 3.7.9" stroke={ACCENT} strokeWidth="1.35" strokeLinecap="round" />
        </>
      )}
      {icon === 'nutrition' && (
        <>
          <path d="M12 8.8c-.9-1-2.4-1.2-3.6-.5-1.8 1.1-2.4 3.8-1.5 6.5.8 2.4 2.2 4.3 3.8 4.3.7 0 1.2-.4 1.8-.4s1.1.4 1.8.4c1.6 0 3-1.9 3.8-4.3.9-2.7.3-5.4-1.5-6.5-1.2-.7-2.7-.5-3.6.5-.3.3-.5.5-.8.5s-.5-.2-.8-.5Z" fill="#DDD6FE" stroke={STROKE} strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M12.4 7.9c.9-2.1 2.5-2.8 4.1-2.5.1 1.5-.6 3-2 3.8-.7.4-1.5.5-2.2.3" fill="#F5F3FF" stroke={STROKE} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 8.7c0-1.2-.3-2.1-1-3" stroke={ACCENT} strokeWidth="1.4" strokeLinecap="round" />
        </>
      )}
      {icon === 'cell' && (
        <>
          <circle cx="12" cy="12" r="5.7" stroke={STROKE} strokeWidth="1.6" />
          <circle cx="12.2" cy="12" r="2" fill="#DDD6FE" stroke={STROKE} strokeWidth="1.2" />
          <circle cx="8.7" cy="10.2" r="0.7" fill={ACCENT} />
          <circle cx="15.5" cy="14.6" r="0.7" fill={ACCENT} />
        </>
      )}
    </svg>
  )
}

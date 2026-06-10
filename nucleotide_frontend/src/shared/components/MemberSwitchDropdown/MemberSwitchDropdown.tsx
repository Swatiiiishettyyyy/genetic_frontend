import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { MemberProfile, memberService } from '../../auth/memberService'
import { ga4CustomUserParams, shouldTrackGa4, trackGa4CustomEvent, type Ga4AnalyticsScope } from '../../analytics/ga4CustomEvents'

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')
}

const isSelfMember = (m: MemberProfile): boolean =>
  String(m.relation ?? '').trim().toLowerCase() === 'self' ||
  (m as any).is_self === true ||
  (m as any).is_self_profile === true

const profileLinks = [
  { label: 'Personal Information', href: '/account' },
  { label: 'My Family', href: '/account/family' },
  { label: 'My Address', href: '/account/address' },
  { label: 'My Orders', href: '/blood-test/orders' },
  { label: 'My Reports', href: '/blood-test/reports' },
  { label: 'Settings', href: '/account/settings' },
  { label: 'Support', href: '/account/support' },
]

const MemberSwitchDropdown: React.FC<{ onAction?: () => void; analyticsScope?: Ga4AnalyticsScope }> = ({ onAction, analyticsScope }) => {
  const {
    isLoggedIn,
    user,
    currentMember,
    members,
    openLoginModal,
    handleLogout,
    handleSelectMember,
    openAddMemberModal,
    refreshMembers,
  } = useAuth()

  const [isOpen, setIsOpen] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const [showProfileLinks, setShowProfileLinks] = useState(false)
  const [switching, setSwitching] = useState<number | string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const closeDropdown = () => {
    setIsOpen(false)
    setShowMembers(false)
    setShowProfileLinks(false)
    setConfirmDeleteId(null)
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        closeDropdown()
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDropdown()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  if (!isLoggedIn) {
    return (
      <button
        onClick={() => {
          if (shouldTrackGa4(analyticsScope)) {
            trackGa4CustomEvent('bt_top_nav_login', {
              linkText: 'Login',
              ...ga4CustomUserParams({ isLoggedIn, user, currentMember }),
            })
          }
          onAction?.()
          openLoginModal()
        }}
        className="navbar-login-btn flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors"
        style={{
          background: 'linear-gradient(90deg, #101129 0%, #2A2C5B 100%)',
          color: '#fff',
          border: '1px solid #E7E1FF',
          height: 44,
        }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Login
      </button>
    )
  }

  const displayName = currentMember?.name || user?.name || 'Account'
  const initials = getInitials(displayName)
  const currentId = currentMember?.member_id || currentMember?.id

  const onSelectMember = async (m: MemberProfile) => {
    const id = m.member_id || m.id
    if (!id || id === currentId) { closeDropdown(); return }
    setSwitching(id)
    try {
      await handleSelectMember(id)
    } finally {
      setSwitching(null)
      closeDropdown()
    }
  }

  const handleDelete = async (mId: number | string) => {
    setDeleting(true)
    try {
      await memberService.deleteMember(Number(mId))
      await refreshMembers()
    } finally {
      setDeleting(false)
      setConfirmDeleteId(null)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(p => !p)}
        aria-label="Switch member"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="member-switch-trigger flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-[#F8F6FF] hover:border-[#DCD2FF] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/25 transition-colors"
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
          style={{ backgroundColor: '#101129' }}
        >
          {initials || '?'}
        </div>
        <span className="text-sm font-medium text-gray-800 max-w-24 truncate hidden sm:block">{displayName}</span>
        <svg
          className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="member-switch-panel absolute right-0 top-full mt-3 min-w-[17.5rem] w-[17.5rem] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-[0_18px_48px_rgba(16,17,41,0.16)] border border-[#E9E4FF] z-[120] overflow-visible"
          style={{ width: '17.5rem', minWidth: '17.5rem' }}
          role="menu"
          aria-label="Account and member menu"
        >
          <div className="absolute right-9 -top-2 h-4 w-4 rotate-45 bg-white border-l border-t border-[#E9E4FF]" aria-hidden="true" />
          <div className="px-4 py-3 bg-gradient-to-r from-[#FAF9FF] to-white border-b border-[#EFEAFF]">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.14em]">Viewing as</p>
            <div className="mt-1 flex items-center gap-2">
              <p className="min-w-0 flex-1 truncate text-[15px] font-semibold text-[#101129]">{displayName}</p>
              {members.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileLinks(false)
                    setShowMembers(open => !open)
                  }}
                  aria-label="Switch member"
                  aria-expanded={showMembers}
                  className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-[#DCD2FF] bg-white text-[#6D4DFF] transition-colors hover:bg-[#F4F0FF] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/25"
                  title="Switch member"
                >
                  <svg className={`h-3.5 w-3.5 transition-transform ${showMembers ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h10m0 0l-3-3m3 3l-3 3M16 17H6m0 0l3 3m-3-3l3-3" />
                  </svg>
                </button>
              )}
            </div>
            {user?.mobileNumber && (
              <p className="text-[13px] text-gray-500 mt-0.5 whitespace-nowrap">+91 {user.mobileNumber}</p>
            )}
          </div>

          {showMembers && members.length > 0 && (
            <div
              className="absolute right-[calc(100%+0.25rem)] top-[0.75rem] min-w-[17.5rem] w-[17.5rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-[#E9E4FF] bg-white py-1.5 shadow-[0_18px_48px_rgba(16,17,41,0.16)]"
              style={{
                right: 'calc(100% + 0.25rem)',
                top: '0.75rem',
                width: '17.5rem',
                minWidth: '17.5rem',
                zIndex: 130,
              }}
            >
              <div className="absolute -right-2 top-9 h-4 w-4 rotate-45 border-r border-t border-[#E9E4FF] bg-white" aria-hidden="true" />
              <p className="px-4 pb-2 pt-1 text-[11px] font-semibold text-gray-400 uppercase tracking-[0.14em]">Switch Member</p>
              <div className="max-h-60 overflow-y-auto">
                {members.map(m => {
                  const mId = m.member_id || m.id
                  const isSelected = mId === currentId
                  const isSwitch = switching === mId
                  const self = isSelfMember(m)
                  return (
                    <div
                      key={mId}
                      className="mx-2 mb-1 flex items-center w-auto rounded-xl hover:bg-[#FAF9FF] transition-colors"
                      style={{ backgroundColor: isSelected ? '#F4F0FF' : undefined }}
                    >
                      <button
                        onClick={() => onSelectMember(m)}
                        disabled={isSwitch || isSelected}
                        role="menuitemradio"
                        aria-checked={isSelected}
                        className="flex-1 flex items-center gap-2.5 px-2.5 py-2 text-left min-w-0 rounded-l-xl disabled:cursor-default focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#8B5CF6]/25"
                      >
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                          style={{
                            backgroundColor: isSelected ? '#101129' : '#E5E7EB',
                            color: isSelected ? '#fff' : '#374151',
                          }}
                        >
                          {isSwitch ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          ) : getInitials(m.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{m.name}</p>
                          <p className="text-xs text-gray-500 truncate">{m.relation || 'Member'}</p>
                        </div>
                        {isSelected && (
                          <svg className="w-4 h-4 text-[#6D4DFF] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); closeDropdown(); openAddMemberModal(m) }}
                        className="p-2 mr-0.5 text-gray-400 hover:text-[#6D4DFF] hover:bg-white rounded-lg transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/25"
                        title="Edit"
                        aria-label={`Edit ${m.name}`}
                      >
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      {!self && (
                        confirmDeleteId === mId ? (
                          <div className="flex items-center gap-1 mr-2 flex-shrink-0 rounded-lg bg-white px-1 py-1 shadow-sm">
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-xs text-gray-500 px-2 py-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleDelete(mId!)}
                              disabled={deleting}
                              className="text-xs text-red-600 px-2 py-1 rounded-md hover:bg-red-50 font-semibold disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-red-100"
                            >
                              {deleting ? '...' : 'Delete'}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(mId!) }}
                            className="p-2 mr-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-red-100"
                            title="Delete"
                            aria-label={`Delete ${m.name}`}
                          >
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )
                      )}
                      {self && <div className="w-2 flex-shrink-0" />}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="border-t border-[#EFEAFF] py-1.5">
            <button
              type="button"
              onClick={() => {
                setShowMembers(false)
                setShowProfileLinks(open => !open)
              }}
              role="menuitem"
              aria-expanded={showProfileLinks}
              className="mx-2 flex w-[calc(100%-1rem)] items-center justify-start gap-2.5 rounded-xl px-2.5 py-2 hover:bg-[#FAF9FF] transition-colors text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#8B5CF6]/25"
            >
              <div className="w-7 h-7 rounded-full bg-[#F6F4FF] flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM5.5 21a6.5 6.5 0 0113 0" />
                </svg>
              </div>
              <span className="min-w-0 flex-1 text-sm font-medium text-gray-700 whitespace-nowrap">My Profile</span>
              <svg
                className={`h-3.5 w-3.5 flex-shrink-0 text-gray-400 transition-transform ${showProfileLinks ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4M16 15l-4 4-4-4" />
              </svg>
            </button>
            {showProfileLinks && (
              <div className="mx-2 mb-1 mt-1 rounded-2xl border border-[#E9E4FF] bg-[#FAF9FF] px-2 py-2">
                {profileLinks.map(link => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => { closeDropdown(); onAction?.() }}
                    role="menuitem"
                    className="block rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-white hover:text-[#6D4DFF] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#8B5CF6]/25"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
            <button
              onClick={() => { closeDropdown(); onAction?.(); openAddMemberModal() }}
              role="menuitem"
              className="mx-2 flex w-[calc(100%-1rem)] items-center justify-start gap-2.5 rounded-xl px-2.5 py-2 hover:bg-[#FAF9FF] transition-colors text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#8B5CF6]/25"
            >
              <div className="w-7 h-7 rounded-full border-2 border-dashed border-[#CFC5FF] flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-[#7C5CFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="min-w-[8.75rem] text-sm font-medium text-gray-700 whitespace-nowrap">Add Family Member</span>
            </button>
            <button
              onClick={() => {
                if (shouldTrackGa4(analyticsScope)) {
                  trackGa4CustomEvent('logout_click', {
                    linkText: 'Logout',
                    ...ga4CustomUserParams({ isLoggedIn, user, currentMember }),
                  })
                }
                closeDropdown()
                handleLogout()
              }}
              role="menuitem"
              className="mx-2 flex w-[calc(100%-1rem)] items-center justify-start gap-2.5 rounded-xl px-2.5 py-2 hover:bg-red-50 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-100"
            >
              <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <span className="min-w-[8.75rem] text-sm text-red-600 font-medium whitespace-nowrap">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MemberSwitchDropdown

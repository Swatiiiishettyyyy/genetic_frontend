import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  isAuthenticated,
  getUserData,
  saveUserData,
  saveCsrfToken,
  saveSessionTokens,
  saveLoginMobileNumber,
  clearAuthData,
  UserData,
} from './authStorage'
import { globalHandlers } from './globalHandlers'
import { authService, VerifyOTPResponse } from './authService'
import { memberService, MemberProfile } from './memberService'
import { consumePostLoginRedirect } from './postLoginRedirect'

interface AuthContextValue {
  isLoggedIn: boolean
  authReady: boolean
  user: UserData | null
  currentMember: MemberProfile | null
  members: MemberProfile[]
  isLoginModalOpen: boolean
  isOTPModalOpen: boolean
  mobileNumber: string
  isCompleteProfileModalOpen: boolean
  isAddMemberModalOpen: boolean
  editingMember: MemberProfile | null
  openCompleteProfileModal: () => void
  openLoginModal: () => void
  closeLoginModal: () => void
  openOTPModal: (mobile: string) => void
  closeOTPModal: () => void
  openAddMemberModal: (member?: MemberProfile) => void
  closeAddMemberModal: () => void
  handleVerifySuccess: (response: VerifyOTPResponse, mobile: string) => Promise<void>
  updateUser: (patch: Partial<UserData>) => void
  handleLogout: () => Promise<void>
  handleSelectMember: (memberId: number | string) => Promise<void>
  refreshMembers: () => Promise<void>
  closeCompleteProfileModal: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [authReady, setAuthReady] = useState(false)
  const [user, setUser] = useState<UserData | null>(null)
  const [currentMember, setCurrentMember] = useState<MemberProfile | null>(null)
  const [members, setMembers] = useState<MemberProfile[]>([])
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false)
  const [mobileNumber, setMobileNumber] = useState('')
  const [isCompleteProfileModalOpen, setIsCompleteProfileModalOpen] = useState(false)
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<MemberProfile | null>(null)
  const initialized = useRef(false)

  const loadMemberData = useCallback(async () => {
    try {
      const [currentRes, listRes] = await Promise.allSettled([
        memberService.getCurrentMember(),
        memberService.getMemberList(),
      ])
      if (currentRes.status === 'fulfilled') {
        const data = currentRes.value?.data || currentRes.value?.member || currentRes.value
        setCurrentMember(data || null)
      }
      if (listRes.status === 'fulfilled') {
        const list = listRes.value?.data || listRes.value?.members || []
        setMembers(Array.isArray(list) ? list : [])
      }
    } catch {}
  }, [])

  // Initialize auth state from CSRF token presence on mount
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const init = async () => {
      try {
        if (!isAuthenticated()) return
        const storedUser = getUserData()
        if (!storedUser) return
        setUser(storedUser)
        setIsLoggedIn(true)
        await loadMemberData()
      } finally {
        setAuthReady(true)
      }
    }

    init()
  }, [loadMemberData])

  // Wire global 401 handler
  useEffect(() => {
    globalHandlers.setLogoutHandler(async (skipApiCall = false) => {
      if (!skipApiCall) {
        try { await authService.logout() } catch {}
      }
      clearAuthData()
      setIsLoggedIn(false)
      setUser(null)
      setCurrentMember(null)
      setMembers([])
      setIsLoginModalOpen(true)
    })
  }, [])

  const openLoginModal = useCallback(() => {
    setIsLoginModalOpen(true)
    setIsOTPModalOpen(false)
  }, [])

  const closeLoginModal = useCallback(() => {
    setIsLoginModalOpen(false)
  }, [])

  const openOTPModal = useCallback((mobile: string) => {
    setMobileNumber(mobile)
    setIsLoginModalOpen(false)
    setIsOTPModalOpen(true)
  }, [])

  const closeOTPModal = useCallback(() => {
    setIsOTPModalOpen(false)
  }, [])

  const openAddMemberModal = useCallback((member?: MemberProfile) => {
    setEditingMember(member || null)
    setIsAddMemberModalOpen(true)
  }, [])

  const closeAddMemberModal = useCallback(() => {
    setIsAddMemberModalOpen(false)
    setEditingMember(null)
  }, [])

  const closeCompleteProfileModal = useCallback(() => {
    setIsCompleteProfileModalOpen(false)
  }, [])

  const openCompleteProfileModal = useCallback(() => {
    setIsCompleteProfileModalOpen(true)
  }, [])

  const handleVerifySuccess = useCallback(async (response: VerifyOTPResponse, mobile: string) => {
    // v2: tokens are in HttpOnly cookies — do NOT store them in localStorage
    const csrfToken =
      response.csrf_token ||
      response.csrfToken ||
      response.data?.csrf_token ||
      response.data?.csrfToken

    if (csrfToken) saveCsrfToken(csrfToken)

    const accessToken =
      response.access_token ||
      response.token ||
      response.data?.access_token ||
      response.data?.token
    const refreshToken =
      response.refresh_token ||
      response.refreshToken ||
      response.data?.refresh_token ||
      response.data?.refreshToken
    if (accessToken || refreshToken) saveSessionTokens(accessToken, refreshToken)

    saveLoginMobileNumber(mobile)

    const isNewUser = response.is_new_user ?? response.data?.is_new_user ?? false
    const rawUserId = response.user?.id ?? response.data?.user?.id
    const userData: UserData = {
      id: rawUserId != null ? String(rawUserId) : undefined,
      name: response.user?.name || response.data?.user?.name || '',
      email: '',
      mobileNumber: mobile,
      is_new_user: isNewUser,
    }
    saveUserData(userData)
    setUser(userData)
    setIsLoggedIn(true)
    setIsOTPModalOpen(false)
    setIsLoginModalOpen(false)

    await loadMemberData()

    const redirectTo = consumePostLoginRedirect()
    if (redirectTo) {
      navigate(redirectTo, { replace: true })
    }

    if (isNewUser) {
      setIsCompleteProfileModalOpen(true)
    }
  }, [loadMemberData, navigate])

  const updateUser = useCallback((patch: Partial<UserData>) => {
    setUser(prev => {
      const next = { ...(prev ?? { name: '', email: '' }), ...patch } as UserData
      saveUserData(next)
      return next
    })
  }, [])

  const handleLogout = useCallback(async () => {
    try { await authService.logout() } catch {}
    clearAuthData()
    setIsLoggedIn(false)
    setUser(null)
    setCurrentMember(null)
    setMembers([])
  }, [])

  const handleSelectMember = useCallback(async (memberId: number | string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await memberService.selectMember(memberId) as any
      // v2: backend sets new cookie; only update CSRF if returned
      const newCsrf = response?.csrf_token || response?.csrfToken || response?.data?.csrf_token
      if (newCsrf) saveCsrfToken(newCsrf)

      const numId = typeof memberId === 'string' ? parseInt(memberId, 10) : memberId
      const picked = members.find(m => (m.member_id ?? Number(m.id)) === numId)
      if (picked) {
        const normId = picked.member_id ?? (Number(picked.id) || undefined)
        setCurrentMember({ ...picked, member_id: normId })
      }
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const listRes = await memberService.getMemberList() as any
        const list = listRes?.data || listRes?.members || []
        if (Array.isArray(list)) setMembers(list)
      } catch {}
    } catch (error: unknown) {
      throw error
    }
  }, [members])

  const refreshMembers = useCallback(async () => {
    await loadMemberData()
  }, [loadMemberData])

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      authReady,
      user,
      currentMember,
      members,
      isLoginModalOpen,
      isOTPModalOpen,
      mobileNumber,
      isCompleteProfileModalOpen,
      isAddMemberModalOpen,
      editingMember,
      openCompleteProfileModal,
      openLoginModal,
      closeLoginModal,
      openOTPModal,
      closeOTPModal,
      openAddMemberModal,
      closeAddMemberModal,
      handleVerifySuccess,
      updateUser,
      handleLogout,
      handleSelectMember,
      refreshMembers,
      closeCompleteProfileModal,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

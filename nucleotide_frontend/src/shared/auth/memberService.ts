import { api } from '../api/client'

export interface MemberProfile {
  member_id?: number
  id?: number | string
  name: string
  relation: string
  age?: number
  gender?: string | null
  dob?: string
  mobile?: string
  email?: string
  is_self?: boolean
  avatar?: string | null
}

export interface SaveMemberRequest {
  member_id?: number
  name: string
  relation: string
  age: number
  gender: string
  dob: string
  mobile: string
  email?: string
}

export interface SaveMemberResponse {
  status: 'success' | 'error'
  message?: string
  data?: { member_id?: number; member?: MemberProfile }
}

export interface EditMemberRequest {
  name: string
  relation: string
  age: number
  gender: string
  dob: string
  mobile: string
  email?: string
}

export interface EditMemberResponse {
  status: 'success' | 'error'
  message?: string
  data?: { member_id?: number; member?: MemberProfile }
}

export interface MemberListResponse {
  status: 'success' | 'error'
  message?: string
  data?: MemberProfile[]
  members?: MemberProfile[]
}

export interface DeleteMemberResponse {
  status: 'success' | 'error'
  message?: string
  data?: unknown
}

export interface UploadPhotoResponse {
  status: 'success' | 'error'
  message?: string
  data?: { profile_photo_url?: string; url?: string; photo_url?: string }
}

export interface DeletePhotoResponse {
  status: 'success' | 'error'
  message?: string
  data?: unknown
}

export const getMemberList = async (): Promise<MemberListResponse> => {
  try {
    const response = await api.get<any>('/members/')
    const members = Array.isArray(response) ? response : (response?.data || response?.members || [])
    return { status: 'success', data: members, members }
  } catch (error: any) {
    throw { message: error?.data?.message || 'Failed to fetch members', error: error?.data || error }
  }
}

export const getCurrentMember = async (): Promise<any> => {
  try {
    const response = await api.get<any>('/members/')
    const members = Array.isArray(response) ? response : (response?.data || response?.members || [])
    const selfMember = members.find((m: any) => m.is_self_profile || String(m.relation ?? '').toLowerCase() === 'self') || members[0] || null
    return selfMember
  } catch (error: any) {
    throw { message: error?.data?.message || 'Failed to get current member', error: error?.data || error }
  }
}

export const selectMember = async (memberId: number | string): Promise<any> => {
  try {
    const id = typeof memberId === 'string' ? parseInt(memberId, 10) : memberId
    return await api.post<any>(`/members/select/${id}`, {})
  } catch (error: any) {
    throw { message: error?.data?.message || 'Failed to select member', error: error?.data || error }
  }
}

export const saveMember = async (memberData: SaveMemberRequest): Promise<SaveMemberResponse> => {
  try {
    const response = await api.post<any>('/members/', memberData)
    const member = response?.data || response
    return { status: 'success', data: { member_id: member?.id, member } }
  } catch (error: any) {
    throw { message: error?.data?.detail || error?.data?.message || 'Failed to save member', detail: error?.data?.detail, error: error?.data || error }
  }
}

export const editMember = async (memberId: number, memberData: EditMemberRequest): Promise<EditMemberResponse> => {
  try {
    const response = await api.put<any>(`/members/${memberId}`, memberData)
    return { status: 'success', data: { member: response?.data || response } }
  } catch (error: any) {
    const errData = error?.data || error?.response?.data || error
    throw { message: errData?.detail || errData?.message || 'Failed to edit member', detail: errData?.detail, error: errData }
  }
}

export const deleteMember = async (memberId: number): Promise<DeleteMemberResponse> => {
  try {
    return await api.delete<DeleteMemberResponse>(`/members/${memberId}`)
  } catch (error: any) {
    const errData = error?.data || error?.response?.data || error
    throw { message: errData?.detail || errData?.message || 'Failed to delete member', error: errData }
  }
}

export const uploadPhoto = async (memberId: number | string, file: File): Promise<UploadPhotoResponse> => {
  try {
    const memberIdNum = typeof memberId === 'string' ? parseInt(memberId, 10) : memberId
    const formData = new FormData()
    formData.append('file', file)
    return await api.post<UploadPhotoResponse>(`/members/${memberIdNum}/photo`, formData as unknown)
  } catch (error: any) {
    throw { message: error?.data?.message || 'Failed to upload photo', error: error?.data || error }
  }
}

export const deletePhoto = async (memberId: number | string): Promise<DeletePhotoResponse> => {
  try {
    const memberIdNum = typeof memberId === 'string' ? parseInt(memberId, 10) : memberId
    return await api.delete<DeletePhotoResponse>(`/members/${memberIdNum}/photo`)
  } catch (error: any) {
    throw { message: error?.data?.message || 'Failed to delete photo', error: error?.data || error }
  }
}

export const memberService = { getMemberList, getCurrentMember, selectMember, saveMember, editMember, deleteMember, uploadPhoto, deletePhoto }
export default memberService

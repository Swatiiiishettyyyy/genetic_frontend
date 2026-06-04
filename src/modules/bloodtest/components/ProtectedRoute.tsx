import { Navigate } from 'react-router-dom'
import { useAuth } from '../../../shared/auth/AuthContext'
import { BLOOD_TEST_BASE } from '../utils/routes'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth()
  if (!isLoggedIn) return <Navigate to={BLOOD_TEST_BASE} replace />
  return <>{children}</>
}

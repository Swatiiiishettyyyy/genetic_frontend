import { AddMemberModal } from '../AddMemberModal'
import { CompleteProfileModal } from '../CompleteProfileModal'
import { LoginModal } from '../LoginModal'
import { OTPModal } from '../OTPModal'
import type { Ga4AnalyticsScope } from '../../analytics/ga4CustomEvents'

export default function AuthModalStack({ analyticsScope }: { analyticsScope?: Ga4AnalyticsScope }) {
  return (
    <>
      <LoginModal analyticsScope={analyticsScope} />
      <OTPModal analyticsScope={analyticsScope} />
      <CompleteProfileModal />
      <AddMemberModal analyticsScope={analyticsScope} />
    </>
  )
}

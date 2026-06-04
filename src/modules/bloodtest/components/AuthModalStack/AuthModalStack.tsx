import LoginModal from '../LoginModal/LoginModal'
import OTPModal from '../OTPModal/OTPModal'
import CompleteProfileModal from '../CompleteProfileModal/CompleteProfileModal'
import AddMemberModal from '../AddMemberModal/AddMemberModal'

export default function AuthModalStack() {
  return (
    <>
      <LoginModal />
      <OTPModal />
      <CompleteProfileModal />
      <AddMemberModal />
    </>
  )
}

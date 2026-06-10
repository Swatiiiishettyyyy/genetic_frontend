import { accountNavigation, accountProfile } from "../data/account.js";
import { AccountLayout } from "../components/AccountLayout.jsx";
import { AccountSupportSection } from "../components/AccountSupportSection.jsx";

export function AccountSupportPage({ onMenuClick }) {
  return (
    <AccountLayout activeLabel="Support" navigation={accountNavigation} profile={accountProfile} onMenuClick={onMenuClick}>
      <AccountSupportSection />
    </AccountLayout>
  );
}

import { accountNavigation, accountProfile } from "../data/account.js";
import { AccountDashboardLayout } from "../components/AccountDashboardLayout.jsx";
import { AccountSupportSection } from "../components/AccountSupportSection.jsx";

export function AccountSupportPage({ onMenuClick }) {
  return (
    <AccountDashboardLayout activeLabel="Supports" navigation={accountNavigation} profile={accountProfile} onMenuClick={onMenuClick}>
      <AccountSupportSection />
    </AccountDashboardLayout>
  );
}

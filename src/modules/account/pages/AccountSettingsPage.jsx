import { accountNavigation, accountProfile } from "../data/account.js";
import { AccountDashboardLayout } from "../components/AccountDashboardLayout.jsx";
import { AccountSettingsSection } from "../components/AccountSettingsSection.jsx";

export function AccountSettingsPage({ onMenuClick }) {
  return (
    <AccountDashboardLayout activeLabel="Settings" navigation={accountNavigation} profile={accountProfile} onMenuClick={onMenuClick}>
      <AccountSettingsSection />
    </AccountDashboardLayout>
  );
}

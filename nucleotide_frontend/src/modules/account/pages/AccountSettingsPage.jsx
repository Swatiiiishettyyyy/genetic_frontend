import { accountNavigation, accountProfile } from "../data/account.js";
import { AccountLayout } from "../components/AccountLayout.jsx";
import { AccountSettingsSection } from "../components/AccountSettingsSection.jsx";

export function AccountSettingsPage({ onMenuClick }) {
  return (
    <AccountLayout activeLabel="Settings" navigation={accountNavigation} profile={accountProfile} onMenuClick={onMenuClick}>
      <AccountSettingsSection />
    </AccountLayout>
  );
}

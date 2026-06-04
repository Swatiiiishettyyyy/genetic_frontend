import { accountNavigation, accountProfile, familyMembers, familyOverview } from "../data/account.js";
import { AccountDashboardLayout } from "../components/AccountDashboardLayout.jsx";
import { FamilyProfilesSection } from "../components/FamilyProfilesSection.jsx";

export function AccountFamilyPage({ onMenuClick }) {
  return (
    <AccountDashboardLayout activeLabel="My Family" navigation={accountNavigation} profile={accountProfile} onMenuClick={onMenuClick}>
      <FamilyProfilesSection members={familyMembers} overview={familyOverview} />
    </AccountDashboardLayout>
  );
}

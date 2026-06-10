import { accountNavigation, accountProfile, familyMembers, familyOverview } from "../data/account.js";
import { AccountLayout } from "../components/AccountLayout.jsx";
import { FamilyProfilesSection } from "../components/FamilyProfilesSection.jsx";

export function AccountFamilyPage({ onMenuClick }) {
  return (
    <AccountLayout activeLabel="My Family" navigation={accountNavigation} profile={accountProfile} onMenuClick={onMenuClick}>
      <FamilyProfilesSection members={familyMembers} overview={familyOverview} />
    </AccountLayout>
  );
}

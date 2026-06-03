import { useState } from "react";
import { PageShell } from "../components/ui/PageShell.jsx";
import { accountNavigation, accountProfile, familyMembers, familyOverview } from "../data/account.js";
import { AccountHeader } from "../features/account/components/AccountHeader.jsx";
import { AccountSidebar } from "../features/account/components/AccountSidebar.jsx";
import { FamilyProfilesSection } from "../features/account/components/FamilyProfilesSection.jsx";

export function AccountFamilyPage({ onMenuClick }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <PageShell>
      <AccountHeader profile={accountProfile} onProfileClick={() => setMobileMenuOpen(true)} onMenuClick={onMenuClick} />

      <div className="mx-auto grid w-full max-w-[106.25rem] gap-5 px-[clamp(1rem,4vw,5rem)] pb-[clamp(2rem,5vw,3rem)] lg:-mt-[clamp(3.25rem,5.4vw,6.4375rem)] lg:grid-cols-[clamp(12rem,18.8vw,22.5625rem)_minmax(0,1fr)]">
        <AccountSidebar activeLabel="My Family" navigation={accountNavigation} profile={accountProfile} mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />

        <div className="min-w-0 pt-[clamp(1.5rem,3vw,2.5rem)] lg:mt-[clamp(3rem,4.8vw,4.5rem)]">
          <FamilyProfilesSection members={familyMembers} overview={familyOverview} />
        </div>
      </div>
    </PageShell>
  );
}

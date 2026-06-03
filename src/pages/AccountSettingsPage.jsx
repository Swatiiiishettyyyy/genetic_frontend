import { useState } from "react";
import { PageShell } from "../components/ui/PageShell.jsx";
import { accountNavigation, accountProfile } from "../data/account.js";
import { AccountHeader } from "../features/account/components/AccountHeader.jsx";
import { AccountSettingsSection } from "../features/account/components/AccountSettingsSection.jsx";
import { AccountSidebar } from "../features/account/components/AccountSidebar.jsx";

export function AccountSettingsPage({ onMenuClick }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <PageShell>
      <div className="min-h-screen bg-[#FAFAFF]">
      <AccountHeader profile={accountProfile} onProfileClick={() => setMobileMenuOpen(true)} onMenuClick={onMenuClick} />

      <div className="mx-auto grid w-full max-w-[106.25rem] gap-5 px-[clamp(1rem,4vw,5rem)] pb-[max(3.5rem,env(safe-area-inset-bottom))] lg:-mt-[clamp(3.25rem,5.4vw,6.4375rem)] lg:pb-[clamp(2rem,5vw,3rem)] lg:grid-cols-[clamp(12rem,18.8vw,22.5625rem)_minmax(0,1fr)]">
        <AccountSidebar activeLabel="Settings" navigation={accountNavigation} profile={accountProfile} mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
        <AccountSettingsSection />
      </div>
      </div>
    </PageShell>
  );
}

import { useState } from "react";
import { PageShell } from "../../../shared/components/ui/PageShell.jsx";
import { AccountHeader } from "./AccountHeader.jsx";
import { AccountSidebar } from "./AccountSidebar.jsx";

export function AccountDashboardLayout({ activeLabel, navigation, profile, onMenuClick, children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <PageShell>
      <div className="min-h-screen bg-[#F7F4FF] lg:bg-[#FAFAFF]">
        <AccountHeader
          profile={profile}
          onProfileClick={() => setMobileMenuOpen(true)}
          onMenuClick={onMenuClick}
        />

        <div className="mx-auto w-full max-w-[106.25rem] px-4 pt-4 lg:hidden">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-1.5 font-poppins text-[0.8125rem] font-medium leading-[1.4] text-nucleotide-night transition hover:text-nucleotide-purple focus:outline-none focus:ring-4 focus:ring-nucleotide-purple/15"
          >
            <svg viewBox="0 0 20 20" className="size-4" fill="none" aria-hidden="true">
              <path d="M12.5 4.5 7 10l5.5 5.5M7.5 10H17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Dashboard
          </a>
        </div>

        <div className="mx-auto grid w-full max-w-[106.25rem] gap-5 px-4 pb-[max(3.5rem,env(safe-area-inset-bottom))] pt-4 sm:px-[clamp(1rem,4vw,5rem)] lg:-mt-[clamp(3.25rem,5.4vw,6.4375rem)] lg:grid-cols-[clamp(12rem,18.8vw,22.5625rem)_minmax(0,1fr)] lg:pb-[clamp(2rem,5vw,3rem)] lg:pt-0">
          <AccountSidebar
            activeLabel={activeLabel}
            navigation={navigation}
            profile={profile}
            mobileOpen={mobileMenuOpen}
            onMobileClose={() => setMobileMenuOpen(false)}
          />

          <div className="min-w-0 lg:mt-[clamp(4rem,5.8vw,5.5rem)] lg:pt-[clamp(1.5rem,3vw,2.5rem)]">
            {children}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

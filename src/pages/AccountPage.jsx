import { useState } from "react";
import { PageShell } from "../components/ui/PageShell.jsx";
import { accountNavigation, accountProfile, bloodTestOrders } from "../data/account.js";
import { AccountHeader } from "../features/account/components/AccountHeader.jsx";
import { AccountOrdersEmptyState } from "../features/account/components/AccountOrdersEmptyState.jsx";
import { AccountOrdersList } from "../features/account/components/AccountOrdersList.jsx";
import { AccountSidebar } from "../features/account/components/AccountSidebar.jsx";
import { PersonalInformationSection } from "../features/account/components/PersonalInformationSection.jsx";

const isBloodTests = window.location.pathname === "/account/blood-tests";

export function AccountPage({ onMenuClick }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pageSurfaceClass =
    "min-h-screen bg-[linear-gradient(180deg,#F6F3FF_0%,#FBFAFF_20rem,#FFFFFF_50rem)] lg:bg-white";

  return (
    <PageShell>
      <div className={pageSurfaceClass}>
      <AccountHeader profile={accountProfile} onProfileClick={() => setMobileMenuOpen(true)} onMenuClick={onMenuClick} />

      <div className="mx-auto grid w-full max-w-[106.25rem] gap-5 px-[clamp(1rem,4vw,5rem)] pb-[max(2rem,env(safe-area-inset-bottom))] lg:-mt-[clamp(3.25rem,5.4vw,6.4375rem)] lg:pb-[clamp(2rem,5vw,3rem)] lg:grid-cols-[clamp(12rem,18.8vw,22.5625rem)_minmax(0,1fr)]">
        <AccountSidebar
          activeLabel={isBloodTests ? "Blood Tests" : "Personal Information"}
          navigation={accountNavigation}
          profile={accountProfile}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />

        {isBloodTests ? (
          bloodTestOrders.length > 0 ? (
            <AccountOrdersList orders={bloodTestOrders} />
          ) : (
            <AccountOrdersEmptyState />
          )
        ) : (
          <PersonalInformationSection profile={accountProfile} />
        )}
      </div>
      </div>
    </PageShell>
  );
}

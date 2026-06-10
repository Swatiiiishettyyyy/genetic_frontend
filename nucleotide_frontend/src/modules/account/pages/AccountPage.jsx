import { accountNavigation, accountProfile, bloodTestOrders } from "../data/account.js";
import { AccountLayout } from "../components/AccountLayout.jsx";
import { AccountOrdersEmptyState } from "../components/AccountOrdersEmptyState.jsx";
import { AccountOrdersList } from "../components/AccountOrdersList.jsx";
import { PersonalInformationSection } from "../components/PersonalInformationSection.jsx";
import { MobileAccountHome } from "../components/MobileAccountHome.jsx";

export function AccountPage({ onMenuClick }) {
  const path = typeof window === "undefined" ? "/account" : window.location.pathname;
  const isBloodTests = path === "/account/blood-tests";
  const isAccountHome = path === "/account";

  if (isAccountHome) {
    return (
      <>
        {/* Mobile: Figma home screen */}
        <MobileAccountHome profile={accountProfile} onMenuClick={onMenuClick} />

        {/* Desktop: existing dashboard layout */}
        <div className="hidden lg:block">
          <AccountLayout
            activeLabel="Personal Information"
            navigation={accountNavigation}
            profile={accountProfile}
            onMenuClick={onMenuClick}
          >
            <PersonalInformationSection profile={accountProfile} />
          </AccountLayout>
        </div>
      </>
    );
  }

  return (
    <AccountLayout
      activeLabel={isBloodTests ? "Blood Tests" : "Personal Information"}
      navigation={accountNavigation}
      profile={accountProfile}
      onMenuClick={onMenuClick}
    >
      {isBloodTests ? (
        bloodTestOrders.length > 0 ? (
          <AccountOrdersList orders={bloodTestOrders} />
        ) : (
          <AccountOrdersEmptyState />
        )
      ) : (
        <PersonalInformationSection profile={accountProfile} />
      )}
    </AccountLayout>
  );
}

import { accountNavigation, accountProfile, bloodTestOrders } from "../data/account.js";
import { AccountDashboardLayout } from "../components/AccountDashboardLayout.jsx";
import { AccountOrdersEmptyState } from "../components/AccountOrdersEmptyState.jsx";
import { AccountOrdersList } from "../components/AccountOrdersList.jsx";
import { PersonalInformationSection } from "../components/PersonalInformationSection.jsx";
import { MobileAccountHome } from "../components/MobileAccountHome.jsx";

const isBloodTests = window.location.pathname === "/account/blood-tests";
const isAccountHome = window.location.pathname === "/account";

export function AccountPage({ onMenuClick }) {
  if (isAccountHome) {
    return (
      <>
        {/* Mobile: Figma home screen */}
        <MobileAccountHome profile={accountProfile} onMenuClick={onMenuClick} />

        {/* Desktop: existing dashboard layout */}
        <div className="hidden lg:block">
          <AccountDashboardLayout
            activeLabel="Personal Information"
            navigation={accountNavigation}
            profile={accountProfile}
            onMenuClick={onMenuClick}
          >
            <PersonalInformationSection profile={accountProfile} />
          </AccountDashboardLayout>
        </div>
      </>
    );
  }

  return (
    <AccountDashboardLayout
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
    </AccountDashboardLayout>
  );
}

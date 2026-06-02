import { PageShell } from "../components/ui/PageShell.jsx";
import { accountNavigation, accountProfile, bloodTestOrders } from "../data/account.js";
import { AccountHeader } from "../features/account/components/AccountHeader.jsx";
import { AccountOrdersEmptyState } from "../features/account/components/AccountOrdersEmptyState.jsx";
import { AccountOrdersList } from "../features/account/components/AccountOrdersList.jsx";
import { AccountSidebar } from "../features/account/components/AccountSidebar.jsx";

export function AccountPage() {
  return (
    <PageShell>
      <AccountHeader profile={accountProfile} />

      <div className="mx-auto -mt-[clamp(3.25rem,5.4vw,6.4375rem)] grid w-full max-w-[106.25rem] gap-5 px-[clamp(1rem,4vw,5rem)] pb-[clamp(2rem,5vw,3rem)] lg:grid-cols-[clamp(12rem,18.8vw,22.5625rem)_minmax(0,1fr)]">
        <AccountSidebar activeLabel="Blood Tests" navigation={accountNavigation} profile={accountProfile} />

        {bloodTestOrders.length > 0 ? (
          <AccountOrdersList orders={bloodTestOrders} />
        ) : (
          <AccountOrdersEmptyState />
        )}
      </div>
    </PageShell>
  );
}

import { useState } from "react";
import { PageShell } from "../components/ui/PageShell.jsx";
import { accountAddresses, accountNavigation, accountProfile } from "../data/account.js";
import { AccountHeader } from "../features/account/components/AccountHeader.jsx";
import { AccountSidebar } from "../features/account/components/AccountSidebar.jsx";
import { AddAddressModal } from "../features/account/components/AddAddressModal.jsx";
import { AddressEmptyState } from "../features/account/components/AddressEmptyState.jsx";
import { AddressSelectionSection } from "../features/account/components/AddressSelectionSection.jsx";

export function AccountAddressPage() {
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [hasConfirmedLocation, setHasConfirmedLocation] = useState(false);

  function handleConfirmLocation() {
    setHasConfirmedLocation(true);
    setIsAddingAddress(false);
  }

  return (
    <PageShell>
      <AccountHeader profile={accountProfile} />

      <div className="mx-auto -mt-[clamp(3.25rem,5.4vw,6.4375rem)] grid w-full max-w-[106.25rem] gap-5 px-[clamp(1rem,4vw,5rem)] pb-[clamp(2rem,5vw,3rem)] lg:grid-cols-[clamp(12rem,18.8vw,22.5625rem)_minmax(0,1fr)]">
        <AccountSidebar activeLabel="Address" navigation={accountNavigation} profile={accountProfile} />

        {accountAddresses.length === 0 && !hasConfirmedLocation && (
          <AddressEmptyState onAddAddress={() => setIsAddingAddress(true)} />
        )}

        {hasConfirmedLocation && <AddressSelectionSection onAddAddress={() => setIsAddingAddress(true)} />}
      </div>

      {isAddingAddress && (
        <AddAddressModal onClose={() => setIsAddingAddress(false)} onConfirm={handleConfirmLocation} />
      )}
    </PageShell>
  );
}

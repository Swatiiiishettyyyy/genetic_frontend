import { useState } from "react";
import { accountAddresses, accountNavigation, accountProfile } from "../data/account.js";
import { AccountDashboardLayout } from "../components/AccountDashboardLayout.jsx";
import { AddAddressModal } from "../components/AddAddressModal.jsx";
import { AddressEmptyState } from "../components/AddressEmptyState.jsx";
import { AddressSelectionSection } from "../components/AddressSelectionSection.jsx";

export function AccountAddressPage({ onMenuClick }) {
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [hasConfirmedLocation, setHasConfirmedLocation] = useState(false);

  function handleConfirmLocation() {
    setHasConfirmedLocation(true);
    setIsAddingAddress(false);
  }

  return (
    <AccountDashboardLayout activeLabel="Address" navigation={accountNavigation} profile={accountProfile} onMenuClick={onMenuClick}>
      {accountAddresses.length === 0 && !hasConfirmedLocation && (
        <AddressEmptyState onAddAddress={() => setIsAddingAddress(true)} />
      )}

      {isAddingAddress && (
        <AddAddressModal onClose={() => setIsAddingAddress(false)} onConfirm={handleConfirmLocation} />
      )}

      {hasConfirmedLocation && <AddressSelectionSection onAddAddress={() => setIsAddingAddress(true)} />}
    </AccountDashboardLayout>
  );
}

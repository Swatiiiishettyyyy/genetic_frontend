import { useState } from "react";
import { AccountPage } from "./pages/AccountPage.jsx";
import { AccountAddressPage } from "./pages/AccountAddressPage.jsx";
import { AccountFamilyPage } from "./pages/AccountFamilyPage.jsx";
import { AccountSettingsPage } from "./pages/AccountSettingsPage.jsx";
import { AccountSupportPage } from "./pages/AccountSupportPage.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { GeneticTestingPage } from "./pages/GeneticTestingPage.jsx";
import { LoginSignupPage } from "./pages/LoginSignupPage.jsx";
import { OtpVerificationPage } from "./pages/OtpVerificationPage.jsx";
import { AppSidebar } from "./features/account/components/AppSidebar.jsx";

export default function App() {
  const path = window.location.pathname;
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem("nucleotide_auth") === "true"
  );
  const [menuOpen, setMenuOpen] = useState(false);

  const openMenu = () => setMenuOpen(true);
  const closeMenu = () => setMenuOpen(false);
  const handleLoggedOut = () => {
    setIsLoggedIn(false);
    setMenuOpen(false);
    window.location.assign("/");
  };

  const sidebar = (
    <AppSidebar
      isOpen={menuOpen}
      onClose={closeMenu}
      isLoggedIn={isLoggedIn}
      onLoggedOut={handleLoggedOut}
    />
  );

  if (path === "/account" || path === "/account/blood-tests") {
    return <><AccountPage onMenuClick={openMenu} />{sidebar}</>;
  }

  if (path === "/account/family") {
    return <><AccountFamilyPage onMenuClick={openMenu} />{sidebar}</>;
  }

  if (path === "/account/address") {
    return <><AccountAddressPage onMenuClick={openMenu} />{sidebar}</>;
  }

  if (path === "/account/settings") {
    return <><AccountSettingsPage onMenuClick={openMenu} />{sidebar}</>;
  }

  if (path === "/account/support") {
    return <><AccountSupportPage onMenuClick={openMenu} />{sidebar}</>;
  }

  if (path === "/login" || path === "/login-signup") {
    return <LoginSignupPage />;
  }

  if (path === "/otp" || path === "/otp-verification") {
    return <OtpVerificationPage />;
  }

  if (path.startsWith("/genetic-tests")) {
    return <><GeneticTestingPage onMenuClick={openMenu} />{sidebar}</>;
  }

  return <><DashboardPage onMenuClick={openMenu} />{sidebar}</>;
}

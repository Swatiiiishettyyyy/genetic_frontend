import { AccountPage } from "./pages/AccountPage.jsx";
import { AccountAddressPage } from "./pages/AccountAddressPage.jsx";
import { AccountFamilyPage } from "./pages/AccountFamilyPage.jsx";
import { AccountSettingsPage } from "./pages/AccountSettingsPage.jsx";
import { AccountSupportPage } from "./pages/AccountSupportPage.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { GeneticTestingPage } from "./pages/GeneticTestingPage.jsx";
import { LoginSignupPage } from "./pages/LoginSignupPage.jsx";
import { OtpVerificationPage } from "./pages/OtpVerificationPage.jsx";

export default function App() {
  const path = window.location.pathname;

  if (path === "/account" || path === "/account/blood-tests") {
    return <AccountPage />;
  }

  if (path === "/account/family") {
    return <AccountFamilyPage />;
  }

  if (path === "/account/address") {
    return <AccountAddressPage />;
  }

  if (path === "/account/settings") {
    return <AccountSettingsPage />;
  }

  if (path === "/account/support") {
    return <AccountSupportPage />;
  }

  if (path === "/login" || path === "/login-signup") {
    return <LoginSignupPage />;
  }

  if (path === "/otp" || path === "/otp-verification") {
    return <OtpVerificationPage />;
  }

  if (path.startsWith("/genetic-tests")) {
    return <GeneticTestingPage />;
  }

  return <DashboardPage />;
}

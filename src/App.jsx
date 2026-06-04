import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AccountPage } from "./modules/account/pages/AccountPage.jsx";
import { AccountAddressPage } from "./modules/account/pages/AccountAddressPage.jsx";
import { AccountFamilyPage } from "./modules/account/pages/AccountFamilyPage.jsx";
import { AccountSettingsPage } from "./modules/account/pages/AccountSettingsPage.jsx";
import { AccountSupportPage } from "./modules/account/pages/AccountSupportPage.jsx";
import { DashboardPage } from "./modules/dashboard/pages/DashboardPage.jsx";
import { GeneticTestingPage } from "./modules/genetictest/pages/GeneticTestingPage.jsx";
import LandingPage from "./modules/landing/LandingPage.jsx";
import { AppSidebar } from "./modules/account/components/AppSidebar.jsx";
import BloodTestRoutes from "./modules/bloodtest/BloodTestRoutes";
import { AuthProvider as BloodTestAuthProvider } from "./shared/auth/AuthContext";
import { useAuth } from "./shared/auth/AuthContext";
import { AuthModalStack } from "./modules/bloodtest/components/AuthModalStack";
import { Footer } from "./shared/components/Footer";

const bloodTestLegacyPaths = new Set([
  "/cart",
  "/address",
  "/timeslot",
  "/payment",
  "/confirmation",
  "/orders",
  "/order-details",
  "/report",
  "/reports",
  "/empty-report",
  "/compare-reports",
  "/packages",
  "/metrics",
  "/privacy-policy",
  "/terms",
  "/refund-policy",
  "/contact-us",
  "/faq",
]);

function shouldRenderBloodTestRoutes(path) {
  return (
    path === "/index.html" ||
    path === "/blood-test" ||
    path.startsWith("/blood-test/") ||
    path === "/upcoming" ||
    path.startsWith("/upcoming/") ||
    path === "/genetics" ||
    path.startsWith("/genetics/") ||
    path === "/genetic-tests/cart" ||
    path === "/genetic-tests/address" ||
    path === "/genetic-tests/timeslot" ||
    path === "/genetic-tests/payment" ||
    path === "/genetic-tests/confirmation" ||
    path.startsWith("/vitals/") ||
    path.startsWith("/comprehensive/") ||
    path.startsWith("/women-health") ||
    path.startsWith("/men-health") ||
    path.startsWith("/metrics/") ||
    bloodTestLegacyPaths.has(path)
  );
}

export default function App() {
  const { pathname: path } = useLocation();
  if (path === "/" || path === "/index.html") {
    return (
      <BloodTestAuthProvider>
        <AuthModalStack />
        <LandingPage />
      </BloodTestAuthProvider>
    );
  }

  if (shouldRenderBloodTestRoutes(path)) {
    return (
      <BloodTestAuthProvider>
        <BloodTestRoutes />
      </BloodTestAuthProvider>
    );
  }

  return (
    <BloodTestAuthProvider>
      <AuthModalStack />
      <NucleotideApp path={path} />
    </BloodTestAuthProvider>
  );
}

function NucleotideApp({ path }) {
  const { isLoggedIn, handleLogout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const openMenu = () => setMenuOpen(true);
  const closeMenu = () => setMenuOpen(false);
  const handleLoggedOut = async () => {
    await handleLogout();
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
  const withSharedFooter = (page) => (
    <>
      {page}
      <Footer />
      {sidebar}
    </>
  );

  if (path === "/account" || path === "/account/blood-tests") {
    return withSharedFooter(<AccountPage onMenuClick={openMenu} />);
  }

  if (path === "/account/family") {
    return withSharedFooter(<AccountFamilyPage onMenuClick={openMenu} />);
  }

  if (path === "/account/address") {
    return withSharedFooter(<AccountAddressPage onMenuClick={openMenu} />);
  }

  if (path === "/account/settings") {
    return withSharedFooter(<AccountSettingsPage onMenuClick={openMenu} />);
  }

  if (path === "/account/support") {
    return withSharedFooter(<AccountSupportPage onMenuClick={openMenu} />);
  }

  if (path === "/login" || path === "/login-signup" || path === "/otp" || path === "/otp-verification") {
    return withSharedFooter(<SharedLoginLauncher onMenuClick={openMenu} />);
  }

  if (path.startsWith("/genetic-tests")) {
    return withSharedFooter(<GeneticTestingPage onMenuClick={openMenu} />);
  }

  return withSharedFooter(<DashboardPage onMenuClick={openMenu} />);
}

function SharedLoginLauncher({ onMenuClick }) {
  const { openLoginModal } = useAuth();

  useEffect(() => {
    openLoginModal();
  }, [openLoginModal]);

  return <div className="min-h-screen bg-white" />;
}

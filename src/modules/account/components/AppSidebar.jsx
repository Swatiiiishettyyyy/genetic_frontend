import { useEffect, useRef, useState } from "react";
import { accountProfile } from "../data/account.js";
import { dashboardIcons } from "../../../shared/assets/dashboardIcons.js";
import { Avatar } from "../../../shared/components/ui/Avatar.jsx";
import { cn } from "../../../lib/cn.js";
import { LogoutModal } from "./LogoutModal.jsx";
import { SharedSidebarCloseButton, SharedSidebarShell } from "../../../shared/components/SharedSidebarShell.jsx";
import { useAuth } from "../../../shared/auth/AuthContext";
import { savePostLoginRedirect } from "../../../shared/auth/postLoginRedirect";

const familyProfiles = [
  { initials: "SD", name: "Snigdha Dash", relation: "Self", active: true },
  { initials: "RD", name: "Rohit", relation: "Brother", active: false },
  { initials: "AD", name: "Arav", relation: "Father", active: false },
];

const bloodTestNavigation = {
  title: "Blood Tests",
  items: [
    { label: "Tests", href: "/blood-test/tests", icon: dashboardIcons.bloodTest },
    { label: "Packages", href: "/blood-test/packages", icon: dashboardIcons.bloodTest },
  ],
};

const geneticTestNavigation = { label: "Genetic Tests", href: "/genetic-tests", icon: dashboardIcons.geneticTest };

const settingsNavigation = { label: "Settings", href: "/account/settings", icon: dashboardIcons.settings };
const supportNavigation = { label: "Support", href: "/account/support", icon: dashboardIcons.support };
const accountProfileNavigation = { label: "My Profile", href: "/account", icon: dashboardIcons.person };
const myOrdersNavigation = { label: "My Orders", href: "/account", icon: dashboardIcons.calendar };
const myReportsNavigation = { label: "My Reports", href: "/account", icon: dashboardIcons.bloodTest };

const loggedInNavigation = [
  bloodTestNavigation,
].filter(Boolean);

const guestNavigation = [
  bloodTestNavigation,
];

const loggedInDirectNavigation = [
  geneticTestNavigation,
  accountProfileNavigation,
  myOrdersNavigation,
  myReportsNavigation,
  settingsNavigation,
  supportNavigation,
];
const guestDirectNavigation = [geneticTestNavigation, settingsNavigation, supportNavigation];
const exactMatchHrefs = new Set(["/account"]);

function getCurrentPath() {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname || "/"}${window.location.hash || ""}`;
}

function normalizeHref(href) {
  if (!href) return href;
  if (href === "/blood-test") return "/blood-test/tests";
  return href.split(/[?#]/)[0] || href;
}

function isActiveNavItem(item, currentPath) {
  const href = normalizeHref(item.href);
  const pathOnly = currentPath.split("#")[0];

  if (href === "/blood-test/tests") {
    return (
      pathOnly === "/" ||
      pathOnly === "/blood-test" ||
      pathOnly === "/blood-test/tests" ||
      pathOnly === "/tests"
    );
  }

  if (href === "/blood-test/orders") {
    return pathOnly.startsWith("/blood-test/order") || pathOnly.startsWith("/order");
  }

  if (item.href === "/genetic-tests#orders") {
    return currentPath === "/genetic-tests#orders";
  }

  if (item.href === "/genetic-tests#reports") {
    return currentPath === "/genetic-tests#reports";
  }

  if (href === "/blood-test/reports") {
    return (
      pathOnly.startsWith("/blood-test/report") ||
      pathOnly.startsWith("/blood-test/compare-report") ||
      pathOnly.startsWith("/report") ||
      pathOnly.startsWith("/compare-report")
    );
  }

  if (exactMatchHrefs.has(href)) {
    return pathOnly === href;
  }

  return pathOnly === href || pathOnly.startsWith(`${href}/`);
}

function sectionHasActiveItem(items, currentPath) {
  return items.some((item) => isActiveNavItem(item, currentPath));
}

function CloseButton({ onClick }) {
  return <SharedSidebarCloseButton onClick={onClick} ariaLabel="Close menu" />;
}

function NavItem({ item, onClose, isActive = false }) {
  return (
    <a
      href={item.href}
      onClick={onClose}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "grid min-h-[3rem] grid-cols-[minmax(0,1fr)] items-center rounded-[0.75rem] px-3 py-2 font-poppins text-[0.96875rem] font-medium leading-[1.35] transition focus:outline-none focus:ring-2 focus:ring-nucleotide-purple/15",
        isActive
          ? "bg-nucleotide-purple/10 text-nucleotide-purple"
          : "text-nucleotide-ink hover:bg-white/65 hover:text-nucleotide-purple"
      )}
    >
      <span className="truncate">{item.label}</span>
    </a>
  );
}

function DirectNavItem({ item, onClose, currentPath }) {
  return (
    <a
      href={item.href}
      onClick={onClose}
      aria-current={isActiveNavItem(item, currentPath) ? "page" : undefined}
      className={cn(
        "grid min-h-[3rem] grid-cols-[minmax(0,1fr)] items-center rounded-[0.75rem] px-3 py-2 font-poppins text-[1rem] font-medium leading-[1.35] transition focus:outline-none focus:ring-2 focus:ring-nucleotide-purple/15",
        isActiveNavItem(item, currentPath)
          ? "bg-nucleotide-purple/10 text-nucleotide-purple"
          : "text-nucleotide-ink hover:bg-white/65 hover:text-nucleotide-purple"
      )}
    >
      <span className="truncate">{item.label}</span>
    </a>
  );
}

function AccordionSection({ title, items, onClose, currentPath, openSection, setOpenSection }) {
  const open = openSection === title;
  return (
    <div className="rounded-[0.875rem] transition">
      <button
        type="button"
        onClick={() => setOpenSection((current) => (current === title ? "" : title))}
        className="grid min-h-[3rem] w-full grid-cols-[minmax(0,1fr)_1.25rem] items-center gap-3 rounded-[0.75rem] px-3 py-2 text-left transition hover:bg-white/55 focus:outline-none focus:ring-2 focus:ring-nucleotide-purple/15"
        aria-expanded={open}
      >
        <span className="truncate font-poppins text-[1rem] font-medium leading-[1.35] text-nucleotide-ink">{title}</span>
        <svg
          viewBox="0 0 20 20"
          className={cn("size-4.5 shrink-0 text-nucleotide-muted transition-transform duration-200", open && "rotate-180")}
          fill="none"
        >
          <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="space-y-1 px-2 pb-1.5 pt-1">
          {items.map((item) => (
            <NavItem
              key={item.label}
              item={item}
              onClose={onClose}
              isActive={isActiveNavItem(item, currentPath)}
            />
          ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function GuestView({ onClose }) {
  const { openLoginModal } = useAuth();
  const currentPath = getCurrentPath();
  const [openSection, setOpenSection] = useState(() => {
    const activeSection = guestNavigation.find((section) => sectionHasActiveItem(section.items, currentPath));
    return activeSection?.title || "";
  });
  const handleSignUpClick = (event) => {
    event.preventDefault();
    savePostLoginRedirect(`${window.location.pathname}${window.location.search}${window.location.hash}`);
    onClose();
    openLoginModal();
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-nucleotide-lavender/40 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-nucleotide-lavender font-poppins text-[1rem] font-medium text-nucleotide-purple">
            G
          </div>
          <div>
            <p className="font-poppins text-[1.0625rem] font-medium leading-[1.3] text-nucleotide-ink">Hi Guest</p>
          </div>
        </div>
        <CloseButton onClick={onClose} />
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-2 overflow-y-auto px-5 py-5" aria-label="Guest navigation">
        {guestNavigation.map((section) => (
          <AccordionSection
            key={section.title}
            title={section.title}
            items={section.items}
            onClose={onClose}
            currentPath={currentPath}
            openSection={openSection}
            setOpenSection={setOpenSection}
          />
        ))}
        <div className="space-y-1 pt-1">
          {guestDirectNavigation.map((item) => (
            <DirectNavItem key={item.label} item={item} onClose={onClose} currentPath={currentPath} />
          ))}
        </div>
      </nav>

      {/* Footer CTA */}
      <div className="border-t border-nucleotide-lavender/40 px-5 py-5">
        <a
          href="/login"
          onClick={handleSignUpClick}
          className="flex min-h-12 w-full items-center justify-center rounded-full bg-nucleotide-purple px-4 font-poppins text-[1rem] font-medium text-white shadow-[0_2px_14px_rgba(139,92,246,0.35)] transition hover:bg-[#7447e8]"
        >
          Sign Up
        </a>
      </div>
    </>
  );
}

function LoggedInView({ onClose, onLoggedOut }) {
  const [showSwitch, setShowSwitch] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const currentPath = getCurrentPath();
  const [openSection, setOpenSection] = useState(() => {
    const activeSection = loggedInNavigation.find((section) => sectionHasActiveItem(section.items, currentPath));
    return activeSection?.title || "";
  });
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!showSwitch) return;
    function handleOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowSwitch(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [showSwitch]);

  return (
    <>
      {/* Profile header */}
      <div className="relative border-b border-nucleotide-lavender/40 px-5 py-5" ref={dropdownRef}>
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setShowSwitch((v) => !v)}
            aria-expanded={showSwitch}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-[10px] text-left transition hover:opacity-80"
          >
            <Avatar initials={accountProfile.initials} size="sm" className="size-11 shrink-0 text-[1rem]" />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="truncate font-poppins text-[1.0625rem] font-medium text-nucleotide-ink">
                  {accountProfile.name}
                </span>
                <img
                  src={dashboardIcons.chevronDown}
                  alt=""
                  className={cn("h-2 w-3 shrink-0 transition-transform duration-200", showSwitch && "rotate-180")}
                />
              </span>
              <span className="font-poppins text-[0.9375rem] font-medium text-nucleotide-purple">
                {accountProfile.relation}
              </span>
            </span>
          </button>
          <CloseButton onClick={onClose} />
        </div>

        {/* Profile switcher dropdown */}
        {showSwitch && (
          <div
            className="absolute left-5 right-5 top-[calc(100%+0.5rem)] z-50 rounded-[14px] border border-nucleotide-lavender bg-white px-3 py-3"
            style={{ boxShadow: "0 1rem 2.5rem rgba(136,107,249,0.16)" }}
          >
            <p className="mb-2 px-1 font-poppins text-[0.9375rem] font-medium text-nucleotide-ink">Switch Profile</p>
            <div className="flex flex-col gap-0.5">
              {familyProfiles.map((member) => (
                <button
                  key={member.name + member.relation}
                  onClick={() => setShowSwitch(false)}
                  className="flex min-h-[3rem] w-full items-center justify-between gap-3 rounded-[10px] px-1.5 py-1.5 text-left transition hover:bg-nucleotide-lavender/30"
                >
                  <div className="flex items-center gap-3">
                    <Avatar initials={member.initials} size="xs" className="size-9 shrink-0 text-[0.8125rem]" />
                    <div>
                      <p className="font-poppins text-[0.875rem] font-medium leading-[1.25] text-nucleotide-ink">{member.name}</p>
                      <p className="font-poppins text-[0.75rem] font-medium leading-[1.25] text-nucleotide-purple">{member.relation}</p>
                    </div>
                  </div>
                  {member.active && (
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="shrink-0 text-nucleotide-purple">
                      <path d="M4 10.5L8.5 15L16 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
            <div className="my-2 h-px bg-nucleotide-lavender/40" />
            <button
              onClick={() => setShowSwitch(false)}
              className="flex min-h-[2.75rem] w-full items-center gap-3 rounded-[10px] px-1.5 py-1.5 text-left transition hover:bg-nucleotide-lavender/30"
            >
              <div className="grid size-9 shrink-0 place-items-center rounded-full border border-dashed border-[rgba(136,107,249,0.5)]">
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none" className="text-nucleotide-purple">
                  <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                  </svg>
              </div>
              <span className="font-poppins text-[0.875rem] font-medium text-nucleotide-ink">Add Family Member</span>
            </button>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-2 overflow-y-auto px-5 py-5" aria-label="Account navigation">
        {loggedInNavigation.map((section) => (
          <AccordionSection
            key={section.title}
            title={section.title}
            items={section.items}
            onClose={onClose}
            currentPath={currentPath}
            openSection={openSection}
            setOpenSection={setOpenSection}
          />
        ))}
        <div className="space-y-1 pt-1">
          {loggedInDirectNavigation.map((item) => (
            <DirectNavItem key={item.label} item={item} onClose={onClose} currentPath={currentPath} />
          ))}
        </div>
      </nav>

      {/* Logout */}
      <div className="border-t border-nucleotide-lavender/40 px-5 py-5">
        <button
          type="button"
          onClick={() => setShowLogout(true)}
          className="flex min-h-11 items-center rounded-[0.875rem] px-3 font-poppins text-[1rem] text-nucleotide-muted transition hover:bg-nucleotide-lavender/30 hover:text-nucleotide-ink focus:outline-none focus:ring-4 focus:ring-nucleotide-purple/15"
        >
          Logout
        </button>
      </div>

      {showLogout && (
        <LogoutModal
          onClose={() => setShowLogout(false)}
          onLoggedOut={() => {
            setShowLogout(false);
            onLoggedOut();
          }}
        />
      )}
    </>
  );
}

export function AppSidebar({ isOpen, onClose, isLoggedIn, onLoggedOut }) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <SharedSidebarShell isOpen={isOpen} onClose={onClose}>
      {isLoggedIn
        ? <LoggedInView onClose={onClose} onLoggedOut={onLoggedOut} />
        : <GuestView onClose={onClose} />
      }
    </SharedSidebarShell>
  );
}

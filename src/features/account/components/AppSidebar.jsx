import { useEffect, useRef, useState } from "react";
import { accountNavigation, accountProfile } from "../../../data/account.js";
import { dashboardIcons } from "../../../assets/dashboardIcons.js";
import { welcomeDashboardIcons } from "../../../assets/welcomeDashboardIcons.js";
import { Avatar } from "../../../components/ui/Avatar.jsx";
import { cn } from "../../../lib/cn.js";
import { LogoutModal } from "./LogoutModal.jsx";

const familyProfiles = [
  { initials: "SD", name: "Snigdha Dash", relation: "Self", active: true },
  { initials: "RD", name: "Rohit", relation: "Brother", active: false },
  { initials: "AD", name: "Arav", relation: "Father", active: false },
];

const guestProducts = [
  { label: "Genetics", href: "/genetic-tests", icon: dashboardIcons.geneticTest },
  { label: "Blood Tests", href: "/account/blood-tests", icon: dashboardIcons.bloodTest },
  { label: "Gut Health", href: "/gut", icon: welcomeDashboardIcons.gut },
];

const loggedInOrders = [
  { label: "Blood Tests", href: "/account/blood-tests", icon: dashboardIcons.bloodTest },
  { label: "Genetic Tests", href: "/genetic-tests", icon: dashboardIcons.geneticTest },
];

const guestStaticLinks = [
  { label: "Settings", href: "/account/settings", icon: dashboardIcons.settings },
  { label: "Support", href: "/account/support", icon: dashboardIcons.support },
];

const profileNavigation = accountNavigation.find((section) => section.title === "Profile");
const reportsNavigation = accountNavigation.find((section) => section.title === "My Reports");
const addressNavigation = accountNavigation
  .find((section) => section.title === "Account")
  ?.items.find((item) => item.label === "Address");

const loggedInNavigation = [
  { title: "Products", items: guestProducts },
  profileNavigation && {
    ...profileNavigation,
    items: [...profileNavigation.items, addressNavigation].filter(Boolean),
  },
  reportsNavigation,
  { title: "My Orders", items: loggedInOrders },
].filter(Boolean);

function CloseButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="grid size-10 shrink-0 place-items-center rounded-[0.875rem] bg-nucleotide-lavender/35 text-nucleotide-ink transition hover:bg-nucleotide-lavender/60 focus:outline-none focus:ring-4 focus:ring-nucleotide-purple/15"
      aria-label="Close menu"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  );
}

function NavItem({ item, onClose }) {
  return (
    <a
      href={item.href}
      onClick={onClose}
      className="grid min-h-[3.25rem] grid-cols-[2.25rem_minmax(0,1fr)] items-center gap-3.5 rounded-[0.875rem] px-2.5 py-2.5 font-poppins text-[1rem] font-medium leading-[1.35] text-nucleotide-ink transition hover:bg-nucleotide-lavender/50 focus:outline-none focus:ring-4 focus:ring-nucleotide-purple/15"
    >
      <span className="grid size-9 place-items-center rounded-full bg-nucleotide-lavender/60">
        {item.icon && (
          <img src={item.icon} alt="" className="size-[1.15rem] object-contain" />
        )}
      </span>
      <span className="truncate">{item.label}</span>
    </a>
  );
}

function TopLevelLink({ item, onClose }) {
  return (
    <a
      href={item.href}
      onClick={onClose}
      className="grid min-h-[3.25rem] grid-cols-[minmax(0,1fr)] items-center rounded-[0.875rem] px-3 py-2.5 font-poppins text-[1.03125rem] font-medium leading-[1.35] text-nucleotide-ink transition hover:bg-nucleotide-lavender/40 focus:outline-none focus:ring-4 focus:ring-nucleotide-purple/15"
    >
      <span className="truncate">{item.label}</span>
    </a>
  );
}

function AccordionSection({ title, items, onClose }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="grid min-h-[3.25rem] w-full grid-cols-[minmax(0,1fr)_1.25rem] items-center gap-3 rounded-[0.875rem] px-3 py-2.5 text-left transition hover:bg-nucleotide-lavender/40 focus:outline-none focus:ring-4 focus:ring-nucleotide-purple/15"
        aria-expanded={open}
      >
        <span className="truncate font-poppins text-[1.03125rem] font-medium leading-[1.35] text-nucleotide-ink">{title}</span>
        <svg
          viewBox="0 0 20 20"
          className={cn("size-4.5 shrink-0 text-nucleotide-muted transition-transform duration-200", open && "rotate-180")}
          fill="none"
        >
          <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="mt-1.5 space-y-1.5 pl-2">
          {items.map((item) => (
            <NavItem key={item.label} item={item} onClose={onClose} />
          ))}
        </div>
      )}
    </div>
  );
}

function GuestView({ onClose }) {
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
        <AccordionSection title="Products" items={guestProducts} onClose={onClose} />

        <div className="space-y-2 pt-1">
          {guestStaticLinks.map((item) => (
            <TopLevelLink key={item.label} item={item} onClose={onClose} />
          ))}
        </div>
      </nav>

      {/* Footer CTA */}
      <div className="border-t border-nucleotide-lavender/40 px-5 py-5">
        <a
          href="/login"
          onClick={onClose}
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
          />
        ))}
        <div className="space-y-2 pt-1">
          {guestStaticLinks.map((item) => (
            <TopLevelLink key={item.label} item={item} onClose={onClose} />
          ))}
        </div>
      </nav>

      {/* Logout */}
      <div className="border-t border-nucleotide-lavender/40 px-5 py-5">
        <button
          type="button"
          onClick={() => setShowLogout(true)}
          className="flex min-h-11 items-center gap-3 rounded-[0.875rem] px-2 font-poppins text-[1rem] text-nucleotide-muted transition hover:bg-nucleotide-lavender/30 hover:text-nucleotide-ink focus:outline-none focus:ring-4 focus:ring-nucleotide-purple/15"
        >
          <img src={dashboardIcons.logout} alt="" className="size-4" />
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
    <div
      className={cn(
        "fixed inset-0 z-40 transition-opacity duration-300",
        isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      )}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div
        className={cn(
          "absolute bottom-0 left-0 top-0 flex w-[min(88vw,22.5rem)] flex-col bg-white shadow-[8px_0_40px_rgba(0,0,0,0.18)] transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {isLoggedIn
          ? <LoggedInView onClose={onClose} onLoggedOut={onLoggedOut} />
          : <GuestView onClose={onClose} />
        }
      </div>
    </div>
  );
}

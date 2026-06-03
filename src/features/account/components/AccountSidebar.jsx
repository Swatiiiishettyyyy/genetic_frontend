import { useEffect, useRef, useState } from "react";
import { dashboardIcons } from "../../../assets/dashboardIcons.js";
import { Avatar } from "../../../components/ui/Avatar.jsx";
import { cn } from "../../../lib/cn.js";
import { LogoutModal } from "./LogoutModal.jsx";

const familyProfiles = [
  { initials: "SD", name: "Snigdha Dash", relation: "Self", active: true },
  { initials: "RD", name: "Rohit", relation: "Brother", active: false },
  { initials: "RD", name: "Arav", relation: "Father", active: false },
];

function CheckIcon() {
  return (
    <svg width="1em" height="1em" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="shrink-0 text-nucleotide-purple" style={{ fontSize: "clamp(0.875rem,1.2vw,1.125rem)" }}>
      <path d="M4 10.5L8.5 15L16 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="1em" height="1em" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="text-nucleotide-purple" style={{ fontSize: "clamp(0.875rem,1.2vw,1.125rem)" }}>
      <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function SwitchProfileDropdown({ onClose }) {
  return (
    <div
      className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 rounded-[1.25rem] border border-nucleotide-lavender bg-white px-[clamp(1rem,2vw,1.125rem)] py-[clamp(1rem,2vw,1.125rem)]"
      style={{ boxShadow: "0 4px 78px rgba(136,107,249,0.23)" }}
    >
      <p className="mb-[clamp(0.75rem,1.5vw,1rem)] font-poppins text-[clamp(1rem,1.1vw,1.25rem)] font-medium leading-[1.3] text-nucleotide-ink">
        Switch Profile
      </p>

      <div className="flex flex-col gap-[clamp(0.375rem,0.8vw,0.5rem)]">
        {familyProfiles.map((member) => (
          <button
            key={member.name + member.relation}
            onClick={onClose}
            className="flex w-full items-center justify-between gap-3 rounded-xl px-1 py-[clamp(0.25rem,0.6vw,0.375rem)] text-left transition hover:bg-nucleotide-lavender/30"
          >
            <div className="flex items-center gap-[clamp(0.75rem,1.2vw,1rem)]">
              <Avatar initials={member.initials} size="sm" className="shrink-0" />
              <div className="flex flex-col gap-[clamp(0.1rem,0.3vw,0.3rem)]">
                <span className="font-poppins text-[clamp(0.875rem,0.9vw,1.125rem)] font-medium leading-[1.3] text-nucleotide-ink">
                  {member.name}
                </span>
                <span className="font-poppins text-[clamp(0.8rem,0.85vw,1.125rem)] font-medium leading-[1.3] text-nucleotide-purple">
                  {member.relation}
                </span>
              </div>
            </div>
            {member.active && <CheckIcon />}
          </button>
        ))}
      </div>

      <div className="my-[clamp(0.625rem,1.2vw,0.875rem)] h-px bg-nucleotide-lavender/40" />

      <button
        onClick={onClose}
        className="flex w-full items-center gap-[clamp(0.75rem,1.2vw,1rem)] rounded-xl px-1 py-[clamp(0.25rem,0.6vw,0.375rem)] text-left transition hover:bg-nucleotide-lavender/30"
      >
        <div className="flex shrink-0 items-center justify-center rounded-full border border-dashed border-[rgba(136,107,249,0.5)]" style={{ width: "clamp(2.5rem,4.5vw,4.375rem)", height: "clamp(2.5rem,4.5vw,4.375rem)" }}>
          <PlusIcon />
        </div>
        <span className="font-poppins text-[clamp(0.875rem,0.9vw,1.125rem)] font-medium leading-[1.3] text-nucleotide-ink">
          Add Family Member
        </span>
      </button>
    </div>
  );
}

function SidebarContent({ profile, navigation, activeLabel, onMobileClose, showSwitch, setShowSwitch, setShowLogout, dropdownRef }) {
  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowSwitch((v) => !v)}
          aria-expanded={showSwitch}
          aria-haspopup="listbox"
          className="flex w-full items-center gap-3 rounded-[18px] border border-nucleotide-lavender bg-white px-[clamp(0.75rem,1.2vw,1rem)] py-[clamp(0.75rem,1.2vw,1rem)] text-left shadow-soft"
        >
          <Avatar initials={profile.initials} size="sm" className="lg:size-12 lg:text-[1rem]" />
          <span className="min-w-0 flex-1">
            <span className="flex items-center justify-between gap-3">
              <span className="truncate font-poppins text-[clamp(1rem,0.74rem+0.45vw,1.125rem)] font-medium leading-[1.3] text-nucleotide-ink">
                {profile.name}
              </span>
              <img
                src={dashboardIcons.chevronDown}
                alt=""
                className={cn("h-2 w-[13px] shrink-0 transition-transform duration-200", showSwitch && "rotate-180")}
              />
            </span>
            <span className="font-poppins text-[clamp(0.9375rem,0.74rem+0.45vw,1.125rem)] font-medium leading-[1.3] text-nucleotide-purple">
              {profile.relation}
            </span>
          </span>
        </button>

        {showSwitch && <SwitchProfileDropdown onClose={() => setShowSwitch(false)} />}
      </div>

      <nav className="mt-4 space-y-[clamp(0.875rem,2vw,1.25rem)] px-2 pb-1 sm:px-3 lg:mt-4" aria-label="Account navigation">
        {navigation.map((section) => (
          <div key={section.title}>
            <p className="mb-1.5 font-inter text-[clamp(0.875rem,0.78rem+0.34vw,1rem)] leading-[1.5] text-nucleotide-muted">
              {section.title}
            </p>
            <div className="space-y-2">
              {section.items.map((item) => (
                <a
                  href={item.href}
                  key={item.label}
                  onClick={onMobileClose}
                  className={cn(
                    "flex min-h-8 items-center gap-3 rounded-[10px] px-2 py-1 font-inter text-[clamp(0.875rem,0.78rem+0.34vw,1rem)] leading-[1.5] text-nucleotide-ink transition hover:bg-nucleotide-lavender/60",
                    item.label === activeLabel && "bg-gradient-to-r from-nucleotide-lavender to-white",
                  )}
                  aria-current={item.label === activeLabel ? "page" : undefined}
                >
                  <img src={item.icon} alt="" className="max-h-5 w-5 shrink-0 object-contain" />
                  <span className="truncate">{item.label}</span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <button
        type="button"
        onClick={() => setShowLogout(true)}
        className="mt-[clamp(1rem,2.4vw,1.5rem)] flex items-center gap-4 px-4 pb-1 font-poppins text-[clamp(0.875rem,0.78rem+0.34vw,1rem)] leading-[1.4] text-nucleotide-muted transition hover:text-nucleotide-ink"
      >
        <img src={dashboardIcons.logout} alt="" className="size-4" />
        Logout
      </button>
    </>
  );
}

export function AccountSidebar({ activeLabel = "Personal Information", navigation, profile, mobileOpen, onMobileClose }) {
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

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const contentProps = { profile, navigation, activeLabel, onMobileClose, showSwitch, setShowSwitch, setShowLogout, dropdownRef };

  return (
    <>
      {/* Mobile slide-up drawer */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden transition-opacity duration-300",
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <div className="absolute inset-0 bg-black/40" onClick={onMobileClose} />
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 max-h-[90vh] overflow-y-auto rounded-t-[24px] bg-white p-5 shadow-[0_-8px_40px_rgba(0,0,0,0.15)] transition-transform duration-300",
            mobileOpen ? "translate-y-0" : "translate-y-full"
          )}
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="font-poppins text-[1.125rem] font-medium text-nucleotide-ink">My Account</span>
            <button
              onClick={onMobileClose}
              className="grid size-8 place-items-center rounded-full bg-nucleotide-lavender/30 text-nucleotide-ink transition hover:bg-nucleotide-lavender/60"
              aria-label="Close menu"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <SidebarContent {...contentProps} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-full rounded-[20px] bg-white p-[clamp(0.625rem,1vw,0.875rem)] shadow-nucleotide lg:block lg:sticky lg:top-4 lg:self-start">
        <SidebarContent {...contentProps} onMobileClose={undefined} />
      </aside>

      {showLogout && (
        <LogoutModal
          onClose={() => setShowLogout(false)}
          onConfirm={() => setShowLogout(false)}
        />
      )}
    </>
  );
}

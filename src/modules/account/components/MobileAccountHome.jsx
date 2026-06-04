import { MobileNavbar } from "../../../shared/components/MobileNavbar.jsx";
import { Avatar } from "../../../shared/components/ui/Avatar.jsx";
import { useState } from "react";
import { LogoutModal } from "./LogoutModal.jsx";

function ChevronRight() {
  return (
    <svg width="8" height="13" viewBox="0 0 8 13" fill="none" aria-hidden="true" className="shrink-0 text-[#8B8AAA]">
      <path d="M1 1.5L6.5 6.5L1 11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NavItem({ icon, label, sublabel, href, onClick, danger }) {
  const inner = (
    <div className="flex items-center gap-0 px-3 py-3">
      <div
        className={[
          "mr-3 flex size-9 shrink-0 items-center justify-center rounded-[0.5rem]",
          danger ? "bg-[rgba(186,26,26,0.1)]" : "bg-[rgba(132,85,239,0.1)]",
        ].join(" ")}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={[
            "font-poppins text-[0.9375rem] font-medium leading-[1.25]",
            danger ? "text-[#E12D2D]" : "text-[#1A1C1C]",
          ].join(" ")}
        >
          {label}
        </p>
        {sublabel && (
          <p className="mt-0.5 font-inter text-[0.75rem] leading-[1.35] text-[#494454]">
            {sublabel}
          </p>
        )}
      </div>
      {!danger && <ChevronRight />}
    </div>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="w-full text-left transition active:bg-nucleotide-lavender/20">
        {inner}
      </button>
    );
  }
  return (
    <a href={href} className="block transition active:bg-nucleotide-lavender/20">
      {inner}
    </a>
  );
}

function NavSection({ title, children }) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="px-2 font-inter text-[0.75rem] font-semibold leading-[1] tracking-[0.05em] text-[#494454]">
        {title}
      </p>
      <div className="overflow-hidden rounded-[0.75rem] border border-[rgba(203,195,215,0.1)] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] divide-y divide-[rgba(203,195,215,0.15)]">
        {children}
      </div>
    </div>
  );
}

/* ── Icons (inline SVG so no extra assets needed) ── */
function PersonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="6" r="4" stroke="#8B5CF6" strokeWidth="1.8" />
      <path d="M3 18c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="#8B5CF6" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function FamilyIcon() {
  return (
    <svg width="22" height="16" viewBox="0 0 26 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="5" r="3.5" stroke="#8B5CF6" strokeWidth="1.7" />
      <path d="M1 17c0-4.418 3.582-8 8-8" stroke="#8B5CF6" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="18" cy="5" r="3.5" stroke="#8B5CF6" strokeWidth="1.7" />
      <path d="M26 17c0-4.418-3.582-8-8-8" stroke="#8B5CF6" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M9 17c0-2.761 2.015-5 4.5-5s4.5 2.239 4.5 5" stroke="#8B5CF6" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
function OrdersIcon() {
  return (
    <svg width="16" height="20" viewBox="0 0 16 22" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="14" height="20" rx="2" stroke="#8B5CF6" strokeWidth="1.7" />
      <path d="M4 7h8M4 11h8M4 15h5" stroke="#8B5CF6" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
function AddressIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 18s6-5.1 6-10A6 6 0 1 0 4 8c0 4.9 6 10 6 10Z" stroke="#8B5CF6" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="8" r="2" stroke="#8B5CF6" strokeWidth="1.7" />
    </svg>
  );
}
function ReportsIcon() {
  return (
    <svg width="18" height="20" viewBox="0 0 18 22" fill="none" aria-hidden="true">
      <path d="M4 1h7l5 5v13a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2Z" stroke="#8B5CF6" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M11 1v5h5M5.5 11h7M5.5 15h7" stroke="#8B5CF6" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="3" stroke="#8B5CF6" strokeWidth="1.7" />
      <path d="M11 1v2M11 19v2M1 11h2M19 11h2M3.22 3.22l1.41 1.41M17.37 17.37l1.41 1.41M3.22 18.78l1.41-1.41M17.37 4.63l1.41-1.41" stroke="#8B5CF6" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M7 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M13 14l4-4-4-4M17 10H7" stroke="#BA1A1A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function EditIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M11 2l3 3L5 14H2v-3L11 2Z" stroke="#8B5CF6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── DNA background pattern as inline SVG data URI ── */
const DNA_PATTERN = `url("data:image/svg+xml;utf8,<svg viewBox='0 0 390 356' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%' width='100%' fill='url(%23grad1)' opacity='1'/><defs><radialGradient id='grad1' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(39.931 0 0 39.931 78 106.8)'><stop stop-color='rgba(132,85,239,0.15)' offset='0'/><stop stop-color='rgba(132,85,239,0)' offset='0.5'/></radialGradient></defs></svg>"), url("data:image/svg+xml;utf8,<svg viewBox='0 0 390 356' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%' width='100%' fill='url(%23grad2)' opacity='1'/><defs><radialGradient id='grad2' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(39.931 0 0 39.931 312 249.2)'><stop stop-color='rgba(111,251,190,0.1)' offset='0'/><stop stop-color='rgba(111,251,190,0)' offset='0.5'/></radialGradient></defs></svg>")`;

export function MobileAccountHome({ profile, onMenuClick }) {
  const [showLogout, setShowLogout] = useState(false);

  const firstName = profile.name?.split(" ")[0] ?? profile.name;

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F5FA] lg:hidden">
      <MobileNavbar onMenuClick={onMenuClick} />

      {/* Hero */}
      <div
        className="relative flex flex-col items-center overflow-hidden pb-[4rem] pt-8"
        style={{
          background: "linear-gradient(to right, #101129, #2A2C5B 81%)",
          backgroundImage: `${DNA_PATTERN}, linear-gradient(to right, #101129, #2A2C5B 81%)`,
        }}
      >
        {/* Avatar + badge */}
        <div className="relative">
          <div className="relative size-[4.75rem] rounded-full border-[3px] border-white/30 p-1.5 shadow-[0_16px_20px_-8px_rgba(0,0,0,0.18)]">
            <Avatar
              initials={profile.initials}
              size="sm"
              className="size-full rounded-full bg-white text-[1rem] text-nucleotide-purple shadow-none ring-0"
            />
          </div>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/20 bg-nucleotide-purple px-2.5 py-1 font-inter text-[0.6875rem] font-semibold leading-[1] tracking-[0.05em] text-white shadow-[0_8px_12px_-6px_rgba(0,0,0,0.18)]">
            {profile.relation}
          </div>
        </div>

        {/* Welcome text */}
        <div className="mt-5 text-center">
          <p className="font-inter text-[0.75rem] font-semibold leading-[1] tracking-[0.05em] text-white/70">
            WELCOME BACK
          </p>
          <h1 className="mt-2 font-poppins text-[1.5rem] font-semibold leading-[1.1] text-white">
            Hello, {firstName}
          </h1>
        </div>
      </div>

      {/* Floating profile summary card */}
      <div className="relative z-10 mx-5 -mt-10 rounded-[0.75rem] bg-white p-4 shadow-[0_16px_18px_rgba(107,56,212,0.08)]">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1 pr-3">
            <h2 className="font-poppins text-[1.25rem] font-medium leading-[1.2] text-nucleotide-ink">
              {profile.name}
            </h2>
            <p className="mt-1 font-poppins text-[0.75rem] font-normal leading-[1.35] text-[#161616]">
              {profile.email}
            </p>
          </div>
          <a
            href="/account"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[rgba(107,56,212,0.05)] transition hover:bg-nucleotide-lavender/40"
            aria-label="Edit profile"
          >
            <EditIcon />
          </a>
        </div>

        <div className="mt-4 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="font-inter text-[0.75rem] font-semibold leading-[1] tracking-[0.05em] text-[#494454]">
              PROFILE 85% COMPLETE
            </span>
            <span className="font-inter text-[0.75rem] font-bold leading-[1] tracking-[0.05em] text-nucleotide-purple">
              85%
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[#EEEEEE]">
            <div className="h-full w-[85%] rounded-full bg-nucleotide-purple" />
          </div>
          <p className="font-inter text-[0.8125rem] font-normal leading-[1.4] text-[#494454]">
            Complete your genetic history to unlock deeper insights.
          </p>
        </div>
      </div>

      {/* Navigation sections */}
      <div className="flex flex-col gap-5 px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-5">
        <NavSection title="PERSONAL">
          <NavItem
            icon={<PersonIcon />}
            label="Personal Information"
            href="/account"
          />
          <NavItem
            icon={<FamilyIcon />}
            label="My Family"
            href="/account/family"
          />
          <NavItem
            icon={<AddressIcon />}
            label="Manage Address"
            href="/account/address"
          />
        </NavSection>

        <NavSection title="MY ORDERS">
          <NavItem
            icon={<OrdersIcon />}
            label="Blood Test Orders"
            href="/blood-test/orders"
          />
          <NavItem
            icon={<OrdersIcon />}
            label="Genetic Test Orders"
            href="/genetic-tests#orders"
          />
        </NavSection>

        <NavSection title="MY REPORTS">
          <NavItem
            icon={<ReportsIcon />}
            label="Blood Test Reports"
            href="/blood-test/reports"
          />
          <NavItem
            icon={<ReportsIcon />}
            label="Genetic Test Reports"
            href="/genetic-tests#reports"
          />
        </NavSection>

        <NavSection title="SYSTEM">
          <NavItem
            icon={<SettingsIcon />}
            label="Account Settings"
            href="/account/settings"
          />
          <NavItem
            icon={<LogoutIcon />}
            label="Logout"
            danger
            onClick={() => setShowLogout(true)}
          />
        </NavSection>
      </div>

      {showLogout && (
        <LogoutModal
          onClose={() => setShowLogout(false)}
          onConfirm={() => setShowLogout(false)}
        />
      )}
    </div>
  );
}

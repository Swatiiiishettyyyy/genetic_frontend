import { BrandLogo } from "../components/BrandLogo.jsx";
import { MobileNavbar } from "../components/MobileNavbar.jsx";
import { PageShell } from "../components/ui/PageShell.jsx";
import { dashboardModuleGroups, dashboardProfile } from "../data/dashboard.js";
import { cn } from "../lib/cn.js";

function DashboardModule({ module }) {
  return (
    <a
      href={module.href || "#"}
      className="group flex w-[clamp(4.875rem,5.6vw,6.75rem)] shrink-0 flex-col items-start gap-[clamp(0.625rem,0.85vw,0.875rem)] text-left outline-none"
    >
      <span className="grid size-[clamp(2.75rem,2.85vw,3.375rem)] shrink-0 place-items-center rounded-full border border-nucleotide-lavender bg-nucleotide-lavender transition group-hover:border-nucleotide-purple/40 group-hover:bg-[#ded2ff] group-focus-visible:ring-4 group-focus-visible:ring-nucleotide-purple/20">
        <img
          src={module.icon}
          alt=""
          className={cn("size-[clamp(1.5rem,1.55vw,1.875rem)] object-contain", module.iconClassName)}
          aria-hidden="true"
        />
      </span>
      <span className="w-full font-poppins text-[clamp(0.875rem,0.66rem+0.9vw,1.25rem)] font-normal leading-[1.45] text-nucleotide-muted">
        {module.label}
      </span>
    </a>
  );
}

function DashboardModuleGroup({ group }) {
  return (
    <section className="flex shrink-0 flex-col items-start gap-[clamp(1.25rem,1.65vw,1.875rem)]">
      <h2 className="font-poppins text-[clamp(1.125rem,0.9rem+0.9vw,1.5rem)] font-medium leading-[1.125] tracking-[-0.02em] text-nucleotide-night">
        {group.title}
      </h2>
      <div className="flex flex-nowrap items-start gap-x-[clamp(0.75rem,1.1vw,1.25rem)]">
        {group.modules.map((module) => (
          <DashboardModule key={module.label} module={module} />
        ))}
      </div>
    </section>
  );
}

export function DashboardPage({ onMenuClick }) {
  return (
    <PageShell>
      <div className="min-h-dvh overflow-x-hidden bg-white">
        <MobileNavbar onMenuClick={onMenuClick} className="sm:hidden" />
        <header className="bg-gradient-to-r from-nucleotide-night to-nucleotide-indigo text-white">
          <div className="mx-auto flex min-h-[clamp(15rem,24vw,21.5rem)] w-full max-w-[120rem] flex-col px-[clamp(1rem,8.333vw,10rem)] pb-[clamp(3.25rem,7vw,5.5rem)] pt-[clamp(1.375rem,3.2vw,3.125rem)]">
            <div className="hidden items-center justify-between gap-5 sm:flex">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Open menu"
                  onClick={onMenuClick}
                  className="text-white/70 transition hover:text-white sm:hidden"
                >
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
                    <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
                <BrandLogo className="h-auto w-[clamp(10rem,16vw,18.8125rem)]" />
              </div>

              <a
                href="/account"
                className="flex min-w-0 items-center gap-[clamp(0.625rem,1.2vw,1.3125rem)] font-poppins text-[clamp(0.8125rem,0.74rem+0.34vw,1.25rem)] font-normal leading-[1.45] text-white/45"
              >
                <span className="grid size-[clamp(2.25rem,3.25vw,3.5rem)] shrink-0 place-items-center rounded-full bg-[#fdfdfd] font-poppins text-[clamp(0.875rem,0.68rem+0.75vw,1.25rem)] font-medium leading-[1.125] tracking-[-0.02em] text-nucleotide-purple">
                  {dashboardProfile.initials}
                </span>
                <span className="hidden whitespace-nowrap sm:inline">My Account</span>
              </a>
            </div>

            <div className="mt-auto max-w-[31.125rem]">
              <h1 className="font-poppins text-[clamp(1.75rem,1.52rem+0.72vw,2rem)] font-medium leading-[1.03] tracking-[-0.02em]">
                Welcome back, {dashboardProfile.firstName}
              </h1>
              <p className="mt-[clamp(0.5rem,1.2vw,0.875rem)] font-poppins text-[clamp(0.9375rem,0.82rem+0.56vw,1.25rem)] font-normal leading-[1.45] text-white/45">
                Explore our health modules and start your journey
              </p>
            </div>
          </div>
        </header>

        <main className="mx-auto -mt-[clamp(2.25rem,4vw,3rem)] w-full max-w-[120rem] px-[clamp(1rem,8.333vw,10rem)] pb-[clamp(6rem,12vw,10rem)]">
          <div className="rounded-[1.25rem] border border-nucleotide-lavender bg-white px-[clamp(1.75rem,4vw,3.25rem)] pb-[clamp(4.5rem,8vw,8rem)] pt-[clamp(2rem,4vw,3.3125rem)] shadow-nucleotide">
            <div className="flex flex-nowrap items-start gap-x-[clamp(2.25rem,4vw,4.625rem)] overflow-x-auto pb-3">
              {dashboardModuleGroups.map((group) => (
                <DashboardModuleGroup key={group.title} group={group} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </PageShell>
  );
}

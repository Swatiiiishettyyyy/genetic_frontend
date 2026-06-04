import { MobileNavbar } from "../../../shared/components/MobileNavbar.jsx";
import { PageShell } from "../../../shared/components/ui/PageShell.jsx";
import dnaIcon from "../../../shared/assets/navbar/Untitled design (9) 1.png";
import { dashboardModuleGroups, dashboardProfile } from "../data/dashboard.js";
import { cn } from "../../../lib/cn.js";

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

/* ── Mobile module tile ── */
function MobileDashboardModule({ module }) {
  return (
    <a
      href={module.href || "#"}
      className="group flex w-[6.5rem] flex-col items-center gap-3 text-center outline-none"
    >
      <span className="grid size-14 shrink-0 place-items-center rounded-full border border-nucleotide-lavender bg-nucleotide-lavender transition group-hover:bg-[#ded2ff] group-focus-visible:ring-4 group-focus-visible:ring-nucleotide-purple/20">
        <img
          src={module.icon}
          alt=""
          className={cn("size-7 object-contain", module.iconClassName)}
          aria-hidden="true"
        />
      </span>
      <span className="font-poppins text-[0.8125rem] font-normal leading-[1.35] text-nucleotide-muted">
        {module.label}
      </span>
    </a>
  );
}

/* Renders modules in rows of 2, centered */
function MobileDashboardModuleGroup({ group }) {
  const pairs = [];
  for (let i = 0; i < group.modules.length; i += 2) {
    pairs.push(group.modules.slice(i, i + 2));
  }
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-poppins text-[0.8125rem] font-medium leading-5 tracking-[0.01em] text-nucleotide-night">
        {group.title}
      </h2>
      <div className="flex flex-col items-center gap-6">
        {pairs.map((pair, i) => (
          <div key={i} className="flex items-start justify-center gap-8">
            {pair.map((module) => (
              <MobileDashboardModule key={module.label} module={module} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

export function DashboardPage({ onMenuClick }) {
  return (
    <PageShell>
      <div className="min-h-dvh overflow-x-hidden bg-white">

        {/* ── Mobile layout (< sm) ── */}
        <div className="min-h-dvh bg-[#FBFAFF] sm:hidden">
          <MobileNavbar onMenuClick={onMenuClick} />

          {/* Gradient hero */}
          <div className="relative z-0 overflow-hidden bg-gradient-to-r from-nucleotide-night to-[#2a2c5b] px-5 pb-[8rem] pt-10 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]">
            {/* Purple glow */}
            <div
              className="pointer-events-none absolute -right-[5.333rem] -top-32 size-64 rounded-full blur-[40px]"
              style={{ background: "rgba(107,56,212,0.2)" }}
              aria-hidden="true"
            />
            <div className="relative mx-auto flex w-full max-w-[22rem] flex-col items-start gap-2.5">
              <p className="font-poppins text-[1.375rem] font-semibold leading-[1.2] tracking-[-0.01em] text-white">
                Welcome back, {dashboardProfile.firstName}
              </p>
              <p className="whitespace-nowrap font-poppins text-[0.875rem] font-normal leading-[1.5] text-[#a5a3b8]">
                Explore our health modules and start your journey
              </p>
            </div>
          </div>

          {/* White card overlapping hero */}
          <div className="relative z-10 mx-auto -mt-[5.25rem] w-[calc(100%-2.5rem)] max-w-[22rem] rounded-xl bg-white px-5 pb-8 pt-6 shadow-[0_10px_24px_rgba(22,17,55,0.08)] ring-1 ring-nucleotide-lavender/35">
            <h1 className="mb-7 font-poppins text-[0.9375rem] font-semibold leading-[1.4] tracking-[0.04em] text-[#494454]">
              HEALTH MODULES
            </h1>
            <div className="flex flex-col gap-6">
              {dashboardModuleGroups.map((group) => (
                <MobileDashboardModuleGroup key={group.title} group={group} />
              ))}
            </div>
          </div>

          <div className="h-28" />
        </div>

        {/* ── Desktop layout (≥ sm, unchanged) ── */}
        <div className="hidden sm:block">
          <header className="bg-gradient-to-r from-nucleotide-night to-nucleotide-indigo text-white">
            <div className="mx-auto flex min-h-[clamp(15rem,24vw,21.5rem)] w-full max-w-[120rem] flex-col px-[clamp(1rem,8.333vw,10rem)] pb-[clamp(3.25rem,7vw,5.5rem)] pt-[clamp(1.375rem,3.2vw,3.125rem)]">
              <div className="flex items-center justify-between gap-5">
                <a
                  href="/dashboard"
                  aria-label="Nucleotide home"
                  className="flex w-fit items-center gap-2 rounded-full transition focus:outline-none focus:ring-4 focus:ring-white/20"
                >
                  <img src={dnaIcon} alt="" className="h-[clamp(1.625rem,2vw,2rem)] w-auto object-contain" aria-hidden="true" />
                  <span className="font-poppins text-[clamp(1rem,1vw,1.1875rem)] font-medium leading-none text-white">
                    Nucleotide
                  </span>
                </a>
                <a
                  href="/account"
                  className="ml-auto flex shrink-0 items-center justify-end gap-[clamp(0.625rem,1.2vw,1.3125rem)] font-poppins text-[clamp(0.8125rem,0.74rem+0.34vw,1.25rem)] font-normal leading-[1.45] text-white/80 transition hover:text-white focus:outline-none focus:ring-4 focus:ring-white/20"
                >
                  <span className="grid size-[clamp(2.25rem,3.25vw,3.5rem)] shrink-0 place-items-center rounded-full bg-[#fdfdfd] font-poppins text-[clamp(0.875rem,0.68rem+0.75vw,1.25rem)] font-medium leading-[1.125] tracking-[-0.02em] text-nucleotide-purple">
                    {dashboardProfile.initials}
                  </span>
                  <span className="whitespace-nowrap">My Account</span>
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

      </div>
    </PageShell>
  );
}

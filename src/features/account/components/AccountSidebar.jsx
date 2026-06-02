import { dashboardIcons } from "../../../assets/dashboardIcons.js";
import { Avatar } from "../../../components/ui/Avatar.jsx";
import { cn } from "../../../lib/cn.js";

export function AccountSidebar({ activeLabel = "Personal Information", navigation, profile }) {
  return (
    <aside className="w-full rounded-[20px] bg-white p-[clamp(0.625rem,1vw,0.875rem)] shadow-nucleotide lg:sticky lg:top-4 lg:self-start">
      <button className="flex w-full items-center gap-3 rounded-[18px] border border-nucleotide-lavender bg-white px-[clamp(0.75rem,1.2vw,1rem)] py-[clamp(0.75rem,1.2vw,1rem)] text-left shadow-soft">
        <Avatar initials={profile.initials} size="sm" className="lg:size-12 lg:text-[1rem]" />
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-3">
            <span className="truncate font-poppins text-[clamp(1rem,0.74rem+0.45vw,1.125rem)] font-medium leading-[1.3] text-nucleotide-ink">
              {profile.name}
            </span>
            <img src={dashboardIcons.chevronDown} alt="" className="h-2 w-[13px] shrink-0" />
          </span>
          <span className="font-poppins text-[clamp(0.9375rem,0.74rem+0.45vw,1.125rem)] font-medium leading-[1.3] text-nucleotide-purple">
            {profile.relation}
          </span>
        </span>
      </button>

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

      <button className="mt-[clamp(1rem,2.4vw,1.5rem)] flex items-center gap-4 px-4 pb-1 font-poppins text-[clamp(0.875rem,0.78rem+0.34vw,1rem)] leading-[1.4] text-nucleotide-muted">
        <img src={dashboardIcons.logout} alt="" className="size-4" />
        Logout
      </button>
    </aside>
  );
}

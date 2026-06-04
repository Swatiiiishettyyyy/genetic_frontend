import { cn } from "../../lib/cn.js";

const navItems = [
  {
    label: "Blood Tests",
    items: [
      { label: "Tests", href: "/blood-test/tests" },
      { label: "Packages", href: "/blood-test/packages" },
    ],
  },
  { label: "Genetic Tests", href: "/genetic-tests" },
];

function currentLocation() {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname || "/"}${window.location.hash || ""}`;
}

function isActiveHref(href, current) {
  const pathOnly = current.split("#")[0];
  const hrefPath = href.split("#")[0];

  if (href === "/account") return pathOnly === "/account";
  if (href.includes("#")) return current === href;
  return pathOnly === hrefPath || pathOnly.startsWith(`${hrefPath}/`);
}

function itemIsActive(item, current) {
  if (item.href) return isActiveHref(item.href, current);
  return item.items?.some((child) => isActiveHref(child.href, current));
}

export function DesktopAccountNav({ variant = "light", className = "" }) {
  const current = currentLocation();
  const isDark = variant === "dark";

  return (
    <nav
      aria-label="Account navigation"
      className={cn("hidden items-center gap-[clamp(1rem,1.9vw,2rem)] xl:flex", className)}
    >
      {navItems.map((item) => {
        const active = itemIsActive(item, current);
        const colorClass = active
          ? "text-nucleotide-purple"
          : isDark
            ? "text-white/78 hover:text-white"
            : "text-nucleotide-ink hover:text-nucleotide-purple";

        if (!item.items) {
          return (
            <a
              key={item.label}
              href={item.href}
              className={cn(
                "whitespace-nowrap font-poppins text-[clamp(0.875rem,0.76rem+0.22vw,1rem)] font-medium leading-none transition focus:outline-none focus:ring-4 focus:ring-nucleotide-purple/15",
                colorClass
              )}
              aria-current={active ? "page" : undefined}
            >
              {item.label}
            </a>
          );
        }

        return (
          <div key={item.label} className="group relative">
            <button
              type="button"
              className={cn(
                "inline-flex items-center gap-1.5 whitespace-nowrap border-0 bg-transparent p-0 font-poppins text-[clamp(0.875rem,0.76rem+0.22vw,1rem)] font-medium leading-none transition focus:outline-none focus:ring-4 focus:ring-nucleotide-purple/15",
                colorClass
              )}
              aria-haspopup="menu"
            >
              {item.label}
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              role="menu"
              className="invisible absolute left-0 top-[calc(100%+0.875rem)] z-[180] min-w-[12rem] rounded-2xl border border-nucleotide-lavender bg-white p-2 opacity-0 shadow-[0_1.125rem_3.5rem_rgba(16,17,41,0.15)] transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
            >
              {item.items.map((child) => {
                const childActive = isActiveHref(child.href, current);
                return (
                  <a
                    key={child.label}
                    href={child.href}
                    role="menuitem"
                    className={cn(
                      "block rounded-xl px-3 py-2.5 font-poppins text-sm font-medium leading-tight transition",
                      childActive
                        ? "bg-nucleotide-purple/10 text-nucleotide-purple"
                        : "text-nucleotide-ink hover:bg-nucleotide-lavender/35 hover:text-nucleotide-purple"
                    )}
                    aria-current={childActive ? "page" : undefined}
                  >
                    {child.label}
                  </a>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

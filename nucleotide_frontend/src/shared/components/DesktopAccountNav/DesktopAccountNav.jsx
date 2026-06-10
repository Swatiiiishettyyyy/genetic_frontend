import { useState } from "react";
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
  const [openMenu, setOpenMenu] = useState(null);

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
                "whitespace-nowrap font-poppins text-[clamp(0.875rem,0.76rem+0.22vw,1rem)] font-medium leading-none transition focus:outline-none focus-visible:ring-4 focus-visible:ring-nucleotide-purple/15",
                colorClass
              )}
              aria-current={active ? "page" : undefined}
            >
              {item.label}
            </a>
          );
        }

        return (
          <div
            key={item.label}
            className="relative"
            onMouseEnter={() => setOpenMenu(item.label)}
            onMouseLeave={() => setOpenMenu(null)}
            onFocus={() => setOpenMenu(item.label)}
          >
            <button
              type="button"
              className={cn(
                "inline-flex items-center gap-1.5 whitespace-nowrap border-0 bg-transparent p-0 font-poppins text-[clamp(0.875rem,0.76rem+0.22vw,1rem)] font-medium leading-none transition focus:outline-none focus-visible:ring-4 focus-visible:ring-nucleotide-purple/15",
                colorClass
              )}
              aria-haspopup="menu"
              aria-expanded={openMenu === item.label}
              onClick={() => setOpenMenu((currentMenu) => currentMenu === item.label ? null : item.label)}
            >
              {item.label}
            </button>
            <div
              className={cn(
                "absolute left-0 top-full z-[180] min-w-[12rem] pt-3 transition",
                openMenu === item.label ? "visible opacity-100" : "invisible opacity-0"
              )}
            >
              <div
                role="menu"
                className="rounded-2xl border border-nucleotide-lavender bg-white p-2 shadow-[0_1.125rem_3.5rem_rgba(16,17,41,0.15)]"
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
                      onClick={() => setOpenMenu(null)}
                    >
                      {child.label}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </nav>
  );
}

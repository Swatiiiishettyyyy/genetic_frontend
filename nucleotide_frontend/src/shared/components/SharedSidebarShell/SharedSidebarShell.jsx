import { cn } from "../../lib/cn.js";

export function SharedSidebarShell({
  isOpen,
  onClose,
  children,
  className = "",
  panelClassName = "",
  width = "min(88vw, 22.5rem)",
}) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-[200] transition-opacity duration-300",
        isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        className
      )}
    >
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <aside
        className={cn(
          "absolute bottom-0 left-0 top-0 flex flex-col overflow-hidden shadow-[4px_0_24px_rgba(139,92,246,0.15)] transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full",
          panelClassName
        )}
        style={{
          width,
          background: "linear-gradient(0deg, #E7E1FF 0%, #fff 100%)",
        }}
      >
        {children}
      </aside>
    </div>
  );
}

export function SharedSidebarCloseButton({ onClick, ariaLabel = "Close navigation menu" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="absolute right-4 top-[0.8125rem] grid size-10 place-items-center rounded-full border-0 bg-[#F7F7F7] text-[#24254F] transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-nucleotide-purple/15"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </button>
  );
}

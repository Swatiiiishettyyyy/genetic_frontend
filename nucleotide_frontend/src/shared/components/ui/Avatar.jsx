import { cn } from "../../lib/cn.js";

const sizeClasses = {
  sm: "size-[70px] text-fluid-avatar-sm",
  lg: "size-[94px] text-fluid-avatar-lg",
};

export function Avatar({ initials, size = "lg", className = "" }) {
  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-gradient-to-t from-nucleotide-lavender to-white font-poppins font-medium tracking-[-0.02em] text-nucleotide-purple",
        sizeClasses[size],
        className,
      )}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

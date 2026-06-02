import { cn } from "../lib/cn.js";

export function BrandLogo({ variant = "light", className = "" }) {
  const isDark = variant === "dark";

  return (
    <a href="/" className="flex items-center gap-3" aria-label="Nucleotide home">
      <svg
        className={cn("h-9 w-24 sm:h-12 sm:w-32", className)}
        viewBox="0 0 250 58"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M11 17C31 17 35 41 55 41C75 41 79 17 99 17"
          stroke="#5EEAD4"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M11 41C31 41 35 17 55 17C75 17 79 41 99 41"
          stroke="#8B5CF6"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M22 24H34M22 34H34M76 24H88M76 34H88"
          stroke="#F9F9F9"
          strokeWidth="4"
          strokeLinecap="round"
          opacity=".9"
        />
        <text
          x="106"
          y="35"
          fill={isDark ? "#101129" : "#F9F9F9"}
          fontFamily="Poppins, sans-serif"
          fontSize="18"
          fontWeight="500"
        >
          Nucleotide
        </text>
        {isDark && (
          <text x="226" y="23" fill="#101129" fontFamily="Poppins, sans-serif" fontSize="7" fontWeight="500">
            TM
          </text>
        )}
      </svg>
    </a>
  );
}

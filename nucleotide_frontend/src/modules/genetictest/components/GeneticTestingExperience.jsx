import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../../../shared/components/Navbar";
import { useAuth } from "../../../shared/auth/AuthContext";
import { savePostLoginRedirect } from "../../../shared/auth/postLoginRedirect";
import { buildGeneticCheckoutSession, formatInr, getPanelPriceValue, minimumCheckoutTotal } from "../utils/geneticCheckoutSession.js";
import {
  GENETIC_NAV_LINKS,
  GEN_WHY_FEATURES,
  categories,
  categoryCards,
  curatedPackageCards,
  faqs,
  featuredPanelCartItem,
  filterGroups,
  getFilterGroupLabel,
  howItWorksSteps,
  panelDetails,
  panelTabs,
  popularCategoriesExtended,
  recommendedPanels,
  sectionTabs,
  trendingTests,
} from "../data/geneticTestingData.js";
import { dashboardIcons } from "../../../shared/assets/dashboardIcons.js";
import howWorksDecoA from "../../../shared/assets/brand/how-works-deco-a.png";
import howWorksDecoB from "../../../shared/assets/brand/how-works-deco-b.png";
import addIcon from "../assets/icons/actions/add.svg";
import filterIcon from "../assets/icons/actions/filter.svg";
import geneticHeroMobile from "../assets/hero/mobile-banner.png";
import geneticHeroDna from "../assets/hero/dna-helix.png";
import cancerPulseIcon from "../assets/icons/panels/cancer-pulse.svg";
import wellnessIcon from "../assets/icons/panels/wellness.svg";
import microscopeIcon from "../assets/icons/badges/microscope.svg";
import badgeReportIcon from "../assets/icons/badges/report.svg";
import badgeVerifiedIcon from "../assets/icons/badges/verified.svg";
import detailCheckIcon from "../assets/icons/detail/check.svg";
import detailKitIcon from "../assets/icons/detail/kit.svg";

function HormoneDropIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M10 18c-2.72 0-4.9-.86-6.05-2.65-1.19-1.86-1.02-4.2.48-6.75C5.48 6.8 7.2 4.75 10 2c2.8 2.75 4.52 4.8 5.57 6.6 1.5 2.55 1.67 4.89.48 6.75C14.9 17.14 12.72 18 10 18Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M7.35 12.1h5.3M10 9.45v5.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CardIcon({ icon }) {
  if (icon === "hormone-drop") {
    return <HormoneDropIcon />;
  }

  return <img src={icon} alt="" className="h-4 w-4 object-contain" />;
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="m5.4 8.1 1.7 1.7 3.5-3.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function TinyCheckIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="m2.2 6.25 2.15 2.1 5.1-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DnaIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M6.5 2.8c4.2 2.8 4.2 5.6 0 8.4m7-8.4c-4.2 2.8-4.2 5.6 0 8.4m-7 0c4.2 2.8 4.2 5.6 0 8.4m7-8.4c-4.2 2.8-4.2 5.6 0 8.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7.75 5.5h4.5M7.1 9.9h5.8M7.75 14.2h4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function MedicalKitIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M7.25 6V4.75c0-.7.55-1.25 1.25-1.25h3c.7 0 1.25.55 1.25 1.25V6M4.5 6.5h11c.7 0 1.25.55 1.25 1.25v6.5c0 .7-.55 1.25-1.25 1.25h-11c-.7 0-1.25-.55-1.25-1.25v-6.5c0-.7.55-1.25 1.25-1.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M10 9.25v3.5M8.25 11h3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function DetailListIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="5.75" stroke="currentColor" strokeWidth="1.5" />
      <path d="m5.45 8.05 1.55 1.55 3.55-3.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="m14.25 14.25 3 3M8.75 15.25a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MobileSearchBar() {
  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <div className="genetic-mobile-discovery" aria-label="Location and genetic test search">
      <button type="button" className="genetic-mobile-location" aria-label="Choose location">
        <svg width="20" height="20" viewBox="0 0 14 18" fill="none" aria-hidden="true">
          <path
            d="M7 0C3.69 0 1 2.69 1 6C1 10.5 7 17 7 17C7 17 13 10.5 13 6C13 2.69 10.31 0 7 0ZM7 8C5.9 8 5 7.1 5 6C5 4.9 5.9 4 7 4C8.1 4 9 4.9 9 6C9 7.1 8.1 8 7 8Z"
            fill="#101129"
          />
        </svg>
        <span>Location</span>
        <svg width="10" height="10" viewBox="0 0 12 8" fill="none" aria-hidden="true">
          <path d="M1 1L6 6L11 1" stroke="#161616" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <form className="genetic-mobile-search" onSubmit={handleSubmit}>
        <input
          type="search"
          aria-label="Search genetic tests"
          placeholder='Try "Cancer Risk", "Wellness Panel"'
        />
        <button type="submit" aria-label="Search genetic tests">
          <SearchIcon />
        </button>
      </form>
    </div>
  );
}

function PackageIcon({ name }) {
  return <img src={name} alt="" className="h-4 w-4 object-contain" />;
}


const ShieldLockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <path d="M12 2L4 6v5c0 4.97 3.4 9.63 8 10.93C17.6 20.63 21 15.97 21 11V6l-9-4z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <rect x="9" y="11" width="6" height="5" rx="1" fill="currentColor" opacity="0.9"/>
    <path d="M10 11V9a2 2 0 1 1 4 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="13.5" r="0.75" fill="white"/>
  </svg>
);

const heroBadges = [
  { icon: microscopeIcon, label: "CAP & NABL Certified Labs", color: "hero-badge--amber" },
  { icon: badgeVerifiedIcon, label: "Free One Time Blood Collection", color: "hero-badge--green" },
  { icon: badgeReportIcon, label: "Interactive Reports", color: "hero-badge--teal" },
  { svg: <ShieldLockIcon />, label: "Secure & Private Data", color: "hero-badge--blue" },
];

function HeroSection() {
  return (
    <div className="genetic-hero-wrapper">
      <section id="hero" className="genetic-ribbon-panel genetic-hero-panel overflow-hidden rounded-xl border border-[#cbc3d7]/30 text-white shadow-soft">
        <img src={geneticHeroDna} alt="" className="genetic-hero-dna-layer" aria-hidden="true" />
        <img src={geneticHeroMobile} alt="" className="genetic-hero-mobile-art" aria-hidden="true" />
        <div className="genetic-hero-content relative z-10">
          <div className="genetic-ribbon-copy-stack max-w-[50rem]">
            <h1 className="type-hero-title font-poppins">
              Decode Your DNA.<br />
              Unlock Your Future Health.
            </h1>
            <p className="genetic-ribbon-copy type-body font-inter max-w-[52rem] text-white/90">
              Get clinically validated insights on disease risk, drug response, vitamin needs, and cognitive traits - powered by advanced genomics and AI.
            </p>
          </div>
        </div>
      </section>
      <div className="genetic-hero-trust-row" aria-label="Trust indicators">
        {heroBadges.map((badge) => (
          <div key={badge.label} className={`hero-badge ${badge.color}`}>
            <span className="hero-badge-icon-wrap">
              {badge.svg ? badge.svg : <img src={badge.icon} alt="" aria-hidden="true" />}
            </span>
            <span className="hero-badge-label">{badge.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StartChoicePanel({ activeSectionTab, onSectionTabChange }) {
  const choices = [
    {
      tab: "Curated Packages",
      title: "Choose a Curated Package",
      text: "Expert-designed bundles for common health goals.",
      badge: "Recommended start",
    },
    {
      tab: "Build Your Panel",
      title: "Build My Own Panel",
      text: "Select specific genes, conditions, or markers.",
      badge: "Custom path",
    },
  ];

  return (
    <section className="genetic-start-panel" aria-labelledby="genetic-start-title">
      <div className="genetic-start-copy">
        <p className="type-eyebrow">Not sure where to start?</p>
        <h2 id="genetic-start-title">Start with a recommended package or build your own genetic test panel.</h2>
      </div>
      <div className="genetic-start-actions" role="group" aria-label="Choose how to start genetic testing">
        {choices.map((choice) => {
          const isActive = activeSectionTab === choice.tab;

          return (
            <button
              key={choice.tab}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSectionTabChange(choice.tab)}
              className={isActive ? "genetic-start-choice genetic-start-choice--active" : "genetic-start-choice"}
            >
              <span className="genetic-start-badge">{choice.badge}</span>
              <strong>{choice.title}</strong>
              <span>{choice.text}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function StickyControls({ activeSectionTab, onSectionTabChange, showBuildFilters = true }) {
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  return (
    <div
      className={[
        "sticky top-[5rem] z-30 rounded-lg bg-[#faf8ff]/90 px-1 pt-1 backdrop-blur-lg",
        showBuildFilters ? "pb-[clamp(1.15rem,1.45vw,1.4rem)]" : "pb-1",
      ].join(" ")}
    >
      <div className="type-caption flex min-h-[3.85rem] items-end gap-8 overflow-x-auto border-b border-[#cbc3d7]/20 px-4">
        {sectionTabs.map((tab) => {
          const isActive = activeSectionTab === tab;

          return (
            <button
              key={tab}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSectionTabChange(tab)}
              className={[
                "shrink-0 rounded-full border px-4 py-2 transition-colors duration-150",
                isActive
                  ? "border-nucleotide-purple bg-nucleotide-purple text-white shadow-[0_0.45rem_1rem_rgba(139,92,246,0.24)]"
                  : "border-transparent text-[#494454] hover:border-nucleotide-purple/40 hover:text-nucleotide-purple",
              ].join(" ")}
            >
              {tab}
            </button>
          );
        })}
      </div>
      {showBuildFilters && (
        <>
          <div className="flex flex-wrap items-center gap-3 px-1 pt-[clamp(1.15rem,1.5vw,1.45rem)]">
            <label className="type-body-sm flex h-12 w-full max-w-[34rem] items-center gap-3 rounded-full border border-[#cbc3d7]/45 bg-white px-4 text-[#7b7486] shadow-[0_0.25rem_1.5rem_rgba(139,92,246,0.04)]">
              <SearchIcon />
              <input className="w-full bg-transparent outline-none placeholder:text-[#7b7486]" placeholder="Search conditions, genes, or panels..." />
            </label>
          </div>
          <div className="sticky-category-chips mt-[clamp(0.85rem,1.1vw,1.1rem)] flex flex-wrap gap-2.5 px-1">
            {categories.map((category) => {
              const isActive = activeCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveCategory(category)}
                  className={[
                    "type-chip rounded-full border px-4 py-2 transition-colors duration-150",
                    isActive
                      ? "border-nucleotide-purple bg-nucleotide-purple text-white shadow-[0_0.45rem_1rem_rgba(139,92,246,0.24)]"
                      : "border-[#e7e1ff] bg-white text-[#494454] hover:border-nucleotide-purple/40 hover:text-nucleotide-purple",
                  ].join(" ")}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function MobileBuildPanelControls() {
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  return (
    <div className="genetic-mobile-panel-controls" aria-label="Build panel search and filters">
      <label className="genetic-mobile-panel-search">
        <SearchIcon />
        <input type="search" placeholder="Search conditions, genes, or panels..." />
      </label>
      <div className="genetic-mobile-panel-chips" aria-label="Panel categories">
        {categories.map((category) => {
          const isActive = activeCategory === category;

          return (
            <button
              key={category}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActiveCategory(category)}
              className={isActive ? "genetic-mobile-panel-chip genetic-mobile-panel-chip--active" : "genetic-mobile-panel-chip"}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FeaturedPanel({ compact = false, onAddPanel }) {
  return (
    <section className={compact ? "genetic-ribbon-panel curated-premium-card curated-premium-card--compact" : "genetic-ribbon-panel curated-premium-card"}>
      <div className="curated-premium-ribbon">Best Value</div>
      <div className="genetic-featured-ribbon-grid grid gap-[clamp(1rem,1.8vw,2.25rem)] xl:grid-cols-[minmax(0,1fr)_minmax(15rem,17.5rem)] xl:items-center">
        <div className={compact ? "genetic-ribbon-copy-stack genetic-ribbon-copy-stack--compact" : "genetic-ribbon-copy-stack"}>
          <span className="type-eyebrow inline-flex items-center gap-2 rounded-full border border-nucleotide-purple/35 bg-[#211b44] px-3 py-1 text-nucleotide-lavender">
            <img src={wellnessIcon} alt="" className="h-3 w-3" />
            Elite Healthcare Edition
          </span>
          <h2 className="type-section-title">Complete Genomic Wellness</h2>
          <p className="genetic-ribbon-copy type-body max-w-[39rem] text-white/90">
            Our most comprehensive screen covering 120+ clinical markers. A full-spectrum DNA analysis.
          </p>
          <div className="genetic-featured-chips flex flex-wrap gap-2">
            {['Onco Risk', 'Cardiac Health', 'Pharmacogenomics'].map((chip) => (
              <span key={chip} className="type-chip rounded-full border border-white/20 bg-white/[0.06] px-3 py-1 uppercase tracking-[0.05em] text-white/80">{chip}</span>
            ))}
          </div>
        </div>
        <div className="curated-premium-price-card rounded-2xl border border-[#584e76] bg-white/[0.04] p-[clamp(0.8rem,1vw,1rem)] text-white">
          <p className="type-caption text-white">Total Investment</p>
          <p className="type-price mt-1 text-white">₹499 <span className="type-caption font-normal text-white">/ kit</span></p>
          <ul className="type-body-sm mt-3 space-y-1.5 text-white/80">
            <li className="flex items-center gap-2 text-white/80">
              <span className="text-nucleotide-sea"><CheckCircleIcon /></span>
              Lifetime Reanalysis
            </li>
            <li className="flex items-center gap-2 text-white/80">
              <span className="text-nucleotide-sea"><CheckCircleIcon /></span>
              1-on-1 Counseling
            </li>
          </ul>
          <button
            className="type-button mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-nucleotide-purple px-4 py-2.5 text-white shadow-[0_0.65rem_1.2rem_rgba(139,92,246,0.28)]"
            type="button"
            onClick={() => onAddPanel?.(featuredPanelCartItem)}
          >
            <img src={addIcon} alt="" className="w-4" /> Add to Selection
          </button>
          <p className="type-caption mt-3 font-normal text-white">FSA/HSA Eligible</p>
        </div>
      </div>
    </section>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 12 12" width="10" height="10" fill="currentColor" aria-hidden="true">
      <path d="M6 1l1.18 2.39 2.64.38-1.91 1.86.45 2.63L6 7.01 3.64 8.26l.45-2.63L2.18 3.77l2.64-.38L6 1z" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg viewBox="0 0 12 12" width="10" height="10" fill="currentColor" aria-hidden="true">
      <path d="M2.5 10.5c1-3 3.5-5.5 7-6.5C9 7.5 6.5 10 2.5 10.5z" />
      <path d="M2.5 10.5C3 8 4 6.5 6 5" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/* -- Most Popular Categories — Icon Set --------------------- */
function TrendingFireIcon() {
  return (
    <svg viewBox="0 0 14 14" width="13" height="13" fill="currentColor" aria-hidden="true">
      <path d="M7 1.5C7 1.5 4 5.2 4 8.3a3 3 0 0 0 6 0c0-1.3-.5-2.7-1.4-3.8C8.6 6 7.8 6.5 7.8 7.8A1.5 1.5 0 0 1 5.2 7.8C5.2 5.8 6.5 3.3 7 1.5Z" />
    </svg>
  );
}

function CrownIcon() {
  return (
    <svg viewBox="0 0 12 12" width="11" height="11" fill="currentColor" aria-hidden="true">
      <path d="M1 9.5h10M1.5 9.5l1-5 2.5 3L6 4.5 7 7.5l2.5-3 1 5H1.5Z" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 18 18" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 4L6 9l6 5" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 18 18" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 4l6 5-6 5" />
    </svg>
  );
}

function PopcatCancerRiskIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 3C9 5.5 11 5.5 12 3" />
      <path d="M8 21C9 18.5 11 18.5 12 21" />
      <path d="M8 3C7 5.5 5 5.5 4 3" />
      <path d="M8 21C7 18.5 5 18.5 4 21" />
      <line x1="5.5" y1="8" x2="10.5" y2="8" />
      <line x1="5" y1="12" x2="11" y2="12" />
      <line x1="5.5" y1="16" x2="10.5" y2="16" />
      <path d="M8 3V21M12 3V21" opacity="0.35" strokeWidth="0.8" />
      <circle cx="18" cy="17" r="3.5" />
      <line x1="20.5" y1="19.5" x2="23" y2="22" />
    </svg>
  );
}

function PopcatHeartHealthIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21C12 21 3.5 14.5 3.5 9A5 5 0 0 1 12 6a5 5 0 0 1 8.5 3C20.5 14.5 12 21 12 21Z" />
      <path d="M4.5 12H7l2-3 2.5 6 2-3.5 1.5 1.5H19.5" strokeWidth="1.5" />
    </svg>
  );
}

function PopcatDiabetesRiskIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3C12 3 6.5 10.5 6.5 15a5.5 5.5 0 0 0 11 0C17.5 10.5 12 3 12 3Z" />
      <circle cx="12" cy="15" r="2.5" />
      <line x1="12" y1="12.5" x2="12" y2="11" />
      <line x1="19" y1="5" x2="22" y2="5" />
      <line x1="20.5" y1="3.5" x2="20.5" y2="6.5" />
    </svg>
  );
}

function PopcatHormoneHealthIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 3h6M10 3v5L6 19h12L14 8V3" />
      <circle cx="9.5" cy="14" r="1.2" />
      <circle cx="12" cy="11" r="1.2" />
      <circle cx="14.5" cy="14" r="1.2" />
      <line x1="9.5" y1="14" x2="12" y2="11" />
      <line x1="12" y1="11" x2="14.5" y2="14" />
    </svg>
  );
}

function PopcatFitnessIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2L6 13h5l-1 9 8-11h-5L14 2Z" />
    </svg>
  );
}

function PopcatMentalWellnessIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 6C8 6 5 8.5 5 11.5c0 2 1.5 3.5 3 4L8 18h8l-.5-2.5C17 14.5 19 13 19 11.5 19 8.5 16 6 12 6Z" />
      <line x1="12" y1="6" x2="12" y2="18" strokeWidth="0.8" opacity="0.4" />
      <path d="M7 11.5C8 10 9 12.5 10 11.5C11 10 11.5 12.5 12 11.5" strokeWidth="1.4" />
      <path d="M12 11.5C12.5 10 13 12.5 14 11.5C15 10 16 12.5 17 11.5" strokeWidth="1.4" />
    </svg>
  );
}

function PopcatFertilityIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4C5 7 7 7 8 10C9 13 7 13 8 16" />
      <path d="M6 4C7 7 5 7 6 10C7 13 9 13 8 16" />
      <line x1="4.8" y1="7" x2="7.2" y2="7" />
      <line x1="5" y1="10" x2="7.5" y2="10" />
      <line x1="4.8" y1="13" x2="7.2" y2="13" />
      <circle cx="16" cy="8" r="2" />
      <line x1="16" y1="10" x2="16" y2="14" />
      <line x1="13.5" y1="12" x2="18.5" y2="12" />
      <line x1="16" y1="14" x2="14" y2="18" />
      <line x1="16" y1="14" x2="18" y2="18" />
    </svg>
  );
}

function PopcatPharmaIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="7" y="7" width="10" height="7" rx="3.5" />
      <line x1="12" y1="7" x2="12" y2="14" />
      <path d="M5 18C6 17 7 19 8 18C9 17 10 19 11 18" strokeWidth="1.4" />
      <path d="M5 20C6 19 7 21 8 20C9 19 10 21 11 20" strokeWidth="1.4" />
      <line x1="7" y1="18.2" x2="7" y2="19.8" strokeWidth="1.2" />
      <line x1="9" y1="17.8" x2="9" y2="20.2" strokeWidth="1.2" />
      <line x1="11" y1="18.2" x2="11" y2="19.8" strokeWidth="1.2" />
    </svg>
  );
}

function GeneticTestCard({ card, onOpen, onAddPanel }) {
  return (
    <article className="gen-test-card" onClick={() => onOpen(card)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onOpen(card)}>
      {card.overlayBadge && (
        <span className={`gen-card-overlay-badge gen-card-overlay-badge--${card.overlayBadge.variant}`}>
          {card.overlayBadge.label}
        </span>
      )}
      <div className="gen-card-inner-top">
        <div className="gen-card-top-row">
          <span className={`gen-card-icon-circle genetic-tone-${card.tone}`}>
            <CardIcon icon={card.icon} />
          </span>
          <span className="gen-card-tag-pill">{card.tag}</span>
        </div>
        <h3 className="gen-card-title">{card.title}</h3>
      </div>
      <p className="gen-card-description">{card.text}</p>
      <div className="gen-card-divider" aria-hidden="true" />
      <div className="gen-card-footer">
        <p className="gen-card-price">{card.price}</p>
        <button
          type="button"
          className="gen-panel-cta"
          onClick={(e) => { e.stopPropagation(); onAddPanel?.(card); }}
          aria-label={`Add ${card.title} panel`}
        >
          <img src={addIcon} alt="" aria-hidden="true" />
          Add Panel
        </button>
      </div>
    </article>
  );
}

function PanelDetailModal({ card, onAddPanel, onClose }) {
  const detail = panelDetails[card.title] || panelDetails["Cancer Risk"];
  const [showAllConditions, setShowAllConditions] = useState(false);
  const expandedConditions = detail.expandedConditions || detail.conditions;
  const hasMoreConditions = expandedConditions.length > detail.conditions.length;
  const displayedConditions = showAllConditions ? expandedConditions : detail.conditions;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    setShowAllConditions(false);
  }, [card.title]);

  return (
    <div className="panel-detail-backdrop" role="presentation" onMouseDown={onClose}>
      <article
        className="panel-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-detail-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="panel-sheet-handle" aria-hidden="true" />
        <header className="panel-detail-header">
          <div className="panel-detail-heading-row">
            <span className="panel-detail-header-icon">
              <img src={cancerPulseIcon} alt="" />
            </span>
            <div>
              <h2 id="panel-detail-title" className="panel-detail-title">{detail.title}</h2>
              <div className="panel-detail-badges">
                {detail.badges.map((badge) => (
                  <span key={badge}>{badge}</span>
                ))}
              </div>
            </div>
          </div>
          <button type="button" className="panel-detail-close" aria-label="Close panel details" onClick={onClose}>
            <CloseIcon />
          </button>
        </header>

        <div className="panel-detail-content">
          <section className="panel-detail-section">
            <h3>Overview</h3>
            <p className="panel-detail-overview">{detail.overview}</p>
          </section>

          <section className="panel-highlight-grid" aria-label="Panel highlights">
            {detail.highlights.map((highlight, index) => (
              <article key={highlight.title} className="panel-highlight-card">
                <div className="panel-highlight-card-heading">
                  <span className="panel-highlight-card-icon">
                    <img src={index === 0 ? dashboardIcons.geneticTest : detailKitIcon} alt="" />
                  </span>
                  <h4>{highlight.title}</h4>
                </div>
                <p>{highlight.text}</p>
              </article>
            ))}
          </section>

          <section className="panel-detail-section">
            <div className="panel-section-heading">
              <h3>Included Conditions</h3>
              <span>{detail.conditionCount}</span>
            </div>
            <ul className="panel-conditions-list">
              {displayedConditions.map((condition) => (
                <li key={condition}>
                  <span className="panel-check-icon"><img src={detailCheckIcon} alt="" /></span>
                  {condition}
                </li>
              ))}
            </ul>
            {hasMoreConditions && (
              <button
                type="button"
                className={`panel-view-all${showAllConditions ? " panel-view-all--open" : ""}`}
                aria-expanded={showAllConditions}
                onClick={() => setShowAllConditions((current) => !current)}
              >
                <span>{showAllConditions ? "Show less" : detail.viewAllLabel}</span>
                <span className="panel-view-all-chevron" aria-hidden="true" />
              </button>
            )}
          </section>

          <section className="panel-included-section">
            <h3>What's Included</h3>
            <div className="panel-included-list">
              {detail.included.map((item) => (
                <article key={item.title} className="panel-included-item">
                  <span className="panel-included-icon"><img src={item.icon} alt="" /></span>
                  <div>
                    <h4>{item.title}</h4>
                    <p>{item.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <footer className="panel-detail-footer">
          <div>
            <p className="panel-detail-price">{card.price}</p>
            <div className="panel-trust-row">
              <span><img src={detailCheckIcon} alt="" /> CLIA Certified</span>
              <span><img src={detailCheckIcon} alt="" /> Secure</span>
            </div>
          </div>
          <button
            type="button"
            className="panel-detail-add"
            onClick={() => {
              onAddPanel(card);
              onClose();
            }}
          >
            <img src={addIcon} alt="" className="w-4" />
            Add Panel
          </button>
        </footer>
      </article>
    </div>
  );
}

function CuratedPackageCard({ card, onAddPanel }) {
  const badgeBgMap = {
    sea: "#41c9b3",
    purple: "#8b5cf6",
    blue: "#3b82f6",
    orange: "#ea8c5a",
    rose: "#e12d2d",
  };

  return (
    <article className="gen-panel-card">
      <div className="gen-panel-inner-top">
        <div className="gen-panel-top-row">
          <span className={`gen-panel-icon-circle genetic-tone-${card.tone}`}>
            <img src={card.icon} alt="" />
          </span>
          <span
            className="gen-panel-badge-pill"
            style={{ background: badgeBgMap[card.tone] || "#8b5cf6", color: "#fff", border: "none" }}
          >
            {card.badge}
          </span>
        </div>
        <h3 className="gen-panel-title">{card.title}</h3>
        <p className="gen-panel-description">{card.text}</p>
      </div>
      <div className="gen-panel-body">
        <div className="gen-panel-chips">
          {card.tags.map((tag) => (
            <span key={tag} className="gen-panel-chip">{tag}</span>
          ))}
        </div>
      </div>
      <div className="gen-card-divider" aria-hidden="true" />
      <div className="gen-panel-footer">
        <div className="gen-panel-price-stack">
          <span className="gen-panel-original">₹24,500</span>
          <span className="gen-panel-price">₹20,000</span>
          <span className="gen-panel-save">Save ₹4,500</span>
        </div>
        <button
          type="button"
          className="gen-panel-cta"
          onClick={() => onAddPanel?.({
            title: card.title,
            text: card.text,
            price: "₹20,000",
            tone: card.tone,
            icon: card.icon,
            chips: card.tags.slice(0, 3),
          })}
        >
          <img src={addIcon} alt="" aria-hidden="true" />
          Add Panel
        </button>
      </div>
    </article>
  );
}
function FilterSheet({ groups = filterGroups, activeTab, onSelect, onClose }) {
  const initialGroupLabel = groups.find((group) => group.label === activeTab || group.subcategories.includes(activeTab))?.label || groups[0].label;
  const [selectedGroupLabel, setSelectedGroupLabel] = useState(initialGroupLabel);
  const selectedGroup = groups.find((group) => group.label === selectedGroupLabel) || groups[0];

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  useEffect(() => {
    setSelectedGroupLabel(initialGroupLabel);
  }, [initialGroupLabel]);

  return createPortal(
    <div className="filter-sheet-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="filter-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Filter categories"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="filter-sheet-handle" />
        <div className="filter-sheet-header">
          <span className="filter-sheet-title">Filter by Category</span>
          <button className="filter-sheet-close" type="button" aria-label="Close filter" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {/* Mobile layout: chips strip + subcategory grid */}
        <div className="filter-sheet-body filter-sheet-body--mobile">
          <div className="filter-sheet-category-strip" aria-label="Categories">
            {groups.map((group) => {
              const isCurrentGroup = selectedGroup.label === group.label;
              const hasActiveSelection = group.label === activeTab || group.subcategories.includes(activeTab);
              return (
                <button
                  key={group.label}
                  type="button"
                  aria-pressed={isCurrentGroup}
                  className={["filter-sheet-category", isCurrentGroup ? "filter-sheet-category--current" : "", hasActiveSelection ? "filter-sheet-category--selected" : ""].join(" ")}
                  onClick={() => setSelectedGroupLabel(group.label)}
                >
                  {group.label}
                </button>
              );
            })}
          </div>
          <div className="filter-sheet-subheader">
            <div>
              <span className="filter-sheet-section-label">{selectedGroup.label}</span>
              <span className="filter-sheet-section-count">{selectedGroup.subcategories.length} subcategories</span>
            </div>
            <button type="button" className="filter-sheet-apply-category" onClick={() => { onSelect(selectedGroup.label); onClose(); }}>
              View all
            </button>
          </div>
          <div className="filter-sheet-subcategory-grid">
            {selectedGroup.subcategories.map((subcategory) => {
              const isActive = activeTab === subcategory;
              return (
                <button key={subcategory} type="button" aria-pressed={isActive} className={["filter-sheet-subcategory", isActive ? "filter-sheet-subcategory--active" : ""].join(" ")} onClick={() => { onSelect(subcategory); onClose(); }}>
                  <span className="filter-sheet-subcategory-label">{subcategory}</span>
                  {isActive && <span className="filter-sheet-check" aria-hidden="true"><TinyCheckIcon /></span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop layout: two-panel sidebar + subcategory area */}
        <div className="filter-sheet-desktop">
          <nav className="filter-sheet-desktop-nav" aria-label="Categories">
            {groups.map((group) => {
              const isCurrentGroup = selectedGroup.label === group.label;
              const hasActiveSelection = group.label === activeTab || group.subcategories.includes(activeTab);
              return (
                <button
                  key={group.label}
                  type="button"
                  aria-pressed={isCurrentGroup}
                  className={["filter-sheet-desktop-navitem", isCurrentGroup ? "filter-sheet-desktop-navitem--active" : "", hasActiveSelection ? "filter-sheet-desktop-navitem--selected" : ""].join(" ")}
                  onClick={() => setSelectedGroupLabel(group.label)}
                >
                  {group.label}
                  {hasActiveSelection && !isCurrentGroup && <span className="filter-sheet-desktop-dot" aria-hidden="true" />}
                </button>
              );
            })}
          </nav>
          <div className="filter-sheet-desktop-panel">
            <div className="filter-sheet-subheader">
              <div>
                <span className="filter-sheet-section-label">{selectedGroup.label}</span>
                <span className="filter-sheet-section-count">{selectedGroup.subcategories.length} subcategories</span>
              </div>
              <button type="button" className="filter-sheet-apply-category" onClick={() => { onSelect(selectedGroup.label); onClose(); }}>
                View all
              </button>
            </div>
            <div className="filter-sheet-subcategory-grid">
              {selectedGroup.subcategories.map((subcategory) => {
                const isActive = activeTab === subcategory;
                return (
                  <button key={subcategory} type="button" aria-pressed={isActive} className={["filter-sheet-subcategory", isActive ? "filter-sheet-subcategory--active" : ""].join(" ")} onClick={() => { onSelect(subcategory); onClose(); }}>
                    <span className="filter-sheet-subcategory-label">{subcategory}</span>
                    {isActive && <span className="filter-sheet-check" aria-hidden="true"><TinyCheckIcon /></span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function FilterButton({ onClick }) {
  return (
    <button
      type="button"
      className="filter-chip-trigger"
      aria-label="Open filter"
      onClick={onClick}
    >
      <img src={filterIcon} alt="" className="w-4" />
    </button>
  );
}

function PackageFilterChips({ activeTab, onTabChange }) {
  return (
    <div className="package-filter-row flex items-center">
      <div className="package-filter-scroll flex min-w-0 flex-1 gap-2 overflow-x-auto">
        {panelTabs.map((tab) => {
          const isActive = activeTab === tab || getFilterGroupLabel(activeTab) === tab;

          return (
            <button
              key={tab}
              type="button"
              aria-pressed={isActive}
              onClick={() => onTabChange?.(tab)}
              className={[
                "type-chip shrink-0 rounded-full border px-3.5 py-1.5 transition-colors duration-150",
                isActive
                  ? "border-nucleotide-purple bg-nucleotide-purple text-white shadow-[0_0.45rem_1rem_rgba(139,92,246,0.24)]"
                  : "border-nucleotide-lavender bg-white text-[#494454] hover:border-nucleotide-purple/40 hover:text-nucleotide-purple",
              ].join(" ")}
            >
              {tab}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CuratedPackagesView({ onAddPanel }) {
  return (
    <section className="curated-packages-view">
      <div className="curated-bento-grid">
        {curatedPackageCards.map((card) => (
          <CuratedPackageCard key={card.title} card={card} onAddPanel={onAddPanel} />
        ))}
      </div>
    </section>
  );
}

function TrendingCard({ card, onOpen, onAddPanel }) {
  return (
    <article className="tcard">
      {/* Header area — coloured gradient bg with icon + title + discount */}
      <div className={`tcard-head tcard-head--${card.tone}`}>
        <div className="tcard-head-top">
          <span className={`tcard-icon genetic-tone-${card.tone}`}>
            <CardIcon icon={card.icon} />
          </span>
          {card.overlayBadge && (
            <span className={`tcard-badge tcard-badge--${card.overlayBadge.variant}`}>
              {card.overlayBadge.variant === "chosen" ? <StarIcon /> : <LeafIcon />}
              {card.overlayBadge.label}
            </span>
          )}
        </div>
        <h3 className="tcard-title">{card.title}</h3>
        <p className="tcard-desc">{card.text}</p>
      </div>

      {/* Meta row */}
      <div className="tcard-meta">
        <span className="tcard-meta-item">
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
            <circle cx="8" cy="8" r="6" /><path d="M8 5v3.5l2 1.5" />
          </svg>
          <span>Reports within <strong>{card.reportsIn}</strong></span>
        </span>
        <span className="tcard-meta-sep" aria-hidden="true" />
        <span className="tcard-meta-item">
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 4h10M3 8h7M3 12h5" />
          </svg>
          <span><strong>{card.testsCount}</strong> included</span>
        </span>
      </div>

      {/* Divider */}
      <div className="tcard-divider" aria-hidden="true" />

      {/* Footer — price + two buttons */}
      <div className="tcard-footer">
        <div className="tcard-price-block">
          <span className="tcard-original">{card.originalPrice}</span>
          <div className="tcard-price-row">
            <span className="tcard-price">{card.price}</span>
            <span className="tcard-discount">{card.discount}</span>
          </div>
        </div>
        <div className="tcard-actions">
          <button type="button" className="tcard-btn-outline" onClick={() => onOpen(card)}>
            View Details
          </button>
          <button type="button" className="tcard-btn-fill" onClick={() => onAddPanel(card)}>
            + Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
}

function TrendingTestsSection({ onOpen, onAddPanel }) {
  const items = trendingTests;
  const [index, setIndex] = useState(0);

  const prev = () => setIndex((i) => (i === 0 ? items.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === items.length - 1 ? 0 : i + 1));

  useEffect(() => {
    const t = setInterval(next, 4200);
    return () => clearInterval(t);
  }, [index]);

  return (
    <section className="trending-tests-section genetic-section-block">
      <div className="gen-section-header gen-section-header--centered build-panel-section-head">
        <div className="gen-section-heading-group">
          <h2 className="type-section-title">Trending Tests</h2>
          <p className="gen-section-subtitle">Most booked genetic panels this month.</p>
        </div>
      </div>

      {/* Mobile single-card carousel */}
      <div className="trending-carousel-mobile">
        <TrendingCard card={items[index]} onOpen={onOpen} onAddPanel={onAddPanel} />
        <div className="trending-dots">
          {items.map((_, i) => (
            <button
              key={i}
              className={`popcats-oh-dot${i === index ? " popcats-oh-dot--active" : ""}`}
              onClick={() => setIndex(i)}
              type="button"
              aria-label={`Go to ${items[i].title}`}
            />
          ))}
        </div>
      </div>

      {/* Desktop 4-col grid */}
      <div className="trending-grid-desktop">
        {items.map((card) => (
          <TrendingCard key={card.title} card={card} onOpen={onOpen} onAddPanel={onAddPanel} />
        ))}
      </div>
    </section>
  );
}

function RecommendedPanelCard({ panel, onAddPanel }) {
  return (
    <article className="gen-panel-card">
      <div className="gen-panel-inner-top">
        {/* Icon left, badge right */}
        <div className="gen-panel-top-row">
          <span className={`gen-panel-icon-circle genetic-tone-${panel.tone}`}>
            <img src={panel.icon} alt="" />
          </span>
          <span className={`gen-panel-badge-pill ${panel.badgeColor}`}>
            {panel.badge}
          </span>
        </div>
        {/* Title then description directly below */}
        <h3 className="gen-panel-title">{panel.title}</h3>
        <p className="gen-panel-description">{panel.text}</p>
      </div>
      <div className="gen-panel-body">
        {/* Markers count */}
        <span className="gen-panel-markers">{panel.markers}</span>
        {/* Category chips below markers */}
        <div className="gen-panel-chips">
          {panel.categories.map((cat) => (
            <span key={cat} className="gen-panel-chip">{cat}</span>
          ))}
        </div>
      </div>
      <div className="gen-card-divider" aria-hidden="true" />
      <div className="gen-panel-footer">
        <div className="gen-panel-price-stack">
          <span className="gen-panel-original">{panel.originalPrice}</span>
          <span className="gen-panel-price">{panel.price}</span>
          <span className="gen-panel-save">Save {panel.saving}</span>
        </div>
        <button
          type="button"
          className="gen-panel-cta"
          onClick={() => onAddPanel?.({ title: panel.title, text: panel.text, price: panel.price, tone: panel.tone, icon: panel.icon, chips: panel.categories })}
        >
          <img src={addIcon} alt="" aria-hidden="true" />
          Add Panel
        </button>
      </div>
    </article>
  );
}

function FloatingCart({ selectedPanels, onRemovePanel, onCheckout }) {
  const [expanded, setExpanded] = useState(false);
  const [badgeKey, setBadgeKey] = useState(0);
  const prevCount = useRef(selectedPanels.length);
  const selectedCount = selectedPanels.length;
  const subtotal = selectedPanels.reduce((sum, panel) => sum + getPanelPriceValue(panel), 0);
  const remaining = Math.max(0, minimumCheckoutTotal + 1 - subtotal);
  const progressPct = Math.min(100, (subtotal / (minimumCheckoutTotal + 1)) * 100);
  const minimumMet = subtotal >= minimumCheckoutTotal + 1;

  useEffect(() => {
    if (selectedPanels.length > prevCount.current) {
      setBadgeKey((k) => k + 1);
    }
    if (selectedPanels.length === 0) {
      setExpanded(false);
    }
    prevCount.current = selectedPanels.length;
  }, [selectedPanels.length]);

  if (selectedCount === 0) return null;

  return (
    <>
      {expanded && (
        <div
          className="fcart-backdrop"
          onClick={() => setExpanded(false)}
          aria-hidden="true"
        />
      )}

      {/* Collapsed pill CTA */}
      {!expanded && selectedCount > 0 && (
        <button
          type="button"
          className="fpb-pill-btn"
          onClick={() => setExpanded(true)}
          aria-label={`Panel builder — ${selectedCount} panel${selectedCount !== 1 ? "s" : ""}, ${formatInr(subtotal)}`}
        >
          <span className="fpb-pill-icon">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" width="18" height="18">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M16 10a4 4 0 0 1-8 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="fpb-pill-count">{selectedCount} Panel{selectedCount !== 1 ? "s" : ""}</span>
          <span className="fpb-pill-divider" aria-hidden="true" />
          <span className="fpb-pill-price">{formatInr(subtotal)}</span>
        </button>
      )}

      {/* Expanded drawer */}
      {expanded && (
        <div className="fcart-root">
          <div className="fcart-drawer">

            {/* Header */}
            <div className="fcart-drawer-header">
              <div className="fcart-drawer-heading">
                <span className="fcart-drawer-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                    <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <div>
                  <span className="fcart-drawer-title">Panel Builder</span>
                  <span className="fcart-drawer-subtitle">Home collection (saliva kit)</span>
                </div>
              </div>
              <button
                type="button"
                className="fcart-close"
                aria-label="Close panel builder"
                onClick={() => setExpanded(false)}
              >
                <CloseIcon />
              </button>
            </div>

            {/* Price + minimum row */}
            <div className="fcart-price-row">
              <span className="fcart-price-total">{formatInr(subtotal)}</span>
              <span className="fcart-price-min">of {formatInr(minimumCheckoutTotal)}</span>
            </div>

            {/* Progress bar */}
            <div className="fpb-min-indicator">
              <div className="fpb-min-track">
                <div
                  className={`fpb-min-fill${minimumMet ? " fpb-min-fill--met" : ""}`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className={`fpb-min-label${minimumMet ? " fpb-min-label--met" : ""}`}>
                {minimumMet
                  ? "Ready to proceed!"
                  : `Add ${formatInr(remaining)} more to unlock checkout`}
              </p>
            </div>

            {/* Item list */}
            <div className="fcart-list">
              {selectedPanels.map((panel) => (
                <div key={panel.title} className="fcart-item">
                  <span className={`fcart-item-icon genetic-tone-${panel.tone}`}>
                    <CardIcon icon={panel.icon} />
                  </span>
                  <span className="fcart-item-name">{panel.title}</span>
                  <span className="fcart-item-price">{panel.price}</span>
                  <button
                    type="button"
                    className="fcart-item-remove"
                    aria-label={`Remove ${panel.title}`}
                    onClick={() => onRemovePanel(panel.title)}
                  >
                    <CloseIcon />
                  </button>
                </div>
              ))}
            </div>

            <div className="fcart-total-row">
              <span>Total</span>
              <strong>{formatInr(subtotal)}</strong>
            </div>

            <button
              type="button"
              className="fcart-checkout-btn fpb-addcart-btn"
              disabled={!minimumMet}
              title={!minimumMet ? `Add ${formatInr(remaining)} more to continue` : undefined}
              onClick={() => { setExpanded(false); onCheckout(); }}
            >
              + Proceed to checkout
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* -- Most Popular Categories — OrangeHealth-style carousel -- */
const popcatIconMap = {
  "Cancer Risk":        <PopcatCancerRiskIcon />,
  "Heart Health":       <PopcatHeartHealthIcon />,
  "Diabetes Risk":      <PopcatDiabetesRiskIcon />,
  "Hormone Health":     <PopcatHormoneHealthIcon />,
  "Fitness Potential":  <PopcatFitnessIcon />,
  "Mental Wellness":    <PopcatMentalWellnessIcon />,
  "Fertility & Family": <PopcatFertilityIcon />,
  "Pharmacogenomics":   <PopcatPharmaIcon />,
};

function MostPopularCategories() {
  const items = popularCategoriesExtended;
  const [index, setIndex] = useState(0);

  const prev = () => setIndex((i) => (i === 0 ? items.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === items.length - 1 ? 0 : i + 1));

  useEffect(() => {
    const t = setInterval(next, 4200);
    return () => clearInterval(t);
  }, [index]);

  const item = items[index];

  return (
    <section className="popcats-section genetic-section-block">
      {/* Section label */}
      <div className="popcats-oh-label">
        <span className="type-eyebrow popcats-eyebrow">
          <TrendingFireIcon />
          Most Popular Categories
        </span>
      </div>

      {/* Main carousel body */}
      <div className="popcats-oh-body">
        {/* Left arrow */}
        <button className="popcats-oh-arrow popcats-oh-arrow--left" onClick={prev} type="button" aria-label="Previous">
          <ChevronLeftIcon />
        </button>

        {/* Left: dark card */}
        <div className="popcats-oh-card">
          <div className="popcats-oh-card-header">
            <span className={`popcats-pill-badge popcats-badge--${item.tagVariant}`}>{item.tag}</span>
            <span className="popcats-oh-markers">{item.markers}</span>
          </div>
          <div className="popcats-oh-card-mid">
            <div className={`popcats-oh-icon-circle genetic-tone-${item.tone}`}>
              {popcatIconMap[item.title]}
            </div>
            <div>
              <p className="popcats-oh-card-title">{item.title}</p>
              <p className="popcats-oh-stat">{item.stat}</p>
            </div>
          </div>
          <div className="popcats-oh-card-footer">
            <div className="popcats-oh-price-row">
              <span className="popcats-oh-price">{item.price}</span>
              <span className="popcats-oh-original">{item.originalPrice}</span>
              <span className="popcats-oh-discount">{item.discount}</span>
            </div>
            <div className="popcats-oh-actions">
              <button className="popcats-oh-btn-secondary" type="button">View Details</button>
              <button className="popcats-oh-btn-primary" type="button">+ Add Panel</button>
            </div>
          </div>
        </div>

        {/* Right: headline + description */}
        <div className="popcats-oh-right">
          <h2 className="popcats-oh-headline">{item.headline}</h2>
          <p className="popcats-oh-desc">{item.description}</p>
          <div className="popcats-oh-trust">
            <div className="popcats-oh-trust-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2Z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <div>
              <p className="popcats-oh-trust-title">Clinically validated</p>
              <p className="popcats-oh-trust-sub">CAP & NABL certified labs</p>
            </div>
          </div>
        </div>

        {/* Right arrow */}
        <button className="popcats-oh-arrow popcats-oh-arrow--right" onClick={next} type="button" aria-label="Next">
          <ChevronRightIcon />
        </button>
      </div>

      {/* Dot indicators */}
      <div className="popcats-oh-dots">
        {items.map((_, i) => (
          <button
            key={i}
            className={`popcats-oh-dot${i === index ? " popcats-oh-dot--active" : ""}`}
            onClick={() => setIndex(i)}
            type="button"
            aria-label={`Go to ${items[i].title}`}
          />
        ))}
      </div>
    </section>
  );
}

function WhyChooseUsGenetics() {
  return (
    <section className="page-section home-section--whychoose" style={{ background: "#fff" }}>
      <div className="page-inner">
        <div className="home-section-header">
          <h2 className="type-section" style={{ color: "#101129", margin: 0, textAlign: "center" }}>
            Why Choose Nucleotide
          </h2>
          <p className="type-lead" style={{ color: "#828282", margin: 0, textAlign: "center", maxWidth: "min(720px, 100%)", fontFamily: "Inter, sans-serif", fontSize: "16px" }}>
            Precision genomics backed by certified science and human expertise.
          </p>
        </div>
        <div className="grid-4 why-choose-grid">
          {GEN_WHY_FEATURES.map((f) => (
            <div key={f.title} className="why-choose-card">
              <div className="why-choose-icon">
                <img src={f.icon} alt="" width={24} height={24} style={{ filter: "brightness(0) invert(1)" }} aria-hidden="true" />
              </div>
              <div className="why-choose-text">
                <div className="type-subhead why-choose-card__title" style={{ color: "#101129" }}>{f.title}</div>
                <div className="type-lead why-choose-card__desc" style={{ color: "#828282" }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksView() {
  return (
    <section className="how-it-works-view genetic-how-works-section">
      <img src={howWorksDecoA} alt="" aria-hidden="true" className="how-works-deco how-works-deco--tl" />
      <img src={howWorksDecoB} alt="" aria-hidden="true" className="how-works-deco how-works-deco--bl" />
      <img src={howWorksDecoB} alt="" aria-hidden="true" className="how-works-deco how-works-deco--tr" />
      <img src={howWorksDecoA} alt="" aria-hidden="true" className="how-works-deco how-works-deco--br" />

      <div className="genetic-how-works-inner">
        <div className="gen-section-header gen-section-header--centered genetic-how-works-header">
          <div className="gen-section-heading-group">
            <h2 className="type-section-title">How It Works</h2>
            <p className="gen-section-subtitle">Built to make genetic testing simple, clinical, and easy to understand.</p>
          </div>
        </div>

        <ol className="genetic-how-works-grid">
          {howItWorksSteps.map((step) => (
            <li key={step.step} className="how-works-step genetic-how-works-step">
              <div className="how-works-step__badge">Step {Number(step.step)}</div>
              <div className="how-works-step__card">
                <p className="how-works-step__desc genetic-how-works-desc">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function ExploreCardsScroll({ cards, onOpen, onAddPanel }) {
  const scrollRef = useRef(null);
  const [visibleIndex, setVisibleIndex] = useState(0);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild?.offsetWidth || 1;
    const gap = 16;
    const index = Math.round(el.scrollLeft / (cardWidth + gap));
    setVisibleIndex(Math.min(index, cards.length - 1));
  };

  const remaining = cards.length - visibleIndex - 1;

  return (
    <div className="explore-cards-wrap">
      <div
        ref={scrollRef}
        className="gen-recommended-scroll genetic-explore-scroll"
        onScroll={handleScroll}
      >
        {cards.map((card) => (
          <article
            key={card.title}
            className="gen-panel-card gen-explore-card"
            role="button"
            tabIndex={0}
            onClick={() => onOpen(card)}
            onKeyDown={(e) => e.key === "Enter" && onOpen(card)}
          >
            {card.overlayBadge && (
              <span className={`gen-card-overlay-badge gen-card-overlay-badge--${card.overlayBadge.variant}`}>
                {card.overlayBadge.label}
              </span>
            )}
            <div className="gen-panel-inner-top">
              <div className="gen-panel-top-row">
                <span className={`gen-panel-icon-circle genetic-tone-${card.tone}`}>
                  <CardIcon icon={card.icon} />
                </span>
                <span className="gen-card-tag-pill">{card.tag}</span>
              </div>
              <h3 className="gen-panel-title">{card.title}</h3>
              <p className="gen-panel-description">{card.text}</p>
            </div>
            <div className="gen-card-divider" aria-hidden="true" />
            <div className="gen-panel-footer">
              <p className="gen-panel-price">{card.price}</p>
              <button
                type="button"
                className="gen-panel-cta"
                onClick={(e) => { e.stopPropagation(); onAddPanel(card); }}
                aria-label={`Add ${card.title} panel`}
              >
                <img src={addIcon} alt="" aria-hidden="true" />
                Add Panel
              </button>
            </div>
          </article>
        ))}
      </div>
      <div className="explore-scroll-footer" aria-hidden="true">
        <div className="explore-scroll-dots">
          {cards.map((_, i) => (
            <span key={i} className={`explore-dot${i === visibleIndex ? " explore-dot--active" : ""}`} />
          ))}
        </div>
        <span className="explore-scroll-pill" aria-live="polite" aria-atomic="true">
          {visibleIndex + 1}/{cards.length}
        </span>
      </div>
    </div>
  );
}

export function GeneticTestingExperience({ onMenuClick }) {
  const { isLoggedIn, openLoginModal } = useAuth();
  const navigate = useNavigate();
  const [selectedPanel, setSelectedPanel] = useState(null);
  const [selectedPanels, setSelectedPanels] = useState(() => {
    try {
      const saved = localStorage.getItem("nucleotide_panel_builder");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  useEffect(() => {
    try { localStorage.setItem("nucleotide_panel_builder", JSON.stringify(selectedPanels)); } catch {}
  }, [selectedPanels]);
  const [activeSectionTab, setActiveSectionTab] = useState(sectionTabs[0]);
  const [activePanelTab, setActivePanelTab] = useState(panelTabs[0]);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const promptLogin = () => {
    savePostLoginRedirect(`${window.location.pathname}${window.location.search}${window.location.hash}`);
    openLoginModal();
  };
  const addPanelToSelection = (panel) => {
    setSelectedPanels((currentPanels) => {
      if (currentPanels.some((currentPanel) => currentPanel.title === panel.title)) {
        return currentPanels;
      }

      return [...currentPanels, panel];
    });
  };
  const handleAddPanel = (panel) => {
    addPanelToSelection(panel);
  };
  const handleRemovePanel = (panelTitle) => {
    setSelectedPanels((currentPanels) => currentPanels.filter((panel) => panel.title !== panelTitle));
  };
  const saveGeneticCheckout = () => {
    try {
      sessionStorage.setItem("nucleotide_checkout", JSON.stringify(buildGeneticCheckoutSession(selectedPanels)));
    } catch {
      // Non-critical; the checkout app will still render its protected route.
    }
  };
  const handleCartClick = () => {
    if (selectedPanels.length > 0 && !isLoggedIn) {
      promptLogin();
      return;
    }

    saveGeneticCheckout();
    try { localStorage.removeItem("nucleotide_panel_builder"); } catch {}
    navigate("/genetic-tests/cart");
  };
  const handleCheckout = () => {
    saveGeneticCheckout();
    try { localStorage.removeItem("nucleotide_panel_builder"); } catch {}
    window.location.assign("/genetic-tests/cart");
  };

  return (
    <div className="genetic-testing-page min-h-screen overflow-x-hidden bg-white font-poppins text-nucleotide-ink">
      <Navbar
        logoSrc="/favicon.svg"
        logoAlt="Nucleotide"
        links={GENETIC_NAV_LINKS}
        ctaLabel="My Cart"
        onCtaClick={handleCartClick}
        activeHrefOverride="/genetics"
      />
      <main className="genetic-testing-main relative mx-auto w-full max-w-[110rem] px-[clamp(1rem,2.6vw,3rem)] pb-[clamp(4rem,6vw,5.5rem)] pt-[clamp(1.35rem,2.35vw,2.8rem)]">
        <div className="genetic-shell-grid genetic-shell-grid--full relative grid gap-[clamp(1.25rem,1.8vw,2rem)] xl:grid-cols-[minmax(0,1fr)] xl:items-start">
          <div className="genetic-content-stack min-w-0">
            <HeroSection />

            {/* Tabbed section: Build Your Panel / Curated Packages */}
            <section className="genetic-section-block genetic-tabs-section">
              <div className="gen-section-header gen-section-header--centered genetic-approach-header">
                <div className="gen-section-heading-group">
                  <h2 className="type-section-title">Choose Your Approach</h2>
                  <p className="gen-section-subtitle">Build your personalized panel or explore expert curated packages</p>
                </div>
              </div>

              {/* Sticky tab bar */}
              <div className="genetic-tab-bar sticky top-[5rem] z-30">
                {sectionTabs.map((tab) => {
                  const isActive = activeSectionTab === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setActiveSectionTab(tab)}
                      className={[
                        "genetic-tab-btn",
                        isActive ? "genetic-tab-btn--active" : "",
                      ].join(" ")}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>
              {(activeSectionTab === "Build Your Panel" || activeSectionTab === "Curated Packages") && <MobileBuildPanelControls />}

              {/* Tab: Build Your Panel */}
              {activeSectionTab === "Build Your Panel" && (
                <div className="genetic-tab-content">
                  {/* Category cards */}
                  <ExploreCardsScroll cards={categoryCards} onOpen={setSelectedPanel} onAddPanel={handleAddPanel} />

                  {/* Trending Tests — OrangeHealth-style carousel */}
                  {/* Recommended Panels — below explore cards */}
                  <div className="build-panel-recommended">
                    <div className="gen-section-header gen-section-header--centered build-panel-section-head">
                      <div className="gen-section-heading-group">
                        <h2 className="type-section-title">Recommended Panels</h2>
                        <p className="gen-section-subtitle">Expert-curated bundles for whole-body genomic insights.</p>
                      </div>
                    </div>
                    <div className="gen-recommended-scroll">
                      {recommendedPanels.map((panel) => (
                        <RecommendedPanelCard
                          key={panel.title}
                          panel={panel}
                          onAddPanel={handleAddPanel}
                        />
                      ))}
                    </div>
                  </div>
                  <WhyChooseUsGenetics />
                  <div className="build-panel-how-works">
                    <HowItWorksView />
                  </div>
                </div>
              )}

              {/* Tab: Curated Packages */}
              {activeSectionTab === "Curated Packages" && (
                <div className="genetic-tab-content">
                  <CuratedPackagesView onAddPanel={handleAddPanel} />
                  <WhyChooseUsGenetics />
                  <div className="build-panel-how-works">
                    <HowItWorksView />
                  </div>
                </div>
              )}
            </section>

            {showCategoryFilter && (
              <FilterSheet
                activeTab={activePanelTab}
                onSelect={setActivePanelTab}
                onClose={() => setShowCategoryFilter(false)}
              />
            )}

          </div>

        </div>
      </main>
      {selectedPanel && (
        <PanelDetailModal
          card={selectedPanel}
          onAddPanel={handleAddPanel}
          onClose={() => setSelectedPanel(null)}
        />
      )}
      <FloatingCart
        selectedPanels={selectedPanels}
        onRemovePanel={handleRemovePanel}
        onCheckout={handleCheckout}
      />
    </div>
  );
}



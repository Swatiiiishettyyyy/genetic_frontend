import { useState } from "react";
import { BrandLogo } from "../components/BrandLogo.jsx";
import addIcon from "../assets/Genetics/material-symbols_add.svg";
import filterIcon from "../assets/Genetics/mdi_filter-outline.svg";
import cartIcon from "../assets/Genetics/Frame.svg";
import profileIcon from "../assets/Genetics/Frame-1.svg";
import flaskIcon from "../assets/Genetics/Icon-1.svg";
import wgsIcon from "../assets/Genetics/Icon-23.svg";
import certifiedIcon from "../assets/Genetics/Icon-22.svg";
import counselorIcon from "../assets/Genetics/Icon-18.svg";
import cancerPulseIcon from "../assets/Genetics/Icon-15.svg";
import hematologyIcon from "../assets/Genetics/Icon-13.svg";
import neuroHeadIcon from "../assets/Genetics/Icon-18.svg";
import cardioMonitorIcon from "../assets/Genetics/Icon-8.svg";
import metabolicIcon from "../assets/Genetics/Icon-5.svg";
import familyIcon from "../assets/Genetics/Icon-4.svg";
import brainIcon from "../assets/Genetics/Icon-16.svg";
import wellnessIcon from "../assets/Genetics/Icon-3.svg";
import cardiacProfileIcon from "../assets/Genetics/Icon-14.svg";
import timeIcon from "../assets/Genetics/Icon-9.svg";
import lockIcon from "../assets/Genetics/Icon-20.svg";
import checkoutIcon from "../assets/Genetics/Icon-21.svg";
import chevronIcon from "../assets/Genetics/Icon.svg";
import curatedSportsIcon from "../assets/Genetics/curated-packages/Icon-11.svg";
import curatedChildIcon from "../assets/Genetics/curated-packages/material-symbols_sports-handball.svg";
import curatedFamilyIcon from "../assets/Genetics/curated-packages/Icon-9.svg";
import curatedHairIcon from "../assets/Genetics/curated-packages/streamline-ultimate_hair-skin-bold.svg";

const trustBadges = [
  { label: "WGS Technology", icon: wgsIcon },
  { label: "CLIA Certified Lab", icon: certifiedIcon },
  { label: "Secure Data Handling", icon: lockIcon },
  { label: "Genetic Counsellor Support", icon: counselorIcon },
];

const stats = [
  { value: "21", label: "Disease Categories" },
  { value: "635+", label: "Genetic Insights" },
  { value: "12-15", label: "Day Turnaround" },
];

const categories = ["All Categories", "Most Popular", "New Additions", "Cancer Risk"];
const sectionTabs = ["Build Your Panel", "Curated Packages", "How It Works"];
const panelTabs = ["All Categories", "Most Popular", "Preventive Care", "Longevity", "Hormones", "Fitness", "Family Planning", "Mental Wellness"];

const categoryCards = [
  {
    title: "Cancer Risk",
    text: "Identify risks for hereditary conditions and major health events.",
    price: "₹6,999",
    tag: "Popular",
    icon: cancerPulseIcon,
    tone: "rose",
  },
  {
    title: "Hematology",
    text: "Deep dive into blood-related traits and genetic conditions.",
    price: "₹6,999",
    tag: "Blood Health",
    icon: hematologyIcon,
    tone: "sea",
  },
  {
    title: "Hormone Health",
    text: "Comprehensive analysis of hormone production and receptor sensitivity.",
    price: "₹6,999",
    tag: "Endocrine",
    icon: "hormone-drop",
    tone: "purple",
  },
  {
    title: "Neuropsychiatry",
    text: "Genetic factors influencing mental wellness and behavioral health.",
    price: "₹6,999",
    tag: "Mental Health",
    icon: neuroHeadIcon,
    tone: "blue",
  },
  {
    title: "Cardio Health",
    text: "Cardiovascular risks, cholesterol traits, and blood pressure pathways.",
    price: "₹6,999",
    tag: "Heart",
    icon: cardioMonitorIcon,
    tone: "rose",
  },
  {
    title: "Neurology",
    text: "Alzheimer's risk, cognitive traits, and neurodegenerative markers.",
    price: "₹6,999",
    tag: "Brain",
    icon: brainIcon,
    tone: "blue",
  },
  {
    title: "Metabolic Care",
    text: "Insulin sensitivity, nutrient processing, and metabolic efficiency.",
    price: "₹6,999",
    tag: "Metabolic",
    icon: metabolicIcon,
    tone: "sea",
  },
  {
    title: "Reproductive & Fertility",
    text: "Determine if you carry genetic variants for inherited conditions.",
    price: "₹6,999",
    tag: "Family",
    icon: familyIcon,
    tone: "purple",
  },
];

const recommendedPanels = [
  {
    title: "Comprehensive Cancer Risk",
    text: "Analysis of genes associated with elevated risk for breast, ovarian, colorectal, and other hereditary cancers.",
    price: "$249",
    saving: "View 84 Conditions",
  },
  {
    title: "Cardiac Risk Profile",
    text: "Evaluates genetic markers linked to familial hypercholesterolemia, cardiomyopathies, and arrhythmias.",
    price: "$199",
    saving: "View 32 Conditions",
  },
];

const curatedPackageCards = [
  {
    title: "Sports and Fitness",
    text: "Athletic performance, injury risk, nutrition & recovery genetics",
    badge: "Gym Favourite",
    icon: curatedSportsIcon,
    tone: "sea",
    tags: ["Sports Genomics", "Musculoskeletal", "Muscular", "Metabolic"],
  },
  {
    title: "Paediatric & Child Health",
    text: "Developmental conditions, rare diseases, childhood risk",
    badge: "For Kids",
    icon: curatedChildIcon,
    tone: "purple",
    tags: ["Congenital", "Neurodevelopmental", "Hematologic", "Immunological"],
  },
  {
    title: "Reproductive & Fertility",
    text: "Carrier screening, fertility genomics, obstetric risk",
    badge: "Family Planning",
    icon: curatedFamilyIcon,
    tone: "blue",
    tags: ["Reproductive & Fertility", "Endocrine", "Hematologic", "Congenital"],
  },
  {
    title: "Dermatology, Aesthetics & Hair",
    text: "Skin conditions, hair loss genetics, aesthetic markers",
    badge: "Aesthetics",
    icon: curatedHairIcon,
    tone: "orange",
    tags: ["Dermatologic Hair & Nail", "Endocrine", "Immunological", "Vitamins"],
  },
];

const faqs = [
  "Which panels should I choose if I'm not sure?",
  "Can I unlock more panels later without re-testing?",
  "How secure is my genetic data?",
];

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-nucleotide-lavender/70 bg-white/95 shadow-[0_0.25rem_6rem_rgba(139,92,246,0.16)] backdrop-blur-xl">
      <div className="mx-auto flex w-full items-center justify-between gap-8 px-[clamp(1.25rem,4.2vw,5rem)] py-3">
        <BrandLogo variant="dark" className="h-[clamp(1.8rem,2.25vw,2.35rem)] w-[clamp(8rem,11vw,11.5rem)]" />
        <nav className="hidden items-center gap-8 font-poppins text-sm font-medium xl:flex">
          <a className="text-nucleotide-purple" href="#hero">Home</a>
          <a className="text-nucleotide-ink" href="#orders">Orders</a>
          <a className="text-nucleotide-ink" href="#genes">My Genes</a>
        </nav>
        <div className="flex items-center gap-3">
          <button className="relative grid aspect-square w-10 place-items-center rounded-full border border-nucleotide-lavender bg-nucleotide-surface" aria-label="Account">
            <img src={profileIcon} alt="" className="w-5" />
            <span className="absolute -left-1 -top-1 grid aspect-square w-5 place-items-center rounded-full bg-nucleotide-lavender text-[0.65rem] font-semibold text-nucleotide-ink">1</span>
          </button>
          <button className="inline-flex items-center gap-3 rounded-full border border-nucleotide-lavender bg-gradient-to-r from-nucleotide-night to-nucleotide-indigo px-5 py-2.5 font-poppins text-sm font-medium text-white">
            <img src={cartIcon} alt="" className="w-5" />
            My Cart
          </button>
        </div>
      </div>
    </header>
  );
}

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

function PackageIcon({ name }) {
  return <img src={name} alt="" className="h-4 w-4 object-contain" />;
}

function HeroSection() {
  return (
    <section id="hero" className="overflow-hidden rounded-[1.25rem] border border-[#cbc3d7]/30 bg-gradient-to-r from-nucleotide-night to-nucleotide-indigo p-[clamp(1.25rem,1.9vw,2rem)] text-white shadow-soft">
      <div className="relative z-10 space-y-4">
        <div className="max-w-[50rem] space-y-3">
          <h1 className="font-poppins text-[clamp(1.7rem,2.05vw,2.2rem)] font-medium leading-tight tracking-[-0.03em]">
            Genomic Health <span className="text-nucleotide-purple">Intelligence</span>
          </h1>
          <p className="max-w-[52rem] font-inter text-[clamp(0.8rem,0.82vw,0.92rem)] leading-relaxed text-white/90">
            Curate your personalized medical testing panel. Select from our advanced array of clinical-grade genomic screens to uncover predispositions, optimize longevity, and achieve peak performance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {trustBadges.map((badge) => (
            <span key={badge.label} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-[#15142f] to-[#2b2c59] px-3 py-1.5 font-inter text-[0.64rem] font-semibold text-white shadow-sm">
              <img src={badge.icon} alt="" className="h-3 w-3 object-contain" />
              {badge.label}
            </span>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-[#2a2c58] bg-white/[0.02] p-3 text-center backdrop-blur-md">
              <p className="font-inter text-xl font-bold tracking-tight">{stat.value}</p>
              <p className="mt-1 font-inter text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#818181]">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StickyControls({ activeSectionTab, onSectionTabChange, showBuildFilters = true }) {
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  return (
    <div className="sticky top-[5rem] z-30 rounded-lg bg-[#faf8ff]/90 pb-5 backdrop-blur-lg">
      <div className="flex min-h-[3.6rem] items-end gap-8 overflow-x-auto border-b border-[#cbc3d7]/20 px-4 font-inter text-sm">
        {sectionTabs.map((tab) => {
          const isActive = activeSectionTab === tab;

          return (
            <button
              key={tab}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSectionTabChange(tab)}
              className={[
                "shrink-0 border-b-2 px-0 pb-3 text-left transition-colors duration-150",
                isActive
                  ? "border-[#6b38d4] font-bold text-[#6b38d4]"
                  : "border-transparent font-medium text-[#494454] hover:border-[#d3c4f4] hover:text-[#6b38d4]",
              ].join(" ")}
            >
              {tab}
            </button>
          );
        })}
      </div>
      {showBuildFilters && (
        <>
          <div className="flex flex-wrap items-center gap-3 px-1 pt-5">
            <label className="flex h-12 w-full max-w-[34rem] items-center gap-3 rounded-full border border-[#cbc3d7]/45 bg-white px-4 font-inter text-sm text-[#7b7486] shadow-[0_0.25rem_1.5rem_rgba(139,92,246,0.04)]">
              <SearchIcon />
              <input className="w-full bg-transparent outline-none placeholder:text-[#7b7486]" placeholder="Search conditions, genes, or panels..." />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 px-1">
            {categories.map((category) => {
              const isActive = activeCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveCategory(category)}
                  className={[
                    "rounded-full border px-4 py-2 font-inter text-xs font-semibold transition-colors duration-150",
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

function FeaturedPanel({ compact = false }) {
  return (
    <section className={compact ? "curated-premium-card curated-premium-card--compact" : "curated-premium-card"}>
      <div className="curated-premium-ribbon">Best Value</div>
      <div className="grid gap-[clamp(1rem,1.8vw,2.25rem)] xl:grid-cols-[minmax(0,1fr)_minmax(11rem,13.5rem)] xl:items-center">
        <div className={compact ? "space-y-3" : "space-y-4"}>
          <span className="inline-flex items-center gap-2 rounded-full border border-nucleotide-purple/35 bg-[#211b44] px-3 py-1 font-inter text-[0.62rem] font-bold uppercase tracking-wider text-nucleotide-lavender">
            <img src={wellnessIcon} alt="" className="h-3 w-3" />
            Elite Healthcare Edition
          </span>
          <h2 className="font-poppins text-[clamp(1.125rem,1.35vw,1.5rem)] font-medium leading-tight">Complete Genomic Wellness</h2>
          <p className="max-w-[39rem] font-inter text-[clamp(0.78rem,0.85vw,0.92rem)] leading-relaxed text-white/90">
            Our most comprehensive screen covering 120+ clinical markers. A full-spectrum analysis of your DNA to empower proactive health decisions.
          </p>
          <div className="flex flex-wrap gap-2">
            {['Onco Risk', 'Cardio Health', 'Pharmacogenomics'].map((chip) => (
              <span key={chip} className="rounded-full border border-white/20 bg-white/[0.06] px-3 py-1 font-inter text-[0.58rem] font-semibold uppercase tracking-wider text-white/80">{chip}</span>
            ))}
          </div>
        </div>
        <div className="curated-premium-price-card rounded-2xl bg-gradient-to-br from-white to-nucleotide-lavender p-[clamp(0.8rem,1vw,1rem)] text-nucleotide-ink shadow-[0_1rem_2.5rem_rgba(16,17,41,0.08)]">
          <p className="font-inter text-[0.75rem] font-medium text-[#7b7486]">Total Investment</p>
          <p className="mt-1 font-poppins text-[clamp(1.35rem,1.8vw,1.8rem)] font-medium leading-tight text-black">$499 <span className="font-inter text-xs font-normal text-[#494454]">/ kit</span></p>
          <ul className="mt-3 space-y-1.5 font-inter text-[0.72rem] text-[#494454]">
            <li className="flex items-center gap-2 text-[#6f6878]">
              <span className="text-nucleotide-sea"><CheckCircleIcon /></span>
              Lifetime Reanalysis
            </li>
            <li className="flex items-center gap-2 text-[#6f6878]">
              <span className="text-nucleotide-sea"><CheckCircleIcon /></span>
              1-on-1 Counseling
            </li>
          </ul>
          <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-nucleotide-purple px-4 py-2.5 font-poppins text-[clamp(0.78rem,0.9vw,0.9rem)] font-medium text-white shadow-[0_0.65rem_1.2rem_rgba(139,92,246,0.28)]">
            <img src={addIcon} alt="" className="w-4" /> Add to Selection
          </button>
          <p className="mt-3 font-inter text-[0.65rem] font-medium text-black">FSA/HSA Eligible</p>
        </div>
      </div>
    </section>
  );
}

function CategoryCard({ card }) {
  return (
    <article className="group flex min-h-[8.25rem] flex-col rounded-2xl border border-nucleotide-lavender/80 bg-gradient-to-b from-white to-nucleotide-lavender p-3 shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-[0_1.75rem_5rem_rgba(139,92,246,0.22)]">
      <div className="flex items-start justify-between gap-4">
        <span className={`grid h-6 min-w-10 place-items-center rounded-full genetic-tone-${card.tone}`}>
          <CardIcon icon={card.icon} />
        </span>
        <span className="h-4 w-4 rounded-full border border-nucleotide-purple/60 bg-white" aria-hidden="true" />
      </div>
      <h3 className="mt-2.5 font-poppins text-[clamp(0.84rem,0.82vw,0.94rem)] font-medium leading-tight text-nucleotide-ink">{card.title}</h3>
      <p className="mt-1.5 flex-1 font-inter text-[clamp(0.68rem,0.68vw,0.76rem)] leading-snug text-[#494454]">{card.text}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="font-poppins text-[clamp(0.9rem,1vw,1.08rem)] font-medium text-nucleotide-ink">{card.price}</p>
        <p className="font-inter text-[0.65rem] font-semibold text-nucleotide-purple">{card.tag}</p>
      </div>
    </article>
  );
}

function CuratedPackageCard({ card }) {
  return (
    <article className="curated-bento-card">
      <div className="curated-bento-header">
        <span className={`curated-bento-icon curated-bento-tone-${card.tone}`}>
          <PackageIcon name={card.icon} />
        </span>
        <span className={`curated-bento-badge curated-bento-badge-${card.tone}`}>{card.badge}</span>
      </div>
      <div>
        <h3 className="curated-bento-title">{card.title}</h3>
        <p className="curated-bento-copy">{card.text}</p>
      </div>
      <div className="curated-bento-tags">
        {card.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <div className="curated-bento-footer">
        <div>
          <p className="curated-bento-original">₹24,500</p>
          <div className="flex flex-wrap items-end gap-2">
            <p className="curated-bento-price">₹20,000</p>
            <p className="curated-bento-save">Save ₹4,500</p>
          </div>
        </div>
        <button className="curated-add-button">
          <img src={addIcon} alt="" className="w-4" />
          Add to Panel
        </button>
      </div>
    </article>
  );
}

function PackageFilterChips() {
  const [activePackageCategory, setActivePackageCategory] = useState(panelTabs[0]);

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {panelTabs.map((tab) => {
        const isActive = activePackageCategory === tab;

        return (
          <button
            key={tab}
            type="button"
            aria-pressed={isActive}
            onClick={() => setActivePackageCategory(tab)}
            className={[
              "shrink-0 rounded-full border px-3.5 py-1.5 font-inter text-[0.7rem] font-semibold transition-colors duration-150",
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
  );
}

function CuratedPackagesView() {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-poppins text-[clamp(1rem,1.15vw,1.25rem)] font-medium tracking-[-0.02em] text-[#131b2e]">
          Select Packages
        </h2>
        <button className="grid aspect-square w-7 place-items-center rounded-full hover:bg-nucleotide-lavender/60" aria-label="Filter packages">
          <img src={filterIcon} alt="" className="w-4" />
        </button>
      </div>
      <PackageFilterChips />
      <div className="curated-bento-grid">
        {curatedPackageCards.map((card) => (
          <CuratedPackageCard key={card.title} card={card} />
        ))}
      </div>
    </section>
  );
}

function RecommendedPanel({ panel, icon, showBadge = false }) {
  return (
    <article className="curated-package-card">
      <div className="curated-card-header">
        <span className="curated-icon-tile curated-tone-purple"><img src={icon} alt="" className="h-5 w-5" /></span>
        {showBadge && <span className="curated-card-badge bg-nucleotide-purple text-white">Best Value</span>}
      </div>
      <h3 className="curated-card-title">{panel.title}</h3>
      <p className="curated-card-description">{panel.text}</p>
      <a href="#conditions" className="curated-condition-link">{panel.saving}</a>
      <div className="curated-card-footer">
        <div className="curated-card-actions">
          <div className="curated-price-group">
            <p className="curated-current-price">{panel.price}</p>
            <p className="curated-saving">HSA/FSA Eligible</p>
          </div>
          <button className="curated-add-button"><img src={addIcon} alt="" className="w-4" /> Add to Panel</button>
        </div>
      </div>
    </article>
  );
}

function CartAside() {
  return (
    <aside className="sticky top-[5.5rem] rounded-2xl border-l border-nucleotide-lavender bg-gradient-to-r from-nucleotide-night to-nucleotide-indigo p-4 text-white shadow-soft">
      <div className="flex items-center justify-between gap-3 pb-4">
        <h2 className="font-poppins text-base font-medium">Your Selection</h2>
        <span className="rounded-full bg-nucleotide-lavender px-2.5 py-1 font-inter text-[0.68rem] font-bold text-nucleotide-purple">0 Items</span>
      </div>
      <div className="grid min-h-[12.5rem] place-items-center rounded-2xl border-2 border-dashed border-nucleotide-lavender bg-nucleotide-lavender/20 px-4 py-7 text-center">
        <div>
          <div className="mx-auto grid aspect-square w-12 place-items-center rounded-full bg-white shadow-sm">
            <img src={flaskIcon} alt="" className="w-4" />
          </div>
          <p className="mt-3 font-inter text-sm font-medium">Nothing selected yet.</p>
          <p className="mt-1 font-inter text-xs leading-relaxed text-white/85">Choose panels or a package from the left to begin.</p>
        </div>
      </div>
      <div className="mt-4 space-y-3 font-inter text-xs">
        <div className="space-y-2">
          <div className="flex justify-between"><span>Progress to checkout</span><span>0/1</span></div>
          <div className="h-1.5 rounded-full bg-nucleotide-lavender" />
        </div>
        <p className="flex items-center gap-2 px-2"><img src={lockIcon} alt="" className="h-3.5 w-3.5" /> Secure Genomic Data Handling</p>
        <p className="flex items-center gap-2 px-2"><img src={timeIcon} alt="" className="h-3.5 w-3.5" /> Turnaround time: 12-15 days</p>
        <div className="flex items-center justify-between border-t border-white/30 px-2 pt-4">
          <span className="text-sm font-medium">Subtotal</span>
          <span className="font-poppins text-lg font-medium">$0</span>
        </div>
        <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-nucleotide-purple py-3 font-poppins text-sm font-medium shadow-[0_0.625rem_1rem_rgba(107,56,212,0.2)]">
          <img src={checkoutIcon} alt="" className="w-4" /> Proceed to Checkout
        </button>
      </div>
    </aside>
  );
}

export function GeneticTestingPage() {
  const topCategoryCards = categoryCards.slice(0, 4);
  const lowerCategoryCards = categoryCards.slice(4);
  const [activeSectionTab, setActiveSectionTab] = useState(sectionTabs[0]);
  const isCuratedPackages = activeSectionTab === "Curated Packages";

  return (
    <div className="min-h-screen overflow-hidden bg-white font-inter text-nucleotide-ink">
      <Header />
      <main className="relative mx-auto w-full max-w-[92rem] px-[clamp(1rem,2.6vw,3rem)] pb-16 pt-[clamp(1.25rem,2.2vw,2.6rem)]">
        <div className="pointer-events-none absolute -left-[12%] top-[42%] h-[22rem] w-[22rem] rounded-full bg-nucleotide-sea/25 blur-[7rem]" />
        <div className="pointer-events-none absolute -right-[10%] bottom-0 h-[28rem] w-[28rem] rounded-full bg-nucleotide-purple/20 blur-[8rem]" />
        <div className="relative grid gap-[clamp(1.25rem,1.8vw,2rem)] xl:grid-cols-[minmax(0,1fr)_minmax(16rem,18rem)] xl:items-start">
          <div className="min-w-0 space-y-5">
            <HeroSection />
            <StickyControls
              activeSectionTab={activeSectionTab}
              onSectionTabChange={setActiveSectionTab}
              showBuildFilters={!isCuratedPackages}
            />
            <FeaturedPanel compact={isCuratedPackages} />
            {isCuratedPackages ? (
              <CuratedPackagesView />
            ) : (
              <>
                <section className="space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="font-poppins text-xl font-medium">Select Category</h2>
                    <button className="grid aspect-square w-9 place-items-center rounded-full hover:bg-nucleotide-lavender/60" aria-label="Filter panels"><img src={filterIcon} alt="" className="w-5" /></button>
                  </div>
                  <PackageFilterChips />
                  <div className="genetic-card-grid">
                    {topCategoryCards.map((card) => <CategoryCard key={card.title} card={card} />)}
                  </div>
                </section>
                <section aria-label="Additional genetic categories">
                  <div className="genetic-card-grid">
                    {lowerCategoryCards.map((card) => <CategoryCard key={card.title} card={card} />)}
                  </div>
                </section>
                <section className="space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-inter text-xs font-bold uppercase tracking-[0.12em] text-[#494454]">Recommended Panels</p>
                    </div>
                    <a href="#all" className="font-inter text-sm font-semibold text-nucleotide-purple">View All</a>
                  </div>
                  <div className="curated-package-grid">
                    {recommendedPanels.map((panel, index) => (
                      <RecommendedPanel
                        key={panel.title}
                        panel={panel}
                        icon={index === 0 ? wellnessIcon : cardiacProfileIcon}
                        showBadge={index === 0}
                      />
                    ))}
                  </div>
                </section>
              </>
            )}
            <section className="space-y-4 pt-8">
              <p className="font-inter text-xs font-bold uppercase tracking-[0.12em] text-[#494454]">Have Questions?</p>
              <div className="space-y-2">
                {faqs.map((faq) => (
                  <button key={faq} className="flex w-full items-center justify-between gap-4 rounded-xl border border-[#cbc3d7]/30 bg-white p-5 text-left font-inter text-base font-bold text-[#131b2e] shadow-sm">
                    {faq}
                    <img src={chevronIcon} alt="" className="w-3 shrink-0" />
                  </button>
                ))}
              </div>
            </section>
          </div>
          <div className="hidden xl:block">
            <CartAside />
          </div>
        </div>
      </main>
    </div>
  );
}



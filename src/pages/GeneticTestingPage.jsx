import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BrandLogo } from "../components/BrandLogo.jsx";
import { MobileNavbar } from "../components/MobileNavbar.jsx";
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
import detailTimeIcon from "../assets/Test-detail/Icon.svg";
import detailCounselorIcon from "../assets/Test-detail/Icon (1).svg";
import detailCheckIcon from "../assets/Test-detail/Icon (2).svg";
import detailKitIcon from "../assets/Test-detail/Icon (3).svg";
import detailDnaIcon from "../assets/Test-detail/Icon (4).svg";
import detailPulseIcon from "../assets/Test-detail/Icon (5).svg";
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
const filterGroups = [
  {
    label: "All Categories",
    subcategories: ["Clinical", "Wellness", "Family Health", "Performance", "Medication", "Mental Health"],
  },
  {
    label: "Most Popular",
    subcategories: ["Cancer Risk", "Cardiac Health", "Carrier Screening", "Metabolic Care", "Pharmacogenomics", "Mental Wellness"],
  },
  {
    label: "Preventive Care",
    subcategories: ["Cancer Risk", "Heart Risk", "Diabetes Risk", "Blood Health", "Immune Health", "Eye Health"],
  },
  {
    label: "Longevity",
    subcategories: ["Healthy Aging", "Cognitive Aging", "Heart Aging", "Inflammation", "Bone Health", "Sleep Recovery"],
  },
  {
    label: "Hormones",
    subcategories: ["Thyroid", "Cortisol", "Estrogen", "Testosterone", "PCOS", "Vitamin D"],
  },
  {
    label: "Fitness",
    subcategories: ["Endurance", "Power", "Injury Risk", "Recovery", "Nutrition", "Body Composition"],
  },
  {
    label: "Family Planning",
    subcategories: ["Carrier Status", "Fertility", "Pregnancy Health", "Newborn Risk", "Inherited Traits", "Partner Screening"],
  },
  {
    label: "Mental Wellness",
    subcategories: ["Stress Response", "Mood Pathways", "Sleep", "ADHD Traits", "Addiction Risk", "Cognitive Traits"],
  },
];

function getFilterGroupLabel(tab) {
  return filterGroups.find((group) => group.label === tab || group.subcategories.includes(tab))?.label || panelTabs[0];
}

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

const sharedIncludedItems = [
  {
    title: "Genetic Counselor Session",
    text: "A 30-minute consultation with a board-certified genetic counselor to discuss your results and implications.",
    icon: detailCounselorIcon,
  },
  {
    title: "Lifetime Report Updates",
    text: "As scientific understanding evolves, your data is re-analyzed to provide the most current insights without re-testing.",
    icon: detailTimeIcon,
  },
];

const panelDetails = {
  "Cancer Risk": {
    title: "Cancer & Tumor Predisposition",
    badges: ["50+ Cancers", "BRCA1/2"],
    overview:
      "A comprehensive clinical-grade screening that analyses your genetic predisposition to over 50 hereditary cancer syndromes. Early identification of these markers empowers you and your physician to develop personalised surveillance and prevention strategies.",
    highlights: [
      {
        title: "Key Biomarkers",
        text: "Extensive analysis including BRCA1, BRCA2, PALB2, ATM, CHEK2, and Lynch Syndrome genes.",
      },
      {
        title: "Clinical Utility",
        text: "Results guide actionable medical interventions, screening frequency, and familial risk assessment.",
      },
    ],
    conditionCount: "54 Conditions Analyzed",
    conditions: [
      "Breast & Ovarian Cancer (Hereditary)",
      "Colorectal Cancer (Lynch Syndrome)",
      "Prostate Cancer",
      "Pancreatic Cancer",
      "Melanoma (Familial Atypical Multiple Mole)",
      "Gastric Cancer",
    ],
    viewAllLabel: "View all 54 conditions",
    included: sharedIncludedItems,
  },
  Hematology: {
    title: "Hematology Genetics",
    badges: ["Blood Health", "Carrier Risk"],
    overview:
      "A clinical screen for inherited blood traits, clotting pathways, anemia risk, and variants that may influence hematologic health across life stages.",
    highlights: [
      { title: "Key Biomarkers", text: "Includes hemoglobinopathy, thrombophilia, iron metabolism, and immune-cell pathway markers." },
      { title: "Clinical Utility", text: "Supports preventive follow-up, family risk awareness, and physician-led interpretation." },
    ],
    conditionCount: "36 Conditions Analyzed",
    conditions: ["Thalassemia Traits", "Sickle Cell Carrier Status", "Hereditary Hemochromatosis", "G6PD Deficiency", "Factor V Leiden", "Von Willebrand Risk"],
    viewAllLabel: "View all 36 conditions",
    included: sharedIncludedItems,
  },
  "Hormone Health": {
    title: "Hormone Health",
    badges: ["Endocrine", "Metabolism"],
    overview:
      "A focused assessment of inherited markers connected to hormone production, receptor sensitivity, and endocrine-metabolic balance.",
    highlights: [
      { title: "Key Biomarkers", text: "Reviews thyroid, insulin, reproductive hormone, cortisol, and vitamin D pathway markers." },
      { title: "Clinical Utility", text: "Helps guide targeted discussions around screening, lifestyle strategy, and clinical follow-up." },
    ],
    conditionCount: "42 Markers Reviewed",
    conditions: ["Thyroid Function Traits", "Insulin Sensitivity", "PCOS Risk Markers", "Vitamin D Metabolism", "Cortisol Response", "Reproductive Hormone Pathways"],
    viewAllLabel: "View all 42 markers",
    included: sharedIncludedItems,
  },
  Neuropsychiatry: {
    title: "Neuropsychiatry Wellness",
    badges: ["Mental Health", "Behavioral"],
    overview:
      "A genetics-led view into mental wellness pathways, neurotransmitter metabolism, stress response, and behavioral health predispositions.",
    highlights: [
      { title: "Key Biomarkers", text: "Includes serotonin, dopamine, methylation, circadian rhythm, and medication-response markers." },
      { title: "Clinical Utility", text: "Adds context for clinician conversations around preventive mental wellness and care planning." },
    ],
    conditionCount: "28 Insights Included",
    conditions: ["Stress Response", "Sleep Rhythm", "Mood Pathways", "Attention Traits", "Neurotransmitter Metabolism", "Medication Response"],
    viewAllLabel: "View all 28 insights",
    included: sharedIncludedItems,
  },
  "Cardio Health": {
    title: "Cardio Health Genetics",
    badges: ["Heart", "Cholesterol"],
    overview:
      "A cardiovascular genetics screen focused on inherited heart-risk pathways, lipid handling, blood pressure traits, and cardiomyopathy markers.",
    highlights: [
      { title: "Key Biomarkers", text: "Reviews LDL metabolism, familial hypercholesterolemia, arrhythmia, and cardiomyopathy genes." },
      { title: "Clinical Utility", text: "Supports physician-guided screening plans, family history review, and preventive cardiology." },
    ],
    conditionCount: "32 Conditions Analyzed",
    conditions: ["Familial Hypercholesterolemia", "Cardiomyopathy Risk", "Arrhythmia Markers", "Blood Pressure Traits", "Atherosclerosis Risk", "Lipid Metabolism"],
    viewAllLabel: "View all 32 conditions",
    included: sharedIncludedItems,
  },
  Neurology: {
    title: "Neurology Risk Profile",
    badges: ["Brain", "Cognition"],
    overview:
      "A neurological genetics panel that explores inherited risk pathways related to cognition, neurodegeneration, and nervous-system health.",
    highlights: [
      { title: "Key Biomarkers", text: "Includes APOE-related risk context, cognitive traits, inflammatory pathways, and neurodegenerative markers." },
      { title: "Clinical Utility", text: "Helps frame preventive planning and physician-led neurological follow-up where appropriate." },
    ],
    conditionCount: "30 Insights Included",
    conditions: ["Alzheimer's Risk Context", "Cognitive Traits", "Migraine Susceptibility", "Neuropathy Risk", "Neuroinflammation", "Movement Disorder Markers"],
    viewAllLabel: "View all 30 insights",
    included: sharedIncludedItems,
  },
  "Metabolic Care": {
    title: "Metabolic Care",
    badges: ["Metabolic", "Nutrition"],
    overview:
      "A genetics-backed metabolic profile for nutrient processing, insulin response, body composition tendencies, and energy pathway efficiency.",
    highlights: [
      { title: "Key Biomarkers", text: "Covers insulin sensitivity, lipid handling, micronutrient processing, appetite, and energy metabolism markers." },
      { title: "Clinical Utility", text: "Supports personalized nutrition, preventive screening, and metabolic health conversations." },
    ],
    conditionCount: "44 Markers Reviewed",
    conditions: ["Insulin Sensitivity", "Lipid Processing", "Vitamin Metabolism", "Lactose Response", "Caffeine Metabolism", "Weight Regulation Traits"],
    viewAllLabel: "View all 44 markers",
    included: sharedIncludedItems,
  },
  "Reproductive & Fertility": {
    title: "Reproductive & Fertility",
    badges: ["Family", "Carrier"],
    overview:
      "A reproductive genetics screen for carrier status, fertility-related traits, inherited conditions, and family-planning risk awareness.",
    highlights: [
      { title: "Key Biomarkers", text: "Includes carrier screening, reproductive hormone pathways, inherited disease variants, and pregnancy-related markers." },
      { title: "Clinical Utility", text: "Helps couples and physicians make informed family-planning and follow-up decisions." },
    ],
    conditionCount: "60 Conditions Analyzed",
    conditions: ["Carrier Screening", "Cystic Fibrosis Carrier Status", "SMA Carrier Risk", "Fertility Traits", "Pregnancy Risk Markers", "Inherited Metabolic Conditions"],
    viewAllLabel: "View all 60 conditions",
    included: sharedIncludedItems,
  },
};

const recommendedPanels = [
  {
    title: "Comprehensive Cancer Risk",
    text: "Analyses 84 genes associated with elevated risk for breast, ovarian, colorectal, and other hereditary cancers.",
    price: "₹249",
    saving: "View 84 Conditions",
  },
  {
    title: "Cardiac Risk Profile",
    text: "Evaluates genetic markers linked to familial hypercholesterolemia, cardiomyopathies, and arrhythmias.",
    price: "₹199",
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

const featuredPanelCartItem = {
  title: "Complete Genomic Wellness",
  text: "Our most comprehensive screen covering 120+ clinical markers. A full-spectrum DNA analysis.",
  price: "₹499",
  tone: "purple",
  icon: wellnessIcon,
  chips: ["Cancer Risk", "Cardiac Health", "Pharmacogenomics"],
};

const faqs = [
  "Which panels should I choose if I'm not sure?",
  "Can I unlock more panels later without re-testing?",
  "How secure is my genetic data?",
];

function Header({ onMenuClick }) {
  return (
    <>
      <MobileNavbar onMenuClick={onMenuClick} className="sm:hidden" />
      <header className="sticky top-0 z-40 hidden border-b border-nucleotide-lavender/70 bg-white/95 shadow-[0_0.25rem_6rem_rgba(139,92,246,0.16)] backdrop-blur-xl sm:block">
        <div className="mx-auto flex w-full items-center justify-between gap-8 px-[clamp(1.25rem,4.2vw,5rem)] py-3">
          <BrandLogo variant="dark" className="h-[clamp(1.8rem,2.25vw,2.35rem)] w-[clamp(8rem,11vw,11.5rem)]" />
          <nav className="type-button hidden items-center gap-8 xl:flex">
            <a className="text-nucleotide-purple" href="#hero">Home</a>
            <a className="text-nucleotide-ink" href="#orders">Orders</a>
            <a className="text-nucleotide-ink" href="#genes">My Genes</a>
          </nav>
          <div className="flex items-center gap-3">
            <button className="relative grid aspect-square w-10 place-items-center rounded-full border border-nucleotide-lavender bg-nucleotide-surface" aria-label="Account">
              <img src={profileIcon} alt="" className="w-5" />
              <span className="type-caption absolute -left-1 -top-1 grid aspect-square w-5 place-items-center rounded-full bg-nucleotide-lavender text-nucleotide-ink">1</span>
            </button>
            <button className="type-button inline-flex items-center gap-3 rounded-full border border-nucleotide-lavender bg-gradient-to-r from-nucleotide-night to-nucleotide-indigo px-5 py-2.5 text-white">
              <img src={cartIcon} alt="" className="w-5" />
              My Cart
            </button>
          </div>
        </div>
      </header>
    </>
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

function PackageIcon({ name }) {
  return <img src={name} alt="" className="h-4 w-4 object-contain" />;
}

function HeroSection() {
  return (
    <section id="hero" className="genetic-ribbon-panel genetic-hero-panel overflow-hidden rounded-xl border border-[#cbc3d7]/30 bg-gradient-to-r from-nucleotide-night to-nucleotide-indigo p-[clamp(1.1rem,1.55vw,1.65rem)] text-white shadow-soft">
      <div className="genetic-hero-content relative z-10">
        <div className="genetic-ribbon-copy-stack max-w-[50rem]">
          <h1 className="type-hero-title">
            Genomic Health <span className="text-nucleotide-purple">Intelligence</span>
          </h1>
          <p className="genetic-ribbon-copy type-body max-w-[52rem] text-white/90">
            Curate your personalized medical testing panel. Select from our advanced array of clinical-grade genomic screens to uncover predispositions, optimize longevity, and achieve peak performance.
          </p>
        </div>
        <div className="genetic-hero-badges flex flex-wrap gap-2.5">
          {trustBadges.map((badge) => (
            <span key={badge.label} className="type-chip inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-[#15142f] to-[#2b2c59] px-3 py-1.5 text-white shadow-sm">
              <img src={badge.icon} alt="" className="h-3 w-3 object-contain" />
            {badge.label}
            </span>
          ))}
        </div>
        <div className="genetic-hero-stats grid gap-[clamp(0.85rem,1vw,1rem)] md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-[#2a2c58] bg-white/[0.02] p-3 text-center backdrop-blur-md">
              <p className="type-price">{stat.value}</p>
              <p className="type-eyebrow mt-1 text-[#818181]">{stat.label}</p>
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
                "shrink-0 border-b-2 px-0 pb-3 text-left transition-colors duration-150",
                isActive
                  ? "border-[#6b38d4] text-[#6b38d4]"
                  : "border-transparent text-[#494454] hover:border-[#d3c4f4] hover:text-[#6b38d4]",
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

function CategoryCard({ card, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(card)}
      className="genetic-category-card group flex min-h-[9rem] flex-col rounded-xl border border-nucleotide-lavender/80 bg-gradient-to-b from-white to-nucleotide-lavender p-[clamp(0.9rem,1vw,1.1rem)] text-left shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-[0_1.25rem_3rem_rgba(139,92,246,0.18)]"
    >
      <div className="flex items-start justify-between gap-4">
        <span className={`grid h-5 min-w-9 place-items-center rounded-full genetic-tone-${card.tone}`}>
          <CardIcon icon={card.icon} />
        </span>
        <span className="h-4 w-4 rounded-full border border-nucleotide-purple/60 bg-white" aria-hidden="true" />
      </div>
      <h3 className="type-card-title mt-2 text-nucleotide-ink">{card.title}</h3>
      <p className="type-body-sm mt-1.5 flex-1 text-[#494454]">{card.text}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="type-price text-nucleotide-ink">{card.price}</p>
        <p className="type-caption text-nucleotide-purple">{card.tag}</p>
      </div>
    </button>
  );
}

function PanelDetailModal({ card, onAddPanel, onClose }) {
  const detail = panelDetails[card.title] || panelDetails["Cancer Risk"];

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
              <img src={detailPulseIcon} alt="" />
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
                <span><img src={index === 0 ? detailDnaIcon : detailKitIcon} alt="" /></span>
                <div>
                  <h4>{highlight.title}</h4>
                  <p>{highlight.text}</p>
                </div>
              </article>
            ))}
          </section>

          <section className="panel-detail-section">
            <div className="panel-section-heading">
              <h3>Included Conditions</h3>
              <span>{detail.conditionCount}</span>
            </div>
            <ul className="panel-conditions-list">
              {detail.conditions.map((condition) => (
                <li key={condition}>
                  <span className="panel-check-icon"><img src={detailCheckIcon} alt="" /></span>
                  {condition}
                </li>
              ))}
            </ul>
            <button type="button" className="panel-view-all">{detail.viewAllLabel}⌄</button>
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
            Add to Panel
          </button>
        </footer>
      </article>
    </div>
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
        <div className="filter-sheet-body">
          <div className="filter-sheet-category-strip" aria-label="Categories">
            {groups.map((group) => {
              const isCurrentGroup = selectedGroup.label === group.label;
              const hasActiveSelection = group.label === activeTab || group.subcategories.includes(activeTab);

              return (
                <button
                  key={group.label}
                  type="button"
                  aria-pressed={isCurrentGroup}
                  className={[
                    "filter-sheet-category",
                    isCurrentGroup ? "filter-sheet-category--current" : "",
                    hasActiveSelection ? "filter-sheet-category--selected" : "",
                  ].join(" ")}
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
            <button
              type="button"
              className="filter-sheet-apply-category"
              onClick={() => { onSelect(selectedGroup.label); onClose(); }}
            >
              View all
            </button>
          </div>
          <div className="filter-sheet-subcategory-grid">
            {selectedGroup.subcategories.map((subcategory) => {
              const isActive = activeTab === subcategory;

            return (
              <button
                key={subcategory}
                type="button"
                aria-pressed={isActive}
                className={["filter-sheet-subcategory", isActive ? "filter-sheet-subcategory--active" : ""].join(" ")}
                onClick={() => { onSelect(subcategory); onClose(); }}
              >
                <span className="filter-sheet-subcategory-label">{subcategory}</span>
                {isActive && (
                  <span className="filter-sheet-check" aria-hidden="true">
                    <TinyCheckIcon />
                  </span>
                )}
              </button>
            );
          })}
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

function CuratedPackagesView() {
  const [activeTab, setActiveTab] = useState(panelTabs[0]);
  const [showFilter, setShowFilter] = useState(false);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="type-section-title text-[#131b2e]">Select Packages</h2>
        <FilterButton onClick={() => setShowFilter(true)} />
      </div>
      <PackageFilterChips
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <div className="curated-bento-grid">
        {curatedPackageCards.map((card) => (
          <CuratedPackageCard key={card.title} card={card} />
        ))}
      </div>
      {showFilter && (
        <FilterSheet
          activeTab={activeTab}
          onSelect={setActiveTab}
          onClose={() => setShowFilter(false)}
        />
      )}
    </section>
  );
}

function RecommendedPanel({ panel, icon, showBadge = false }) {
  return (
    <article className="curated-package-card">
      {showBadge && (
        <span className="curated-card-badge bg-nucleotide-purple text-white curated-card-badge--abs">
          Best Value
        </span>
      )}
      <div className="curated-card-header">
        <span className="curated-icon-tile curated-tone-purple">
          <img src={icon} alt="" className="h-5 w-5" />
        </span>
      </div>
      <div className="curated-card-copy-stack">
        <h3 className="curated-card-title">{panel.title}</h3>
        <p className="curated-card-description">{panel.text}</p>
        <a href="#conditions" className="curated-condition-link">{panel.saving}</a>
      </div>
      <div className="curated-card-footer">
        <div className="curated-card-actions">
          <div className="curated-price-group">
            <p className="curated-current-price">{panel.price}</p>
            <p className="curated-saving">HSA/FSA Eligible</p>
          </div>
          <button className="curated-add-button">
            <img src={addIcon} alt="" className="w-4" /> Add to Panel
          </button>
        </div>
      </div>
    </article>
  );
}

const minimumCheckoutTotal = 19999;

function getPanelPriceValue(panel) {
  return Number(panel.price.replace(/[^\d]/g, "")) || 0;
}

function formatInr(value) {
  return `\u20B9${value.toLocaleString("en-IN")}`;
}

function CartAside({ selectedPanels, onRemovePanel }) {
  const selectedCount = selectedPanels.length;
  const subtotal = selectedPanels.reduce((sum, panel) => sum + getPanelPriceValue(panel), 0);
  const progress = selectedCount > 0 ? Math.min((subtotal / minimumCheckoutTotal) * 100, 100) : 0;
  const isReady = subtotal >= minimumCheckoutTotal;
  const progressLabel = selectedCount === 0 ? "0/1" : `${selectedCount}/1`;
  const primaryPanel = selectedPanels[0] || featuredPanelCartItem;
  const primaryPanelCopy = primaryPanel.text || "Clinical-grade genomic screening added to your selection.";
  const primaryPanelChips = primaryPanel.chips || ["Selected Panel", "Clinical Grade", "Counseling"];
  const primaryPanelBadgeIcon = typeof primaryPanel.icon === "string" && primaryPanel.icon !== "hormone-drop" ? primaryPanel.icon : wellnessIcon;

  return (
    <aside className={`cart-panel sticky top-[5.5rem] ${selectedCount === 0 ? "cart-panel--empty" : "cart-panel--selected"}`}>
      <div className="cart-panel-header">
        <h2>Your Selection</h2>
        <span>{selectedCount} {selectedCount === 1 ? "Item" : "Items"}</span>
      </div>

      {selectedCount === 0 ? (
        <>
          <div className="cart-mobile-empty-card" aria-label="Empty selection cart">
            <div className="cart-mobile-empty-copy">
              <span className="cart-mobile-empty-icon">
                <img src={flaskIcon} alt="" />
                <span>0</span>
              </span>
              <div>
                <p>Nothing selected yet</p>
                <span>Choose panels from left to begin.</span>
              </div>
            </div>
            <button className="cart-checkout-button" type="button">
              <img src={addIcon} alt="" />
              Proceed to checkout
            </button>
          </div>
          <div className="cart-empty-state">
            <div>
              <div className="cart-empty-icon">
                <img src={flaskIcon} alt="" />
              </div>
              <p>Nothing selected yet.</p>
              <span>Choose panels or a package from the left to begin.</span>
            </div>
          </div>
          <div className="cart-panel-progress">
            <div className="cart-progress-copy">
              <span>Progress to checkout</span>
              <span>{progressLabel}</span>
            </div>
            <div className="cart-progress-track"><span style={{ width: `${progress}%` }} /></div>
          </div>
          <div className="cart-value-props">
            <p><img src={lockIcon} alt="" /> Secure Genomic Data Handling</p>
            <p><img src={timeIcon} alt="" /> Turnaround time: 12-15 days</p>
          </div>
          <div className="cart-total-row">
            <span>Subtotal</span>
            <strong>{selectedCount === 0 ? "₹0" : formatInr(subtotal)}</strong>
          </div>
          <button className="cart-checkout-button" type="button">
            <img src={checkoutIcon} alt="" />
            Proceed to Checkout
          </button>
        </>
      ) : (
        <>
          <article className="cart-mobile-selected-card" aria-label="Selected panel cart">
            <div className="curated-premium-ribbon">Best Value</div>
            <div className="genetic-ribbon-copy-stack">
              <span className="type-eyebrow inline-flex items-center gap-2 rounded-full border border-nucleotide-purple/35 bg-[#211b44] px-3 py-1 text-nucleotide-lavender">
                <img src={primaryPanelBadgeIcon} alt="" className="h-3 w-3" />
                Elite Healthcare Edition
              </span>
              <h2 className="type-section-title">{primaryPanel.title}</h2>
              <p className="genetic-ribbon-copy type-body text-white/90">{primaryPanelCopy}</p>
              <div className="genetic-featured-chips flex flex-wrap gap-2">
                {primaryPanelChips.map((chip) => (
                  <span key={chip} className="type-chip rounded-full border border-white/20 bg-white/[0.06] px-3 py-1 uppercase tracking-[0.05em] text-white/80">{chip}</span>
                ))}
              </div>
            </div>
            <div className="curated-premium-price-card">
              <p className="type-caption text-white">Total Investment</p>
              <p className="type-price mt-1 text-white">{primaryPanel.price} <span className="type-caption font-normal text-white">/ kit</span></p>
              <button className="type-button inline-flex items-center justify-center gap-2 rounded-xl bg-nucleotide-purple px-4 py-2.5 text-white" type="button">
                <img src={addIcon} alt="" className="w-4" /> Add to Selection
              </button>
            </div>
          </article>
          <section className="cart-sample-card" aria-label="Sample collection">
            <span className="cart-sample-icon-badge">
              <img src={flaskIcon} alt="" />
              <span>{selectedCount}</span>
            </span>
            <div className="cart-sample-copy">
              <p>Sample collection</p>
              <div>
                <span className="cart-home-icon" aria-hidden="true">
                  <svg viewBox="0 0 20 20" fill="none">
                    <path d="M3.5 9.2 10 4l6.5 5.2M5.25 8.4v7.1h9.5V8.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8.2 15.5v-4.1h3.6v4.1" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                </span>
                Home collection (saliva kit)
              </div>
            </div>
          </section>

          <section className="cart-panel-progress" aria-label="Progress to minimum checkout">
            <div className="cart-amount-row">
              <strong>{formatInr(subtotal)}</strong>
              <span>of {formatInr(minimumCheckoutTotal)}</span>
            </div>
            <div className="cart-progress-track"><span style={{ width: `${progress}%` }} /></div>
            <p className="cart-ready-text">
              <TinyCheckIcon />
              {isReady ? "Ready to proceed!" : `${formatInr(minimumCheckoutTotal - subtotal)} more to checkout`}
            </p>
          </section>

          <section className="cart-selected-list" aria-label="Selected panels">
            {selectedPanels.map((panel) => {
              const detail = panelDetails[panel.title] || panelDetails["Cancer Risk"];
              const cartTitle = detail.title.replace(" & Tumor", "").replace(" Genetics", "").replace(" Risk Profile", "");

              return (
                <article key={panel.title} className="cart-selected-item">
                  <div className="cart-selected-name">
                    <span className={`cart-selected-icon genetic-tone-${panel.tone}`}>
                      <CardIcon icon={panel.icon} />
                    </span>
                    <p>{cartTitle}</p>
                  </div>
                  <div className="cart-selected-price">
                    <strong>{panel.price}</strong>
                    <button type="button" aria-label={`Remove ${panel.title}`} onClick={() => onRemovePanel(panel.title)}>
                      <CloseIcon />
                    </button>
                  </div>
                </article>
              );
            })}
          </section>

          <div className="cart-total-row cart-total-row--selected">
            <span>Total</span>
            <strong>{formatInr(subtotal)}</strong>
          </div>

          <div className="cart-value-props">
            {[
              "Genetic counsellor session included",
              "Lifetime report access & reanalysis",
              "Results on dashboard in 12-15 days",
              "Family member profiles supported",
            ].map((prop) => (
              <p key={prop}><TinyCheckIcon /> {prop}</p>
            ))}
          </div>

          <button className="cart-checkout-button cart-checkout-button--selected" type="button">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M4 10h11M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Proceed to Checkout
          </button>
        </>
      )}
    </aside>
  );
}

export function GeneticTestingPage({ onMenuClick }) {
  const visibleCategoryCards = categoryCards.slice(0, 3);
  const [activeSectionTab, setActiveSectionTab] = useState(sectionTabs[0]);
  const [selectedPanel, setSelectedPanel] = useState(null);
  const [selectedPanels, setSelectedPanels] = useState([]);
  const [activePanelTab, setActivePanelTab] = useState(panelTabs[0]);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const isCuratedPackages = activeSectionTab === "Curated Packages";
  const handleAddPanel = (panel) => {
    setSelectedPanels((currentPanels) => {
      if (currentPanels.some((currentPanel) => currentPanel.title === panel.title)) {
        return currentPanels;
      }

      return [...currentPanels, panel];
    });
  };
  const handleRemovePanel = (panelTitle) => {
    setSelectedPanels((currentPanels) => currentPanels.filter((panel) => panel.title !== panelTitle));
  };

  return (
    <div className="genetic-testing-page min-h-screen overflow-hidden bg-white font-poppins text-nucleotide-ink">
      <Header onMenuClick={onMenuClick} />
      <main className="genetic-testing-main relative mx-auto w-full max-w-[110rem] px-[clamp(1rem,2.6vw,3rem)] pb-[clamp(4rem,6vw,5.5rem)] pt-[clamp(1.35rem,2.35vw,2.8rem)]">
        <div className="genetic-shell-grid relative grid gap-[clamp(1.25rem,1.8vw,2rem)] xl:grid-cols-[minmax(0,1fr)_minmax(18rem,21rem)] xl:items-start">
          <div className="genetic-content-stack min-w-0">
            <HeroSection />
            <StickyControls
              activeSectionTab={activeSectionTab}
              onSectionTabChange={setActiveSectionTab}
              showBuildFilters={!isCuratedPackages}
            />
            <FeaturedPanel compact={isCuratedPackages} onAddPanel={handleAddPanel} />
            {isCuratedPackages ? (
              <CuratedPackagesView />
            ) : (
              <>
                <section className="genetic-section-block space-y-[clamp(0.9rem,1.15vw,1.2rem)]">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="type-section-title">Select Category</h2>
                    <FilterButton onClick={() => setShowCategoryFilter(true)} />
                  </div>
                  <PackageFilterChips
                    activeTab={activePanelTab}
                    onTabChange={setActivePanelTab}
                  />
                  <div className="genetic-card-grid">
                    {visibleCategoryCards.map((card) => <CategoryCard key={card.title} card={card} onOpen={setSelectedPanel} />)}
                  </div>
                </section>
                {showCategoryFilter && (
                  <FilterSheet
                    activeTab={activePanelTab}
                    onSelect={setActivePanelTab}
                    onClose={() => setShowCategoryFilter(false)}
                  />
                )}
                <section className="genetic-section-block genetic-recommended-section space-y-[clamp(0.9rem,1.15vw,1.2rem)]">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="recommended-panels-title type-eyebrow">Recommended Panels</p>
                    </div>
                    <a href="#all" className="recommended-view-all type-caption text-nucleotide-purple">View All</a>
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
            <section className="space-y-4 pt-[clamp(1.5rem,2.4vw,2.5rem)]">
              <p className="type-eyebrow text-[#494454]">Have Questions?</p>
              <div className="space-y-2">
                {faqs.map((faq) => (
                  <button key={faq} className="type-card-title flex w-full items-center justify-between gap-4 rounded-xl border border-[#cbc3d7]/30 bg-white p-5 text-left text-[#131b2e] shadow-sm">
                    {faq}
                    <img src={chevronIcon} alt="" className="w-3 shrink-0" />
                  </button>
                ))}
              </div>
            </section>
          </div>
          <div className="cart-aside-shell">
            <CartAside selectedPanels={selectedPanels} onRemovePanel={handleRemovePanel} />
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
    </div>
  );
}



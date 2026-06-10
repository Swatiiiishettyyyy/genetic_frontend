import cancerPulseIcon from "../assets/icons/panels/cancer-pulse.svg";
import hematologyIcon from "../assets/icons/panels/hematology.svg";
import neuroHeadIcon from "../assets/icons/panels/neuro-head.svg";
import cardioMonitorIcon from "../assets/icons/panels/cardio-monitor.svg";
import metabolicIcon from "../assets/icons/panels/metabolic.svg";
import familyIcon from "../assets/icons/panels/family.svg";
import wellnessIcon from "../assets/icons/panels/wellness.svg";
import detailTimeIcon from "../assets/icons/detail/time.svg";
import detailCounselorIcon from "../assets/icons/detail/counselor.svg";
import curatedSportsIcon from "../assets/icons/packages/sports.svg";
import curatedChildIcon from "../assets/icons/packages/child-development.svg";
import curatedFamilyIcon from "../assets/icons/packages/family-planning.svg";
import curatedHairIcon from "../assets/icons/packages/hair-skin.svg";
import curatedCardioIcon from "../assets/icons/packages/cardio.svg";
import badgeCertifiedIcon from "../assets/icons/badges/certified.svg";
import microscopeIcon from "../assets/icons/badges/microscope.svg";
import badgeReportIcon from "../assets/icons/badges/report.svg";
import badgeSecureIcon from "../assets/icons/badges/secure.svg";
export const categories = ["All Categories", "Most Popular", "New Additions", "Cancer Risk"];
export const sectionTabs = ["Build Your Panel", "Curated Packages"];
export const panelTabs = ["All Categories", "Most Popular", "Preventive Care", "Longevity", "Hormones", "Fitness", "Family Planning", "Mental Wellness"];
export const filterGroups = [
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

export function getFilterGroupLabel(tab) {
  return filterGroups.find((group) => group.label === tab || group.subcategories.includes(tab))?.label || panelTabs[0];
}

export const categoryCards = [
  {
    title: "Cancer Risk",
    text: "Understand your inherited cancer risks and take proactive steps toward prevention.",
    price: "₹6,999",
    tag: "Preventive Care",
    icon: cancerPulseIcon,
    tone: "rose",
    overlayBadge: { label: "Most Chosen", variant: "chosen" },
  },
  {
    title: "Heart Health",
    text: "Assess your genetic risk for heart disease, cholesterol traits, and blood pressure pathways.",
    price: "₹6,999",
    tag: "Preventive Care",
    icon: cardioMonitorIcon,
    tone: "rose",
    overlayBadge: null,
  },
  {
    title: "Carrier Screening",
    text: "Identify genetic conditions you can pass on to your children before starting a family.",
    price: "₹6,999",
    tag: "Family Planning",
    icon: familyIcon,
    tone: "sea",
    overlayBadge: null,
  },
  {
    title: "Diabetes Risk",
    text: "Know your genetic risk for type 2 diabetes and metabolic conditions.",
    price: "₹6,999",
    tag: "Preventive Care",
    icon: metabolicIcon,
    tone: "blue",
    overlayBadge: null,
  },
  {
    title: "Hormone Health",
    text: "Understand your hormone balance better with a comprehensive endocrine analysis.",
    price: "₹6,999",
    tag: "Hormones",
    icon: "hormone-drop",
    tone: "purple",
    overlayBadge: { label: "Beginner Friendly", variant: "beginner" },
  },
  {
    title: "Fitness Potential",
    text: "Uncover your body's fitness strengths, recovery traits, and athletic predispositions.",
    price: "₹6,999",
    tag: "Fitness",
    icon: wellnessIcon,
    tone: "sea",
    overlayBadge: null,
  },
  {
    title: "Mental Wellness",
    text: "Genetic factors influencing mental wellness, mood pathways, and stress response.",
    price: "₹6,999",
    tag: "Mental Wellness",
    icon: neuroHeadIcon,
    tone: "blue",
    overlayBadge: null,
  },
  {
    title: "Pharmacogenomics",
    text: "How your genes affect medicine response and drug metabolism pathways.",
    price: "₹6,999",
    tag: "Medication",
    icon: hematologyIcon,
    tone: "rose",
    overlayBadge: null,
  },
];

export const popularCategories = [
  { title: "Cancer Risk",        stat: "52,000+ tests", tag: "Most Chosen",       tagVariant: "chosen",  tone: "rose",   rank: 1 },
  { title: "Heart Health",       stat: "38,400+ tests", tag: "Cardiologist Pick", tagVariant: "rose",    tone: "rose",   rank: 2 },
  { title: "Diabetes Risk",      stat: "29,100+ tests", tag: "Preventive",        tagVariant: "blue",    tone: "blue",   rank: 3 },
  { title: "Hormone Health",     stat: "24,500+ tests", tag: "Beginner Friendly", tagVariant: "purple",  tone: "purple", rank: 4 },
  { title: "Fitness Potential",  stat: "18,700+ tests", tag: "Performance",       tagVariant: "sea",     tone: "sea",    rank: 5 },
  { title: "Mental Wellness",    stat: "15,200+ tests", tag: "Trending",          tagVariant: "blue",    tone: "blue",   rank: 6 },
  { title: "Fertility & Family", stat: "12,900+ tests", tag: "Family Care",       tagVariant: "sea",     tone: "sea",    rank: 7 },
  { title: "Pharmacogenomics",   stat: "9,600+ tests",  tag: "Precision Med",     tagVariant: "purple",  tone: "purple", rank: 8 },
];

export const sharedIncludedItems = [
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

export const hematologyConditions = [
  "Thalassemia Traits",
  "Sickle Cell Carrier Status",
  "Hereditary Hemochromatosis",
  "G6PD Deficiency",
  "Factor V Leiden",
  "Von Willebrand Risk",
];

export const hematologyExpandedConditions = [
  ...hematologyConditions,
  "Hemophilia A Carrier Status",
  "Hemophilia B Carrier Status",
  "Beta Thalassemia Carrier Status",
  "Alpha Thalassemia Carrier Status",
  "Hereditary Spherocytosis",
  "Congenital Dyserythropoietic Anemia",
  "Diamond-Blackfan Anemia",
  "Fanconi Anemia",
  "Aplastic Anemia Predisposition",
  "Iron Overload Susceptibility",
  "Iron Deficiency Tendency",
  "Megaloblastic Anemia Risk",
  "Folate Metabolism",
  "Vitamin B12 Processing",
  "Platelet Function Traits",
  "Inherited Thrombocytopenia",
  "Clotting Factor Pathways",
  "Prothrombin Gene Variant",
  "Protein C Deficiency",
  "Protein S Deficiency",
  "Antithrombin Deficiency",
  "Fibrinogen Disorders",
  "Immune Cell Count Traits",
  "Neutropenia Predisposition",
  "Leukocyte Function Markers",
  "Red Cell Enzyme Deficiency",
  "Oxygen Transport Traits",
  "Erythropoietin Pathway Markers",
  "Bone Marrow Failure Risk",
  "Blood Group Antigen Traits",
];

export const hormoneHealthConditions = [
  "Thyroid Function Traits",
  "Insulin Sensitivity",
  "PCOS Risk Markers",
  "Vitamin D Metabolism",
  "Cortisol Response",
  "Reproductive Hormone Pathways",
];

export const hormoneHealthExpandedConditions = [
  ...hormoneHealthConditions,
  "TSH Regulation Traits",
  "T3 Conversion Efficiency",
  "T4 Transport Markers",
  "Autoimmune Thyroid Risk",
  "Hashimoto's Susceptibility",
  "Graves' Disease Susceptibility",
  "Iodine Utilization",
  "Estrogen Metabolism",
  "Progesterone Response",
  "Androgen Sensitivity",
  "Testosterone Pathway Traits",
  "DHEA Metabolism",
  "SHBG Regulation",
  "LH Signaling",
  "FSH Signaling",
  "Ovarian Reserve Markers",
  "Menstrual Cycle Traits",
  "Menopause Timing Markers",
  "Fertility Hormone Balance",
  "Prolactin Pathway Traits",
  "Growth Hormone Signaling",
  "IGF-1 Pathway Markers",
  "Adrenal Hormone Response",
  "ACTH Response Traits",
  "Stress Hormone Clearance",
  "Melatonin Rhythm Traits",
  "Circadian Hormone Timing",
  "Glucose-Insulin Balance",
  "Leptin Signaling",
  "Appetite Hormone Traits",
  "Parathyroid Hormone Pathway",
  "Calcium Regulation Traits",
  "Bone Hormone Signaling",
  "Inflammation-Hormone Interaction",
  "Medication-Hormone Response",
  "Endocrine Metabolism Risk",
];

export const panelDetails = {
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
    conditions: hematologyConditions,
    expandedConditions: hematologyExpandedConditions,
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
    conditionCount: "42 Conditions Analyzed",
    conditions: hormoneHealthConditions,
    expandedConditions: hormoneHealthExpandedConditions,
    viewAllLabel: "View all 42 conditions",
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
    conditionCount: "28 Conditions Analyzed",
    conditions: ["Stress Response", "Sleep Rhythm", "Mood Pathways", "Attention Traits", "Neurotransmitter Metabolism", "Medication Response"],
    viewAllLabel: "View all 28 conditions",
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
    conditionCount: "30 Conditions Analyzed",
    conditions: ["Alzheimer's Risk Context", "Cognitive Traits", "Migraine Susceptibility", "Neuropathy Risk", "Neuroinflammation", "Movement Disorder Markers"],
    viewAllLabel: "View all 30 conditions",
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
    conditionCount: "44 Conditions Analyzed",
    conditions: ["Insulin Sensitivity", "Lipid Processing", "Vitamin Metabolism", "Lactose Response", "Caffeine Metabolism", "Weight Regulation Traits"],
    viewAllLabel: "View all 44 conditions",
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

export const trendingTests = [
  {
    title: "Cancer Risk Panel",
    text: "Identify hereditary cancer risks across 54 conditions with BRCA1/2 screening.",
    price: "₹6,999",
    originalPrice: "₹9,999",
    discount: "30% Off",
    reportsIn: "15 days",
    testsCount: "54 conditions",
    icon: cancerPulseIcon,
    tone: "rose",
    overlayBadge: { label: "Most Chosen", variant: "chosen" },
  },
  {
    title: "Thyroid & Hormone",
    text: "Full endocrine panel — thyroid, cortisol, PCOS markers, and vitamin D metabolism.",
    price: "₹5,499",
    originalPrice: "₹7,999",
    discount: "31% Off",
    reportsIn: "12 days",
    testsCount: "42 conditions",
    icon: metabolicIcon,
    tone: "purple",
    overlayBadge: { label: "Beginner Friendly", variant: "beginner" },
  },
  {
    title: "Heart Health",
    text: "Genetic cardiovascular screen covering cholesterol traits, arrhythmia, and cardiomyopathy.",
    price: "₹5,999",
    originalPrice: "₹8,499",
    discount: "29% Off",
    reportsIn: "15 days",
    testsCount: "32 conditions",
    icon: cardioMonitorIcon,
    tone: "rose",
    overlayBadge: null,
  },
  {
    title: "Pharmacogenomics",
    text: "Discover how your DNA affects drug metabolism so doctors can prescribe with precision.",
    price: "₹7,499",
    originalPrice: "₹10,999",
    discount: "31% Off",
    reportsIn: "15 days",
    testsCount: "48 conditions",
    icon: hematologyIcon,
    tone: "blue",
    overlayBadge: null,
  },
];

export const recommendedPanels = [
  {
    title: "Whole Health Essentials",
    text: "All-in-one preventive health insights across the most critical genetic categories.",
    price: "₹9,999",
    originalPrice: "₹12,999",
    saving: "₹3,000",
    markers: "80+ markers",
    icon: wellnessIcon,
    tone: "purple",
    categories: ["Cancer Risk", "Cardiac", "Metabolic"],
    badge: "Most Popular",
    badgeColor: "badge--popular",
  },
  {
    title: "Advanced Heart Care",
    text: "Deep cardiovascular insights — cholesterol, arrhythmia, cardiomyopathy, and more.",
    price: "₹7,999",
    originalPrice: "₹10,999",
    saving: "₹3,000",
    markers: "32+ markers",
    icon: cardioMonitorIcon,
    tone: "rose",
    categories: ["Cardiac", "Lipid", "Blood Pressure"],
    badge: "Cardiologist Pick",
    badgeColor: "badge--rose",
  },
  {
    title: "Family Wealth Plus",
    text: "Comprehensive genomic insights for you and your family across key health categories.",
    price: "₹11,999",
    originalPrice: "₹15,999",
    saving: "₹4,000",
    markers: "60+ markers",
    icon: familyIcon,
    tone: "sea",
    categories: ["Carrier Screening", "Fertility", "Hormones"],
    badge: "Family Choice",
    badgeColor: "badge--teal",
  },
];

export const curatedPackageCards = [
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
  {
    title: "Cardiac & Metabolic Health",
    text: "Heart risk, lipid response, diabetes and metabolic wellness insights",
    badge: "Heart Smart",
    icon: curatedCardioIcon,
    tone: "rose",
    tags: ["Cardiac", "Metabolic", "Lipid", "Blood Pressure"],
  },
  {
    title: "Wellness & Longevity",
    text: "Preventive genomics for inflammation, nutrition, aging and energy",
    badge: "Preventive",
    icon: wellnessIcon,
    tone: "purple",
    tags: ["Longevity", "Nutrition", "Inflammation", "Vitamins"],
  },
];

export const featuredPanelCartItem = {
  title: "Complete Genomic Wellness",
  text: "Our most comprehensive screen covering 120+ clinical markers. A full-spectrum DNA analysis.",
  price: "₹499",
  tone: "purple",
  icon: wellnessIcon,
  chips: ["Cancer Risk", "Cardiac Health", "Pharmacogenomics"],
};

export const faqs = [
  "Which panels should I choose if I'm not sure?",
  "Can I unlock more panels later without re-testing?",
  "How secure is my genetic data?",
];

export const GENETIC_NAV_LINKS = [
  { label: "Tests", href: "/blood-test" },
  { label: "Genetics", href: "/genetics" },
  { label: "Reports", href: "/blood-test/reports" },
  { label: "Orders", href: "/blood-test/orders" },
];

export const popularCategoriesExtended = [
  {
    title: "Cancer Risk",
    headline: "Know your cancer risk before it knows you",
    description: "Understand your inherited cancer risks and take proactive steps toward prevention with clinical-grade genomic screening.",
    stat: "52,000+ tests taken",
    tag: "Most Chosen",
    tagVariant: "chosen",
    tone: "rose",
    price: "₹6,999",
    originalPrice: "₹9,999",
    discount: "30% Off",
    markers: "28+ markers",
  },
  {
    title: "Heart Health",
    headline: "Monitor your heart health",
    description: "Test for silent cardiovascular issues with advanced cardiac genomic panels and cut future medical bills.",
    stat: "38,400+ tests taken",
    tag: "Cardiologist Pick",
    tagVariant: "rose",
    tone: "rose",
    price: "₹5,999",
    originalPrice: "₹8,499",
    discount: "29% Off",
    markers: "32+ markers",
  },
  {
    title: "Diabetes Risk",
    headline: "Get your metabolic health assessed",
    description: "Understand your genetic predisposition to insulin resistance and diabetes. Act early, stay healthy.",
    stat: "29,100+ tests taken",
    tag: "Preventive",
    tagVariant: "blue",
    tone: "blue",
    price: "₹4,999",
    originalPrice: "₹6,999",
    discount: "28% Off",
    markers: "18+ markers",
  },
  {
    title: "Hormone Health",
    headline: "Balance your hormones, balance your life",
    description: "Decode your hormonal blueprint — testosterone, estrogen, cortisol, thyroid and more at a genomic level.",
    stat: "24,500+ tests taken",
    tag: "Beginner Friendly",
    tagVariant: "purple",
    tone: "purple",
    price: "₹5,499",
    originalPrice: "₹7,999",
    discount: "31% Off",
    markers: "22+ markers",
  },
  {
    title: "Fitness Potential",
    headline: "Train smarter with your DNA",
    description: "Unlock your genetic athletic profile — power, endurance, recovery, injury risk and nutrition response.",
    stat: "18,700+ tests taken",
    tag: "Performance",
    tagVariant: "sea",
    tone: "sea",
    price: "₹4,499",
    originalPrice: "₹6,499",
    discount: "30% Off",
    markers: "16+ markers",
  },
  {
    title: "Mental Wellness",
    headline: "Understand your mind at a genetic level",
    description: "Explore genomic factors behind mood, stress resilience, sleep patterns and neurological health.",
    stat: "15,200+ tests taken",
    tag: "Trending",
    tagVariant: "blue",
    tone: "blue",
    price: "₹5,999",
    originalPrice: "₹8,499",
    discount: "29% Off",
    markers: "24+ markers",
  },
  {
    title: "Fertility & Family",
    headline: "Plan your family with confidence",
    description: "Carrier screening and reproductive genomics to help you make informed family planning decisions.",
    stat: "12,900+ tests taken",
    tag: "Family Care",
    tagVariant: "sea",
    tone: "sea",
    price: "₹6,499",
    originalPrice: "₹9,499",
    discount: "31% Off",
    markers: "60+ markers",
  },
  {
    title: "Pharmacogenomics",
    headline: "Find the right medicine for your genes",
    description: "Discover how your DNA affects drug metabolism so your doctor can prescribe with precision.",
    stat: "9,600+ tests taken",
    tag: "Precision Med",
    tagVariant: "purple",
    tone: "purple",
    price: "₹7,499",
    originalPrice: "₹10,999",
    discount: "31% Off",
    markers: "48+ markers",
  },
];

export const howItWorksSteps = [
  {
    step: "01",
    text: "Choose a genetic panel or curated package tailored to your health goals",
  },
  {
    step: "02",
    text: "A trained phlebotomist will visit your home for sample collection",
  },
  {
    step: "03",
    text: "Your sample is processed in CAP & NABL certified labs using genomic technology",
  },
  {
    step: "04",
    text: "Get your interactive report and review results with a genetic counselor",
  },
];

export const GEN_WHY_FEATURES = [
  {
    icon: microscopeIcon,
    title: "CAP & NABL Certified Labs",
    desc: "Every sample is processed in accredited labs with rigorous quality standards.",
  },
  {
    icon: badgeCertifiedIcon,
    title: "Expert Genetic Counseling",
    desc: "Board-certified counselors guide you through your results and next steps.",
  },
  {
    icon: badgeReportIcon,
    title: "Clear Genomic Reports",
    desc: "Actionable insights delivered in plain language — no medical degree required.",
  },
  {
    icon: badgeSecureIcon,
    title: "End-to-End Data Privacy",
    desc: "Your DNA data is encrypted, never sold, and fully under your control.",
  },
];


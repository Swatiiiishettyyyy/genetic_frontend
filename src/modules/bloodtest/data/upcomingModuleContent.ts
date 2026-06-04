import gutImage from '../assets/upcoming/gut-score-dashboard.png'
import nutritionImage from '../assets/upcoming/nutrition-dashboard.jpeg'
import cellHealthImage from '../assets/upcoming/cell-health-dashboard.jpeg'

export type UpcomingModuleContent = {
  title: string
  description: string
  discoverLabel: string
  bullets: string[]
  image?: string
  imageAlt?: string
}

export const UPCOMING_MODULE_CONTENT: Record<string, UpcomingModuleContent> = {
  'genetic-testing': {
    title: 'Genetic testing',
    description:
      'Understand your body at a deeper level through DNA insights. Nucleotide helps you decode your genetics into simple, actionable health guidance.',
    discoverLabel: "What you'll discover:",
    bullets: [
      'Disease risk and prevention insights',
      'Nutrition and vitamin needs',
      'Fitness and lifestyle traits',
      'Drug response and compatibility',
    ],
  },
  gut: {
    title: 'Gut',
    description:
      'Understand and improve your gut health with personalized tracking and insights. Log daily habits, get a clear view of how your lifestyle impacts your gut.',
    discoverLabel: "What you'll discover:",
    bullets: [
      'Daily stool logging with type and symptom tracking',
      'Gut health score with trends over time',
      'Lifestyle impact from water, sleep, and fibre intake',
      'Smart insights and personalized recommendations',
    ],
    image: gutImage,
    imageAlt: 'Gut health dashboard preview',
  },
  nutrition: {
    title: 'Nutrition',
    description:
      "Food guidance built on your DNA and biomarkers - not generic advice. Understand what your body actually needs based on how it's wired and how it's performing.",
    discoverLabel: "What you'll discover:",
    bullets: [
      'Personalised deficiency detection',
      'Supplement and diet recommendations',
      'Linked to your genetic and blood data',
      'Macronutrient and micronutrient insights',
    ],
    image: nutritionImage,
    imageAlt: 'Nutrition dashboard preview',
  },
  'cell-health': {
    title: 'Cell Health',
    description:
      'Monitor your cellular health through advanced biomarker analysis. Track inflammation, oxidative stress, and metabolic markers to understand how your cells are ageing and performing.',
    discoverLabel: "What you'll discover:",
    bullets: [
      'Inflammation and oxidative stress markers',
      'Metabolic and mitochondrial health',
      'Cellular ageing insights',
      'Linked to your Digital Health Twin',
    ],
    image: cellHealthImage,
    imageAlt: 'Cell health dashboard preview',
  },
}

export function getUpcomingModuleContent(slug: string): UpcomingModuleContent {
  return UPCOMING_MODULE_CONTENT[slug]
}

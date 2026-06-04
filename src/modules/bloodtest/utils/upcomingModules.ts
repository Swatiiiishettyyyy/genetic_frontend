export type UpcomingModuleIcon = 'genetic' | 'lab' | 'gut' | 'nutrition' | 'cell'

export type UpcomingModule = {
  slug: string
  label: string
  icon: UpcomingModuleIcon
}

export const UPCOMING_MODULES: UpcomingModule[] = [
  { slug: 'genetic-testing', label: 'Genetic Testing', icon: 'genetic' },
  { slug: 'gut', label: 'Gut', icon: 'gut' },
  { slug: 'nutrition', label: 'Nutrition', icon: 'nutrition' },
  { slug: 'cell-health', label: 'Cell Health', icon: 'cell' },
]

export function upcomingPath(slug: string): string {
  return `/upcoming/${slug}`
}

export function findUpcomingModule(slug: string | undefined): UpcomingModule | undefined {
  if (!slug) return undefined
  return UPCOMING_MODULES.find(module => module.slug === slug)
}

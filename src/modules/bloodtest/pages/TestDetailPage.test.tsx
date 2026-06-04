import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import TestDetailPage from './TestDetailPage'

type MockProduct = {
  id: number
  name: string
  product_name: string
  type: string
  no_of_tests_included: number
  selling_price: number
  strikeout_price: number
  beneficiaries_min: number
  beneficiaries_max: number
  is_fasting_required: boolean
  about: string
  short_description: string
  category: string
  parameters: { id: number; name: string; group_name?: string | null }[]
}

const catalogMock = vi.hoisted(() => ({
  state: {
    products: [] as MockProduct[],
    ready: false,
    error: null as string | null,
  },
  fetchProductById: vi.fn(),
}))

vi.mock('../components', () => ({
  Navbar: ({ ctaLabel }: { ctaLabel?: string }) => <nav>{ctaLabel}</nav>,
  Footer: () => <footer />,
}))

vi.mock('../hooks/useProductCatalog', () => ({
  useProductCatalog: () => catalogMock.state,
}))

vi.mock('../api/products', () => ({
  fetchProductById: catalogMock.fetchProductById,
  parseProductCategories: (product: MockProduct) => {
    try {
      const parsed = JSON.parse(product.category)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return product.category ? [product.category] : []
    }
  },
  toTestCard: (product: MockProduct) => ({
    thyrocareProductId: product.id,
    maxBeneficiaries: product.beneficiaries_max,
    name: product.product_name || product.name,
    description: product.about || product.short_description,
    price: String(product.selling_price),
    originalPrice: String(product.strikeout_price),
    offerPercent: '30% OFF',
    tests: product.no_of_tests_included,
    fasting: product.is_fasting_required ? 'Fasting Required' : 'No Fasting Required',
    type: product.type === 'PSKU' ? 'Single' : 'Package',
  }),
}))

const cancerMaleProduct: MockProduct = {
  id: 3184,
  name: 'Cancer Male Package',
  product_name: 'Cancer Male Package',
  type: 'OFFER',
  no_of_tests_included: 6,
  selling_price: 1390,
  strikeout_price: 1986,
  beneficiaries_min: 1,
  beneficiaries_max: 1,
  is_fasting_required: false,
  about: 'Cancer risk screening package for men.',
  short_description: '6 parameters analysed for cancer risk screening.',
  category: '["popular_packages","25-50men","50+men"]',
  parameters: [
    { id: 1, name: 'ALPHA FETO PROTEIN (AFP)', group_name: 'Cancer Markers' },
    { id: 2, name: 'PROSTATE SPECIFIC ANTIGEN (PSA)', group_name: 'Cancer Markers' },
  ],
}

function routeUi() {
  return (
    <MemoryRouter initialEntries={['/blood-test/Cancer-Male-Package']}>
      <Routes>
        <Route path="/blood-test/:id" element={<TestDetailPage cartCount={0} />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('TestDetailPage cold direct loads', () => {
  beforeEach(() => {
    catalogMock.state = { products: [], ready: false, error: null }
    catalogMock.fetchProductById.mockImplementation(async (id: number) => {
      const found = catalogMock.state.products.find(product => product.id === id)
      if (!found) throw new Error('Product not found')
      return found
    })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('keeps hook order stable when catalog data arrives after an initial direct slug render', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const view = render(routeUi())

    catalogMock.state = { products: [cancerMaleProduct], ready: true, error: null }

    expect(() => view.rerender(routeUi())).not.toThrow()
    expect(await screen.findByRole('heading', { name: /Cancer Male Package/i })).toBeInTheDocument()

    const consoleMessages = consoleError.mock.calls.map(call => call.join(' ')).join('\n')
    expect(consoleMessages).not.toMatch(/Rendered more hooks|Minified React error #310/i)
    consoleError.mockRestore()
  })
})

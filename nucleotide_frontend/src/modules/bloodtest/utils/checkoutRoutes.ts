import { bloodTestPath } from './routes'

export type CheckoutModule = 'blood-test' | 'genetic-test'
export type CheckoutStep = 'cart' | 'address' | 'timeslot' | 'payment' | 'confirmation'

export function checkoutModuleFromPath(pathname: string): CheckoutModule {
  return pathname.startsWith('/genetic-tests/') ? 'genetic-test' : 'blood-test'
}

export function checkoutPathForModule(module: CheckoutModule, step: CheckoutStep): string {
  if (module === 'genetic-test') return `/genetic-tests/${step}`
  return bloodTestPath(step)
}

export function checkoutPathFromLocation(pathname: string, step: CheckoutStep): string {
  return checkoutPathForModule(checkoutModuleFromPath(pathname), step)
}

export function checkoutHomePath(module: CheckoutModule): string {
  return module === 'genetic-test' ? '/genetic-tests' : bloodTestPath('tests')
}

export function checkoutLabels(module: CheckoutModule) {
  return module === 'genetic-test'
    ? {
        navRoot: 'Genetic Tests',
        selectedTitle: 'Select Genetic Tests',
        emptyCopy: 'No selected genetic tests.',
        collection: 'Home collection',
        collectionTime: 'Select Home Collection Time',
      }
    : {
        navRoot: 'Tests',
        selectedTitle: 'Select Tests',
        emptyCopy: 'No selected tests.',
        collection: 'Home Collection',
        collectionTime: 'Select Collection Time',
      }
}

import { Navbar as SharedNavbar } from '../../../../shared/components/Navbar'
import type { NavbarProps } from '../../../../shared/components/Navbar'

export function Navbar(props: NavbarProps & { cartCount?: number }) {
  return <SharedNavbar {...props} analyticsScope="bloodtest" />
}

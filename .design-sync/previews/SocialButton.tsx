import { SocialButton, VenmoIcon, PatreonIcon } from "tibbiex-ui"
import { Instagram, Music } from "lucide-react"

/* The row of keys under the profile card. */
export const Row = () => (
  <ul className="flex gap-cluster">
    <li>
      <SocialButton icon={Instagram} label="Instagram" href="#" />
    </li>
    <li>
      <SocialButton icon={Music} label="Bandcamp" href="#" />
    </li>
    <li>
      <SocialButton icon={PatreonIcon} label="Patreon" href="#" />
    </li>
    <li>
      <SocialButton icon={VenmoIcon} label="Venmo" href="#" />
    </li>
  </ul>
)

export const Single = () => (
  <SocialButton icon={Instagram} label="Instagram" href="#" />
)

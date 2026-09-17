import { Disc } from "lucide-react"

import type { Album } from "../content/music"
import BrandButton from "../components/controls/BrandButton"
import Overlay from "../components/overlays/Overlay"
import OverlayBody from "../components/overlays/OverlayBody"

/* One record, opened from the Music tab or the rehearsal panel. */
export default function AlbumModal({
  album,
  onClose,
}: {
  album: Album
  onClose: () => void
}) {
  return (
    <Overlay onClose={onClose}>
      <img
        src={album.image}
        alt={album.album}
        className="h-56 w-full object-cover"
      />
      <OverlayBody eyebrow={album.band} title={album.album}>
        <p className="mt-2 text-sm text-muted-foreground">
          Released {album.year} · {album.role}
        </p>
        {album.track && (
          <p className="mono-label mt-3 text-accent-strong">
            Featured track — “{album.track}”
          </p>
        )}
        <BrandButton className="mt-6">
          <Disc size={18} /> Stream Now
        </BrandButton>
      </OverlayBody>
    </Overlay>
  )
}

import { Disc } from "lucide-react"

import type { Album } from "../../content/music"
import Button from "../../ui/controls/Button"
import Overlay from "../../ui/overlays/Overlay"
import OverlayBody from "../../ui/overlays/OverlayBody"

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
          <p className="mono-label mt-3 text-accent">
            Featured track — “{album.track}”
          </p>
        )}
        <Button className="mt-6" icon={Disc}>
          Stream Now
        </Button>
      </OverlayBody>
    </Overlay>
  )
}

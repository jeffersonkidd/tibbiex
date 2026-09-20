import { DISCOGRAPHY } from "../content/music"
import type { Album } from "../content/music"
import AlbumTile from "../ui/cards/AlbumTile"

export default function MusicTab({
  onOpenAlbum,
}: {
  onOpenAlbum: (album: Album) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {DISCOGRAPHY.map((rec) => (
        <AlbumTile key={rec.id} album={rec} onOpen={() => onOpenAlbum(rec)} />
      ))}
    </div>
  )
}

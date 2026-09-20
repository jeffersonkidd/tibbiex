import { DISCOGRAPHY } from "../content/music"
import type { Album } from "../content/music"
import RehearsalPanel from "../site/RehearsalPanel"
import AlbumTile from "../ui/cards/AlbumTile"

/* Rehearsal status above the discography: the panel is about the record being
   rehearsed, so it opens that record's modal over the grid behind it. */
export default function MusicTab({
  onOpenRehearsal,
  onOpenAlbum,
}: {
  onOpenRehearsal: () => void
  onOpenAlbum: (album: Album) => void
}) {
  return (
    <>
      <RehearsalPanel onOpen={onOpenRehearsal} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {DISCOGRAPHY.map((rec) => (
          <AlbumTile key={rec.id} album={rec} onOpen={() => onOpenAlbum(rec)} />
        ))}
      </div>
    </>
  )
}

import type { Album } from "../../content/music"

/* One record in the Music tab: artwork filling the tile, with the text on a
   gradient rising from its bottom edge. */
export default function AlbumTile({
  album,
  onOpen,
}: {
  album: Album
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="surface group relative cursor-pointer overflow-hidden rounded-lg text-left transition-colors hover:border-accent"
    >
      <div className="h-48 overflow-hidden">
        <img
          src={album.image}
          alt={album.album}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/80 to-transparent p-4 pt-12">
        <div className="text-lg font-bold leading-tight">{album.album}</div>
        <p className="text-xs font-medium text-accent-strong">{album.band}</p>
        <p className="mono-label mt-1 text-muted-foreground">
          {album.year} · {album.role}
        </p>
      </div>
    </button>
  )
}

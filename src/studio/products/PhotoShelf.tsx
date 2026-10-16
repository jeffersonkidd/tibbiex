import { useEffect, useRef, useState } from "react"
import { ArrowLeft, ImagePlus, Star, X } from "lucide-react"
import { toast } from "sonner"

import { StudioError } from "../passcode"
import type { Write } from "../passcode"
import { shrinkPhoto, uploadPhoto } from "./products"

/* An item's photos: the first is the cover -- the shop card, the polaroid,
   the first thing the product modal opens on -- and the rest are the
   thumbnails under it. Photos go up the moment they are picked, dropped or
   pasted, shrunk in the browser first; nothing is on the site until the
   catalogue that names them is published. */
export default function PhotoShelf({
  gallery,
  onChange,
  run,
}: {
  gallery: string[]
  onChange: (next: string[]) => void
  run: (write: Write) => Promise<void>
}) {
  const [uploading, setUploading] = useState(0)
  const [over, setOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  /* Uploads finish after the gallery prop has moved on, so each one adds to
     the latest list rather than the one it started from. */
  const latest = useRef(gallery)
  latest.current = gallery

  /* One write for the whole batch, so a passcode asked for midway covers
     every photo, and a refused one resumes at the photo it stopped on
     rather than uploading the earlier ones twice. */
  async function add(files: File[]) {
    const photos = files.filter((file) => file.type.startsWith("image/"))
    if (!photos.length) {
      if (files.length) toast.error("That isn't a photo.")
      return
    }
    let next = 0
    try {
      await run(async (passcode) => {
        setUploading(photos.length - next)
        try {
          for (; next < photos.length; next++) {
            const url = await uploadPhoto(
              passcode,
              await shrinkPhoto(photos[next]),
            )
            latest.current = [...latest.current, url]
            onChange(latest.current)
            setUploading(photos.length - next - 1)
          }
        } finally {
          setUploading(0)
        }
      })
    } catch (error) {
      toast.error(
        error instanceof StudioError
          ? error.message
          : "That photo didn't upload.",
      )
    }
  }

  /* A photo pasted anywhere while the editor is open lands here. */
  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const target = e.target as HTMLElement | null
      if (target?.closest("input, textarea")) return
      const files = [...(e.clipboardData?.files ?? [])]
      if (files.some((file) => file.type.startsWith("image/"))) add(files)
    }
    window.addEventListener("paste", onPaste)
    return () => window.removeEventListener("paste", onPaste)
  })

  function move(from: number, to: number) {
    const next = [...gallery]
    const [photo] = next.splice(from, 1)
    next.splice(to, 0, photo)
    onChange(next)
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(false)
      }}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        add([...e.dataTransfer.files])
      }}
      className={`grid grid-cols-3 gap-cluster rounded-md ${over ? "studio-drop-zone" : ""}`}
    >
      {gallery.map((src, index) => (
        <figure
          key={src}
          className="studio-photo group relative aspect-square overflow-hidden rounded-md border border-border bg-muted"
        >
          <img
            src={src}
            alt=""
            className="studio-face size-full object-cover"
            draggable={false}
          />
          {index === 0 && (
            <figcaption className="label-mono absolute top-1.5 left-1.5 rounded-xs bg-page/80 px-1.5 py-0.5 text-accent">
              Cover
            </figcaption>
          )}
          <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-page/90 to-transparent p-1.5 pt-6">
            {index > 0 && (
              <>
                <PhotoKey
                  label="Move earlier"
                  onClick={() => move(index, index - 1)}
                >
                  <ArrowLeft className="size-3.5" />
                </PhotoKey>
                <PhotoKey
                  label="Make it the cover"
                  onClick={() => move(index, 0)}
                >
                  <Star className="size-3.5" />
                </PhotoKey>
              </>
            )}
            <PhotoKey
              label="Remove photo"
              onClick={() => onChange(gallery.filter((_, i) => i !== index))}
            >
              <X className="size-3.5" />
            </PhotoKey>
          </div>
        </figure>
      ))}

      {Array.from({ length: uploading }, (_, i) => (
        <div
          key={`up-${i}`}
          className="studio-uploading label-mono flex aspect-square items-center justify-center rounded-md border border-dashed border-accent-soft text-accent"
        >
          Uploading
        </div>
      ))}

      {gallery.length + uploading < 12 && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-square flex-col items-center justify-center gap-glyph rounded-md border border-dashed border-border text-muted-foreground transition-colors hover:border-accent hover:text-accent"
        >
          <ImagePlus className="size-5" />
          <span className="body-xs-bold">
            {gallery.length ? "Add more" : "Add photos"}
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          add([...(e.target.files ?? [])])
          e.target.value = ""
        }}
      />
    </div>
  )
}

function PhotoKey({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex size-7 items-center justify-center rounded-sm border border-border bg-card/90 text-foreground transition-colors hover:border-accent hover:text-accent"
    >
      {children}
    </button>
  )
}

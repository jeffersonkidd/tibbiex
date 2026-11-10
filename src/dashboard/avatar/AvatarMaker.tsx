import { useEffect, useRef, useState } from "react"
import type { MouseEvent, PointerEvent } from "react"
import { ImagePlus, RotateCcw, UserRound, ZoomIn, ZoomOut } from "lucide-react"
import { toast } from "sonner"

import profilePic from "../../assets/imagery/tibbie-portrait-4.png"
import { castMagicFrom } from "../../lib/magic-dust"
import Button from "../../ui/controls/Button"
import Field from "../../ui/controls/Field"
import PanelHeader from "../../ui/display/PanelHeader"
import { ago } from "../links/ledger"
import {
  StudioError,
  clampCrop,
  drawnSize,
  fetchLive,
  publish,
  renderCrop,
  restore,
  savedPasscode,
} from "./avatar"
import type { Crop, Live } from "./avatar"

/* The round window inside the ring, in px: the ring is w-56 (224) and
   .avatar pads it by 8 on every side. The crop is measured against this. */
const WINDOW = 208
const MAX_ZOOM = 4
const START: Crop = { zoom: 1, x: 0, y: 0 }

type Picked = { el: HTMLImageElement; src: string }

/* Module 02. The ring at the top is the real avatar treatment, and it is
   the whole tool: it shows what is live, takes a dropped or pasted photo,
   and becomes the crop window in place -- drag to frame, slide to zoom --
   so what is framed is exactly what the card will show. One button makes it
   live. */
export default function AvatarMaker() {
  const [live, setLive] = useState<Live | null>(null)
  const [picked, setPicked] = useState<Picked | null>(null)
  const [crop, setCrop] = useState<Crop>(START)
  const [over, setOver] = useState(false)
  const [busy, setBusy] = useState(false)
  const [passcode, setPasscode] = useState(savedPasscode)
  /* Ask for the passcode only when it is needed and not already saved. */
  const [asking, setAsking] = useState(false)
  const [passcodeError, setPasscodeError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const windowRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(
    null,
  )

  useEffect(() => {
    fetchLive().then(setLive)
  }, [])

  function take(file: File | undefined) {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("That isn't an image.")
      return
    }
    const src = URL.createObjectURL(file)
    const el = new Image()
    el.onload = () => {
      if (picked) URL.revokeObjectURL(picked.src)
      setPicked({ el, src })
      setCrop(START)
    }
    el.onerror = () => {
      URL.revokeObjectURL(src)
      toast.error("Couldn't open that image. Try a JPG or PNG.")
    }
    el.src = src
  }

  function drop() {
    if (picked) URL.revokeObjectURL(picked.src)
    setPicked(null)
    setAsking(false)
    setPasscodeError("")
  }

  /* A photo pasted anywhere on the page lands in the ring. */
  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const file = e.clipboardData?.files?.[0]
      if (file?.type.startsWith("image/")) take(file)
    }
    window.addEventListener("paste", onPaste)
    return () => window.removeEventListener("paste", onPaste)
  })

  /* Wheel and trackpad pinch zoom the crop. Attached by hand because React
     registers wheel listeners as passive, and the page must not scroll
     while the pointer is over the window. */
  useEffect(() => {
    const node = windowRef.current
    if (!node || !picked) return
    function onWheel(e: WheelEvent) {
      e.preventDefault()
      setCrop((c) => zoomTo(c, c.zoom * Math.exp(-e.deltaY / 400)))
    }
    node.addEventListener("wheel", onWheel, { passive: false })
    return () => node.removeEventListener("wheel", onWheel)
  })

  function zoomTo(c: Crop, zoom: number) {
    if (!picked) return c
    const z = Math.max(1, Math.min(MAX_ZOOM, zoom))
    /* Scale the offset with the zoom, so the point under the centre stays
       under the centre. */
    const r = z / c.zoom
    return clampCrop(picked.el, { zoom: z, x: c.x * r, y: c.y * r }, WINDOW)
  }

  function nudge(dx: number, dy: number) {
    if (!picked) return
    setCrop((c) =>
      clampCrop(picked.el, { ...c, x: c.x + dx, y: c.y + dy }, WINDOW),
    )
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (!picked) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { px: e.clientX, py: e.clientY, x: crop.x, y: crop.y }
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const start = drag.current
    if (!start || !picked) return
    setCrop((c) =>
      clampCrop(
        picked.el,
        {
          ...c,
          x: start.x + e.clientX - start.px,
          y: start.y + e.clientY - start.py,
        },
        WINDOW,
      ),
    )
  }

  /* Both writes need the passcode: ask for it the first time, then use the
     saved one. A wrong one is forgotten and asked for again. */
  async function run(
    e: MouseEvent<HTMLButtonElement>,
    action: (passcode: string) => Promise<Live>,
    done: string,
  ) {
    if (!passcode) {
      setAsking(true)
      return
    }
    setBusy(true)
    try {
      const next = await action(passcode)
      castMagicFrom(e)
      setLive(next)
      drop()
      toast.success(done)
    } catch (error) {
      if (error instanceof StudioError && error.badPasscode) {
        setPasscode("")
        setAsking(true)
        setPasscodeError(error.message)
      } else {
        toast.error(
          error instanceof Error ? error.message : "Something went wrong.",
        )
      }
    } finally {
      setBusy(false)
    }
  }

  const goLive = (e: MouseEvent<HTMLButtonElement>) =>
    run(
      e,
      async (code) => publish(code, await renderCrop(picked!.el, crop, WINDOW)),
      "New face is live. The site catches up within a minute.",
    )

  const goBack = (e: MouseEvent<HTMLButtonElement>) =>
    run(e, restore, "Back to the original portrait.")

  const shown = picked
    ? drawnSize(picked.el, crop.zoom, WINDOW)
    : { w: WINDOW, h: WINDOW }

  return (
    <section
      aria-label="Avatar"
      className="surface rounded-lg p-panel"
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
        take(e.dataTransfer.files[0])
      }}
    >
      <PanelHeader
        icon={UserRound}
        eyebrow="Module 02"
        title="Avatar"
        sub="The face on the profile card. Swap it whenever you like."
      />

      <div className="mt-panel flex flex-col items-center">
        <div className={`avatar size-56 ${over ? "studio-drop" : ""}`}>
          <div
            ref={windowRef}
            tabIndex={picked ? 0 : -1}
            role={picked ? "application" : undefined}
            aria-label={
              picked
                ? "Crop: drag or use the arrow keys to frame, plus and minus to zoom"
                : undefined
            }
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={() => (drag.current = null)}
            onPointerCancel={() => (drag.current = null)}
            onKeyDown={(e) => {
              const step = e.shiftKey ? 16 : 4
              const keys: Record<string, () => void> = {
                ArrowLeft: () => nudge(-step, 0),
                ArrowRight: () => nudge(step, 0),
                ArrowUp: () => nudge(0, -step),
                ArrowDown: () => nudge(0, step),
                "+": () => setCrop((c) => zoomTo(c, c.zoom + 0.1)),
                "=": () => setCrop((c) => zoomTo(c, c.zoom + 0.1)),
                "-": () => setCrop((c) => zoomTo(c, c.zoom - 0.1)),
              }
              if (keys[e.key]) {
                e.preventDefault()
                keys[e.key]()
              }
            }}
            className={`studio-crop relative size-full overflow-hidden rounded-full ${
              picked ? "cursor-grab touch-none active:cursor-grabbing" : ""
            }`}
          >
            {picked ? (
              <img
                src={picked.src}
                alt=""
                draggable={false}
                className="pointer-events-none absolute max-w-none select-none"
                style={{
                  width: shown.w,
                  height: shown.h,
                  left: WINDOW / 2 + crop.x - shown.w / 2,
                  top: WINDOW / 2 + crop.y - shown.h / 2,
                }}
              />
            ) : (
              live && (
                <img
                  key={live.url ?? "original"}
                  src={live.url ?? profilePic}
                  alt="The avatar on the site now"
                  className="studio-face size-full object-cover"
                />
              )
            )}
            {over && (
              <span className="label-mono absolute inset-0 flex items-center justify-center bg-scrim/70 text-tertiary">
                Drop it in
              </span>
            )}
          </div>
        </div>

        <p className="label-mono mt-panel text-on-surface-variant">
          {picked
            ? "Drag to frame it"
            : !live
              ? "Loading…"
              : live.url
                ? `Live · uploaded ${live.uploadedAt ? ago(+new Date(live.uploadedAt)) : ""}`
                : "Live · the original portrait"}
        </p>
      </div>

      {picked && (
        <label className="mt-part flex items-center gap-part text-on-surface-variant">
          <ZoomOut className="size-4 shrink-0" aria-hidden />
          <input
            type="range"
            min={1}
            max={MAX_ZOOM}
            step={0.01}
            value={crop.zoom}
            onChange={(e) => setCrop((c) => zoomTo(c, Number(e.target.value)))}
            aria-label="Zoom"
            className="studio-range flex-1"
          />
          <ZoomIn className="size-4 shrink-0" aria-hidden />
        </label>
      )}

      {asking && (
        <form
          className="mt-panel space-y-1.5"
          /* Enter does nothing here: the button below is the action, and
             it reads the passcode as typed. */
          onSubmit={(e) => e.preventDefault()}
        >
          <Field
            type="password"
            label="Studio passcode"
            placeholder="Studio passcode"
            autoComplete="current-password"
            value={passcode}
            onChange={setPasscode}
            invalid={Boolean(passcodeError)}
            required={false}
          />
          <p
            className={`body-xs ${passcodeError ? "text-error" : "text-on-surface-variant"}`}
          >
            {passcodeError ||
              "Asked once on this device, so a stranger can't change your face."}
          </p>
        </form>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          take(e.target.files?.[0])
          e.target.value = ""
        }}
      />

      <div className="mt-panel space-y-cluster">
        {picked ? (
          <>
            <Button icon={ImagePlus} onClick={goLive} disabled={busy}>
              {busy ? "Going live…" : "Make it live"}
            </Button>
            <div className="flex gap-cluster">
              <div className="flex-1">
                <Button
                  tone="secondary"
                  onClick={() => inputRef.current?.click()}
                >
                  Another photo
                </Button>
              </div>
              <div className="flex-1">
                <Button tone="secondary" onClick={drop}>
                  Cancel
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <Button icon={ImagePlus} onClick={() => inputRef.current?.click()}>
              Choose a photo
            </Button>
            <p className="body-xs text-center text-on-surface-variant">
              Or drop one on the ring, or paste it.
            </p>
            {live?.url && (
              <div className="flex justify-center pt-1">
                <Button
                  tone="secondary"
                  shape="inline"
                  icon={RotateCcw}
                  onClick={goBack}
                  disabled={busy}
                >
                  Back to the original
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

import { useEffect, useRef, useState } from "react"
import { ChevronRight, Link2, Undo2 } from "lucide-react"
import type { MouseEvent } from "react"
import { toast } from "sonner"

import { CHANNELS, ELSEWHERE, PLACEMENTS } from "../../content/channels"
import type { Channel } from "../../content/channels"
import { castMagicFrom } from "../../lib/magic-dust"
import { buildLink, slug } from "../../lib/utm"
import Button from "../../ui/controls/Button"
import Chip from "../../ui/controls/Chip"
import Field from "../../ui/controls/Field"
import Meter from "../../ui/display/Meter"
import PanelHeader from "../../ui/display/PanelHeader"
import { ago, useLedger } from "./ledger"
import LinkTicket from "./LinkTicket"

const TILES = [...CHANNELS, ELSEWHERE]
const OTHER = "other"
const KEYS = "1234567890"

/* Module 01. Three moves, top to bottom: pick the profile, pick the spot on
   it, copy. The ticket rebuilds on every tap, so there is no "generate" step
   to forget; the steps card under it says where the paste goes, and the
   ledger at the bottom keeps score across visits. */
export default function LinkMaker() {
  const [channel, setChannel] = useState<Channel>(CHANNELS[0])
  const [placement, setPlacement] = useState<string>(PLACEMENTS[0].id)
  const [otherPlacement, setOtherPlacement] = useState("")
  const [elsewhere, setElsewhere] = useState("")
  /* Copies of the link as it stands now; reset when any choice changes, so
     the stamp and the lit steps belong to this exact link. */
  const [copies, setCopies] = useState(0)
  const { ledger, markCopied, setWired } = useLedger()
  const ticketRef = useRef<HTMLDivElement>(null)

  const isElsewhere = channel.id === ELSEWHERE.id
  const tag = {
    source: isElsewhere ? elsewhere : channel.source,
    medium: channel.medium,
    campaign: placement === OTHER ? otherPlacement : placement,
  }
  const ready = Boolean(slug(tag.source) && slug(tag.campaign))
  const url = buildLink(tag)
  const entry = isElsewhere ? undefined : ledger[channel.id]
  const wired = Boolean(entry?.wiredAt && entry.url === url)

  useEffect(() => setCopies(0), [url])

  /* The address as text, selected, for when the clipboard API is refused
     (an insecure origin, an embedded browser): the system copy still works. */
  function selectLink() {
    const node = document.getElementById("studio-link")
    const selection = window.getSelection()
    if (!node || !selection) return
    const range = document.createRange()
    range.selectNodeContents(node)
    selection.removeAllRanges()
    selection.addRange(range)
  }

  async function copy(e?: MouseEvent<HTMLButtonElement>) {
    if (!ready) return
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      selectLink()
      toast.error(
        "Couldn't reach the clipboard. The link is selected: copy it from there.",
      )
      return
    }
    if (e) castMagicFrom(e)
    setCopies((n) => n + 1)
    if (!isElsewhere) markCopied(channel.id, url)
  }

  function wire(e: MouseEvent<HTMLButtonElement>) {
    castMagicFrom(e)
    setWired(channel.id, true)
    const left = CHANNELS.filter(
      (c) => c.id !== channel.id && !ledger[c.id]?.wiredAt,
    )
    toast.success(
      left.length
        ? `${channel.name} points home. ${left.length} to go.`
        : "Every profile points home.",
    )
  }

  /* C copies from anywhere but a text field; 1-9 and 0 pick a profile, in
     the order of the tiles. */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement
      if (target.closest("input, textarea, [contenteditable]")) return
      if (e.key === "c" || e.key === "C") {
        e.preventDefault()
        copy()
      }
      const i = KEYS.indexOf(e.key)
      if (i >= 0 && i < TILES.length) setChannel(TILES[i])
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  const wiredCount = CHANNELS.filter((c) => ledger[c.id]?.wiredAt).length

  return (
    <section className="space-y-stack" aria-label="Link Maker">
      <div className="surface rounded-lg p-panel">
        <PanelHeader
          icon={Link2}
          eyebrow="Module 01"
          title="Link Maker"
          sub="One link per profile, so the numbers say where fans come from."
        />

        <Step n={1} label="Where's it going?" />
        <div
          role="radiogroup"
          aria-label="Profile"
          className="grid grid-cols-3 gap-cluster sm:grid-cols-5"
        >
          {TILES.map((tile, i) => {
            const state = ledger[tile.id]
            const Icon = tile.icon
            const on = tile.id === channel.id
            return (
              <button
                key={tile.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setChannel(tile)}
                className={`studio-tile group relative ${
                  tile.id === ELSEWHERE.id ? "col-span-3 sm:col-span-1" : ""
                } flex flex-col items-center gap-glyph rounded-md border px-1 py-3 transition-all ${
                  on
                    ? "brand-pop border-transparent bg-secondary-container text-on-secondary-container"
                    : "border-outline-variant bg-surface-container-lowest/80 text-on-surface-variant hover:border-outline hover:text-on-surface"
                }`}
              >
                <Icon className="size-5" />
                <span className="body-xs-bold">{tile.name}</span>
                {i < KEYS.length && (
                  <kbd className="studio-kbd absolute top-1 left-1 hidden sm:block">
                    {KEYS[i]}
                  </kbd>
                )}
                {state && (
                  <span
                    aria-label={state.wiredAt ? "wired" : "copied"}
                    className={`studio-dot absolute top-1.5 right-1.5 ${
                      state.wiredAt ? "studio-dot-wired" : ""
                    }`}
                  />
                )}
              </button>
            )
          })}
        </div>

        {isElsewhere && (
          <div className="mt-part">
            <Field
              type="text"
              label="Where is it going?"
              placeholder="Name the place: Linktree, Bandcamp, a flyer…"
              value={elsewhere}
              onChange={setElsewhere}
              required={false}
              size="sm"
            />
          </div>
        )}

        <Step n={2} label="Where on the profile?" />
        <div className="grid grid-cols-5 gap-cluster">
          {PLACEMENTS.map((p) => (
            <Chip
              key={p.id}
              pressed={placement === p.id}
              onClick={() => setPlacement(p.id)}
            >
              {p.label}
            </Chip>
          ))}
          <Chip
            pressed={placement === OTHER}
            onClick={() => setPlacement(OTHER)}
          >
            Other
          </Chip>
        </div>
        {placement === OTHER && (
          <div className="mt-part">
            <Field
              type="text"
              label="Where on the profile?"
              placeholder="Name it: pinned comment, tour poster…"
              value={otherPlacement}
              onChange={setOtherPlacement}
              required={false}
              size="sm"
            />
          </div>
        )}
      </div>

      <div ref={ticketRef}>
        <LinkTicket
          tag={tag}
          url={url}
          copies={copies}
          ready={ready}
          onCopy={copy}
        />
      </div>

      {channel.where.length > 0 && (
        <div
          className={`surface rounded-lg p-panel transition-colors ${
            copies > 0 && !wired ? "featured" : ""
          }`}
        >
          <Step n={3} label={`Paste it into ${channel.name}`} flush />
          <ol className="flex flex-wrap items-center gap-y-cluster gap-x-1">
            {[...channel.where, "Paste"].map((step, i, all) => (
              <li key={step} className="flex items-center gap-1">
                <span
                  className={`rounded-md border px-2 py-1 body-xs-bold ${
                    i === all.length - 1
                      ? "border-tertiary/20 bg-tertiary/10 text-tertiary"
                      : "border-outline-variant bg-surface-container-lowest/80 text-on-surface"
                  }`}
                >
                  {step}
                </span>
                {i < all.length - 1 && (
                  <ChevronRight
                    aria-hidden
                    className="size-3.5 text-on-surface-variant"
                  />
                )}
              </li>
            ))}
          </ol>
          {channel.inText && (
            <p className="body-xs mt-part text-on-surface-variant">
              There's no link field here: paste it into the text itself, on a
              line of its own.
            </p>
          )}
          <div className="mt-panel flex items-center gap-part">
            {wired ? (
              <>
                <p className="body-small-bold flex-1 text-tertiary">
                  Wired {ago(entry!.wiredAt!)}.
                </p>
                <Button
                  tone="secondary"
                  shape="inline"
                  icon={Undo2}
                  onClick={() => setWired(channel.id, false)}
                >
                  Not yet
                </Button>
              </>
            ) : (
              <div className="w-full">
                <Button
                  tone="secondary"
                  onClick={wire}
                  disabled={copies === 0 && entry?.url !== url}
                >
                  It's on my {channel.name}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="surface rounded-lg p-panel">
        <div className="flex items-baseline justify-between gap-part">
          <h3 className="heading-s">Profiles wired</h3>
          <p className="label-mono text-tertiary">
            {wiredCount} / {CHANNELS.length}
          </p>
        </div>
        <div className="mt-part">
          <Meter
            value={(wiredCount / CHANNELS.length) * 100}
            label="Profiles wired"
          />
        </div>
        <ul className="mt-part divide-y divide-outline-variant">
          {CHANNELS.map((c) => {
            const state = ledger[c.id]
            const Icon = c.icon
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => {
                    setChannel(c)
                    ticketRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    })
                  }}
                  className="group flex w-full items-center gap-part py-2.5 text-left"
                >
                  <Icon className="size-4 shrink-0 text-on-surface-variant group-hover:text-on-surface" />
                  <span className="body-small-bold flex-1">{c.name}</span>
                  <span
                    className={`label-mono ${
                      state?.wiredAt
                        ? "text-tertiary"
                        : "text-on-surface-variant/70"
                    }`}
                  >
                    {state?.wiredAt
                      ? `Wired ${ago(state.wiredAt)}`
                      : state
                        ? `Copied ${ago(state.copiedAt)}`
                        : "Not yet"}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

/* A numbered step label: the mono face, the number in amber. */
function Step({
  n,
  label,
  flush = false,
}: {
  n: number
  label: string
  flush?: boolean
}) {
  return (
    <p
      className={`label-mono mb-part flex items-center gap-cluster text-on-surface-variant ${
        flush ? "" : "mt-panel"
      }`}
    >
      <span className="text-tertiary">0{n}</span>
      {label}
    </p>
  )
}

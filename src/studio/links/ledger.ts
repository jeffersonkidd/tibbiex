import { useCallback, useState } from "react"

/* Which profiles have their link, kept in this browser. The studio has no
   backend yet, so the ledger is a convenience, not a record: a cleared
   browser forgets the ticks, never the links themselves, which are rebuilt
   from content on every visit.

     copied  the link left the clipboard at least once
     wired   the owner said it is pasted in */
export type Entry = { url: string; copiedAt: number; wiredAt?: number }
export type Ledger = Record<string, Entry>

const KEY = "tibbiex:studio:links"

function read(): Ledger {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Ledger
  } catch {
    return {}
  }
}

function write(ledger: Ledger) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ledger))
  } catch {
    /* Private window or full storage: the ticks just do not stick. */
  }
}

export function useLedger() {
  const [ledger, setLedger] = useState<Ledger>(read)

  const update = useCallback((fn: (prev: Ledger) => Ledger) => {
    setLedger((prev) => {
      const next = fn(prev)
      write(next)
      return next
    })
  }, [])

  /* A new copy of a different link un-wires the profile: whatever is pasted
     there now is the old link until the owner says otherwise. */
  const markCopied = useCallback(
    (id: string, url: string) =>
      update((prev) => {
        const same = prev[id]?.url === url
        return {
          ...prev,
          [id]: {
            url,
            copiedAt: Date.now(),
            wiredAt: same ? prev[id]?.wiredAt : undefined,
          },
        }
      }),
    [update],
  )

  const setWired = useCallback(
    (id: string, wired: boolean) =>
      update((prev) =>
        prev[id]
          ? {
              ...prev,
              [id]: { ...prev[id], wiredAt: wired ? Date.now() : undefined },
            }
          : prev,
      ),
    [update],
  )

  return { ledger, markCopied, setWired }
}

/* "just now", "5 min ago", "3 days ago" -- coarse on purpose. */
export function ago(at: number) {
  const minutes = Math.round((Date.now() - at) / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hr ago`
  const days = Math.round(hours / 24)
  return `${days} day${days === 1 ? "" : "s"} ago`
}

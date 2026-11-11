import { useCallback, useRef, useState } from "react"

/* The studio passcode, shared by every module that writes to the live site.
   Each endpoint checks it against DASHBOARD_PASSWORD; the browser remembers it
   once it has worked, and forgets it the moment an endpoint refuses it, so
   it is asked for once per device and again only when it is wrong. */

const PASSCODE_KEY = "tibbiex:studio:passcode"

export function savedPasscode() {
  try {
    return localStorage.getItem(PASSCODE_KEY) ?? ""
  } catch {
    return ""
  }
}

export function savePasscode(passcode: string | null) {
  try {
    if (passcode) localStorage.setItem(PASSCODE_KEY, passcode)
    else localStorage.removeItem(PASSCODE_KEY)
  } catch {
    /* Private window: it just asks again next time. */
  }
}

/* What a connection hears once it has made 30 passcode checks in ten
   minutes: the Vercel Firewall rule "Studio passcode guesses" answers 429 for
   /api/login, every request to /api/products (its read checks the passcode
   too) and every write to /api/avatar, so guessing
   can't simply move from the door to an endpoint. Set in the Vercel
   dashboard, not in this repo; change the wording if the window changes. */
export const TOO_MANY_TRIES =
  "Too many tries from this connection. Wait ten minutes, then try again."

/* Ask the door (api/login.ts) whether a passcode opens the studio. Nothing
   is saved here; the login screen saves it once the answer is yes.

     ok          it does
     refused     it doesn't
     unset       DASHBOARD_PASSWORD isn't configured on the server
     busy        the firewall's rate limit stopped it (TOO_MANY_TRIES)
     unreachable no answer: offline, or `pnpm dev`, which runs no API */
export type DoorAnswer = "ok" | "refused" | "unset" | "busy" | "unreachable"

export async function checkPasscode(passcode: string): Promise<DoorAnswer> {
  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "x-studio-passcode": passcode },
    })
    if (response.status === 204) return "ok"
    if (response.status === 401) return "refused"
    if (response.status === 503) return "unset"
    if (response.status === 429) return "busy"
    return "unreachable"
  } catch {
    return "unreachable"
  }
}

/* What a failed write says, and whether the passcode was the reason. */
export class StudioError extends Error {
  constructor(
    message: string,
    readonly badPasscode = false,
  ) {
    super(message)
  }
}

/* For a module with several writes: run one with the saved passcode, or hold
   it and ask for the passcode first, then run it on `unlock`. A refused
   passcode is forgotten and asked for again, and the write that was refused
   is the one that runs once it is right. Any other failure is thrown to the
   caller, which knows what the write was for. */
export type Write = (passcode: string) => Promise<void>

export function usePasscode() {
  const [passcode, setPasscode] = useState(savedPasscode)
  const [asking, setAsking] = useState(false)
  const [error, setError] = useState("")
  const pending = useRef<Write | null>(null)

  const attempt = useCallback(async (write: Write, code: string) => {
    try {
      await write(code)
      setAsking(false)
      setError("")
    } catch (failure) {
      if (failure instanceof StudioError && failure.badPasscode) {
        pending.current = write
        setPasscode("")
        setError(failure.message)
        setAsking(true)
        return
      }
      throw failure
    }
  }, [])

  const run = useCallback(
    async (write: Write) => {
      const code = savedPasscode() || passcode
      if (!code) {
        pending.current = write
        setAsking(true)
        return
      }
      await attempt(write, code)
    },
    [attempt, passcode],
  )

  const unlock = useCallback(async () => {
    const write = pending.current
    if (!passcode.trim()) {
      setError("Type the passcode first.")
      return
    }
    pending.current = null
    if (write) await attempt(write, passcode.trim())
    else setAsking(false)
  }, [attempt, passcode])

  const cancel = useCallback(() => {
    pending.current = null
    setAsking(false)
    setError("")
  }, [])

  return { passcode, setPasscode, asking, error, run, unlock, cancel }
}

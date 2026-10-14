import { useCallback, useRef, useState } from "react"

/* The studio passcode, shared by every module that writes to the live site.
   Each endpoint checks it against STUDIO_PASSCODE; the browser remembers it
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

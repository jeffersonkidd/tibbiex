import { useEffect, useRef } from "react"

import { advanceMagic, MOTES, setWake } from "../lib/magic-dust"

/* The one canvas the whole app draws its magic on. The loop only runs while
   there is something to draw: the last frame with an empty array clears the
   canvas and drops the rAF, and castMagic starts it again (through setWake). */
export default function MagicDust() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    let frame = 0
    let last = 0

    function resize() {
      if (!canvas || !ctx) return
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(window.innerWidth * ratio)
      canvas.height = Math.floor(window.innerHeight * ratio)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    function step(now: number) {
      if (!canvas || !ctx) return
      /* Clamp the step so a backgrounded tab does not resume with one enormous
         frame that teleports every spark off screen. */
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      advanceMagic(ctx, dt, window.innerWidth, window.innerHeight)

      if (MOTES.length === 0) {
        frame = 0
        return
      }
      frame = requestAnimationFrame(step)
    }

    resize()
    window.addEventListener("resize", resize)
    setWake(() => {
      if (frame) return
      last = performance.now()
      frame = requestAnimationFrame(step)
    })

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("resize", resize)
      setWake(null)
      MOTES.length = 0
    }
  }, [])

  return <canvas ref={ref} className="magic-canvas" aria-hidden="true" />
}
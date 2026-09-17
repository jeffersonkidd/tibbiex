/* ---------------------------------------------------------------------------
   The magic — a canvas of sparks that dances across the screen when a link is
   clicked. It sits above everything (including the overlays) and never takes a
   pointer event, so it is decoration only: nothing here can swallow a tap.

   The particles live in a module-level array rather than React state. They are
   updated sixty times a second and never read during render, so putting them
   in state would only buy re-renders nobody wants. `castMagic` pushes into
   that array from anywhere; the mounted <MagicDust /> (which registers itself
   through `setWake`) is what draws it.
--------------------------------------------------------------------------- */
import type { MouseEvent } from "react"

type Mote = {
  kind: "spark" | "comet" | "ring"
  x: number
  y: number
  vx: number
  vy: number
  age: number
  span: number
  size: number
  color: string
  spin: number
  wobble: number
}

export const MOTES: Mote[] = []

/* Set by <MagicDust /> while it is mounted (via setWake). castMagic calls it to
   restart the animation loop, which parks itself whenever the array empties. */
let wakeMagic: (() => void) | null = null

export function setWake(fn: (() => void) | null) {
  wakeMagic = fn
}

/* Ceiling on how much is in the air at once. One burst peaks around 240, so
   this only bites when somebody mashes the link -- and it trims from the front
   of the array, dropping the oldest sparks, which are the ones already nearly
   burned out. Without it, ten fast clicks stack past two thousand sparkles and
   an older phone starts dropping frames. */
const MAX_MOTES = 700

/* Amber and off-white carry the magic; the brand red is a rare ember so the
   burst still ties back to the CTAs without turning into a colour wheel. */
const MAGIC_INK = ["#FFD84D", "#FFD84D", "#FFE9A3", "#FFFDF7", "#FF5433"]

function prefersStillness() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
}

function pickInk() {
  return MAGIC_INK[Math.floor(Math.random() * MAGIC_INK.length)]
}

/* One burst: an expanding ring at the point of contact, a shower of sparks
   around it, and a handful of comets that streak off across the viewport
   shedding a trail as they go. */
function castMagic(x: number, y: number) {
  if (prefersStillness()) return

  MOTES.push({
    kind: "ring",
    x,
    y,
    vx: 0,
    vy: 0,
    age: 0,
    span: 620,
    size: 150,
    color: "#FFD84D",
    spin: 0,
    wobble: 0,
  })

  for (let i = 0; i < 44; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 70 + Math.random() * 320
    MOTES.push({
      kind: "spark",
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 60,
      age: 0,
      span: 620 + Math.random() * 900,
      size: 3 + Math.random() * 8,
      color: pickInk(),
      spin: Math.random() * Math.PI,
      wobble: Math.random() * Math.PI * 2,
    })
  }

  for (let i = 0; i < 6; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 620 + Math.random() * 620
    MOTES.push({
      kind: "comet",
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed * 0.7,
      age: 0,
      span: 900 + Math.random() * 500,
      size: 4 + Math.random() * 4,
      color: pickInk(),
      spin: Math.random() * Math.PI,
      wobble: Math.random() * Math.PI * 2,
    })
  }

  if (MOTES.length > MAX_MOTES) MOTES.splice(0, MOTES.length - MAX_MOTES)
  wakeMagic?.()
}

/* Bursts from where the pointer actually was. Keyboard activation reports
   0,0 for the click coordinates, so fall back to the middle of the element --
   otherwise every Enter press throws sparks from the top-left corner. */
export function castMagicFrom(e: MouseEvent<HTMLElement>) {
  if (e.clientX !== 0 || e.clientY !== 0) {
    castMagic(e.clientX, e.clientY)
    return
  }
  const box = e.currentTarget.getBoundingClientRect()
  castMagic(box.left + box.width / 2, box.top + box.height / 2)
}

/* A four-pointed sparkle: four spikes pulled in tight at the waist. Cheaper
   than an image and it scales to any size without going soft. */
function sparkle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  rot: number,
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rot)
  ctx.beginPath()
  ctx.moveTo(0, -r)
  ctx.quadraticCurveTo(r * 0.16, -r * 0.16, r, 0)
  ctx.quadraticCurveTo(r * 0.16, r * 0.16, 0, r)
  ctx.quadraticCurveTo(-r * 0.16, r * 0.16, -r, 0)
  ctx.quadraticCurveTo(-r * 0.16, -r * 0.16, 0, -r)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

/* One frame of the whole burst: age everything, drop what has burned out, move
   what has not, and draw it. Module-level rather than buried in the component
   so the physics is reachable on its own -- it takes a context and a timestep
   and touches nothing else.

   Composite mode is "lighter" throughout, so overlapping sparks add up into a
   glow instead of painting over each other. */
export function advanceMagic(
  ctx: CanvasRenderingContext2D,
  dt: number,
  width: number,
  height: number,
) {
  ctx.clearRect(0, 0, width, height)
  ctx.globalCompositeOperation = "lighter"

  for (let i = MOTES.length - 1; i >= 0; i--) {
    const m = MOTES[i]
    m.age += dt * 1000
    const life = m.age / m.span
    if (life >= 1) {
      MOTES.splice(i, 1)
      continue
    }

    if (m.kind === "ring") {
      const eased = 1 - Math.pow(1 - life, 3)
      ctx.globalAlpha = (1 - life) * 0.5
      ctx.strokeStyle = m.color
      ctx.lineWidth = 2.5 * (1 - life)
      ctx.beginPath()
      ctx.arc(m.x, m.y, eased * m.size, 0, Math.PI * 2)
      ctx.stroke()
      continue
    }

    m.wobble += dt * 6
    if (m.kind === "spark") {
      /* Drag plus a gentle lift: sparks slow down and drift upward like ash
         off a fire rather than falling like confetti. */
      m.vx *= 1 - 2.1 * dt
      m.vy = m.vy * (1 - 2.1 * dt) - 26 * dt
      m.x += m.vx * dt + Math.sin(m.wobble) * 14 * dt
      m.y += m.vy * dt
    } else {
      m.vx *= 1 - 0.9 * dt
      m.vy = m.vy * (1 - 0.9 * dt) + Math.sin(m.wobble * 0.8) * 260 * dt
      m.x += m.vx * dt
      m.y += m.vy * dt

      /* The trail: one short-lived spark dropped at the comet's heel every
         frame, which is what makes it read as a streak rather than a dot.
         Appended past `i`, so it is not also stepped this frame. */
      if (MOTES.length < MAX_MOTES) {
        MOTES.push({
          kind: "spark",
          x: m.x,
          y: m.y,
          vx: (Math.random() - 0.5) * 40,
          vy: (Math.random() - 0.5) * 40,
          age: 0,
          span: 320 + Math.random() * 380,
          size: 2 + Math.random() * 4,
          color: m.color,
          spin: Math.random() * Math.PI,
          wobble: Math.random() * Math.PI * 2,
        })
      }
    }

    /* Twinkle: alpha beats faster than the fade, so each spark blinks on its
       way out instead of dimming evenly. */
    const twinkle = 0.55 + 0.45 * Math.sin(m.wobble * 2.2)
    ctx.globalAlpha = Math.max(0, (1 - life) * twinkle)
    ctx.fillStyle = m.color
    sparkle(ctx, m.x, m.y, m.size * (1 - life * 0.55), m.spin + m.wobble * 0.4)
  }

  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = "source-over"
}

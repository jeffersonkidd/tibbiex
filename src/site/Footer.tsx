/* The one place the studio is named as the business rather than the person --
   the profile card stays "Tibbie X", because the performer is who the page is
   about. Both are asserted in the JSON-LD graph in index.html (Organization
   #studio, Person #tibbie-x), and Google wants structured data backed by text a
   visitor can actually see. */
export default function Footer() {
  return (
    <footer className="text-center">
      <p className="mono-label text-foreground/80">Tibbie X Studio</p>
      <p className="mono-label mt-1 text-muted-foreground">
        © 2026 Tibbie X · Built in the squat
      </p>
    </footer>
  )
}

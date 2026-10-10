// The design-sync buildCmd: packages src/ui/ as a library the converter can
// read, in .ds-sync/pkg/ (gitignored, regenerated every run).
//   index.ts       re-exports .design-sync/entry.ts (bundled by the converter)
//   types/         tsc declarations for that entry and everything it reaches
//   ds.css         .design-sync/ds.css compiled by the site's own Vite +
//                  Tailwind, images inlined, the Google Fonts import on top
// Run from the repo root: node .design-sync/build.mjs
import { execFileSync } from "node:child_process"
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { build } from "vite"
import tailwindcss from "@tailwindcss/vite"

const PKG = ".ds-sync/pkg"
rmSync(PKG, { recursive: true, force: true })
mkdirSync(PKG, { recursive: true })

execFileSync("node_modules/.bin/tsc", ["-p", ".design-sync/tsconfig.dts.json"], { stdio: "inherit" })

await build({
  configFile: false,
  logLevel: "warn",
  publicDir: false,
  plugins: [tailwindcss()],
  build: {
    outDir: `${PKG}/css`,
    emptyOutDir: true,
    assetsInlineLimit: () => true,
    rollupOptions: {
      input: ".design-sync/ds.css",
      output: { assetFileNames: "[name][extname]" },
    },
  },
})

// The same faces index.html <link>s; a design has no index.html of its own.
const fonts = readFileSync("index.html", "utf8")
  .match(/href="(https:\/\/fonts\.googleapis\.com\/css2[^"]+)"/)[1]
  .replaceAll("&amp;", "&")
const css = readFileSync(`${PKG}/css/ds.css`, "utf8")
writeFileSync(`${PKG}/ds.css`, `@import url("${fonts}");\n${css}`)

writeFileSync(`${PKG}/index.ts`, 'export * from "../../.design-sync/entry"\n')
writeFileSync(
  `${PKG}/package.json`,
  JSON.stringify(
    { name: "tibbiex-ui", version: JSON.parse(readFileSync("package.json", "utf8")).version, module: "index.ts", types: "types/.design-sync/entry.d.ts" },
    null,
    2,
  ) + "\n",
)
console.log(`built ${PKG}`)

// Per-component docs from the source's own comments. The repo writes the note
// above each component as a /* */ block, which the converter's JSDoc reader
// (/** only) skips; lifting it here keeps the source the one place it is
// written. Frontmatter `category` is the src/ui folder, or "brand" for the
// glyphs and marks in src/assets.
mkdirSync(`${PKG}/docs`, { recursive: true })
const entry = readFileSync(".design-sync/entry.ts", "utf8")
for (const [, name, from] of entry.matchAll(/export \{ default as (\w+) \} from "\.\.\/(.+)"/g)) {
  const src = readFileSync(`${from}.tsx`, "utf8")
  const at = src.indexOf(`export default function ${name}`)
  const m = /\/\*([\s\S]*?)\*\/\s*$/.exec(src.slice(0, at))
  const note = (m ? m[1] : "")
    .split("\n")
    .map((l) => l.replace(/^\s*\*?\s?/, ""))
    .join("\n")
    .trim()
  const category = from.startsWith("src/ui/") ? from.split("/")[2] : "brand"
  writeFileSync(`${PKG}/docs/${name}.md`, `---\ncategory: ${category}\n---\n\n# ${name}\n\n${note}\n`)
}

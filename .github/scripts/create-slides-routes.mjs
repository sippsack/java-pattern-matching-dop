import { copyFile, mkdir } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

// Resolve the parser from the deck being built, including for historical tags.
const require = createRequire(resolve('package.json'))
const { load } = await import(pathToFileURL(require.resolve('@slidev/parser/fs')).href)
const { slides } = await load(
  { roots: [process.cwd()], userRoot: process.cwd() },
  resolve('slides.md'),
)
const output = process.argv[2]
if (!output)
  throw new Error('Provide the Slidev output directory')

// Pages only uses the repository-root 404.html, not the one inside each version.
const routes = ['entry', 'overview', 'notes', 'notes-edit', 'presenter', 'print', 'presenter/print', 'export']
for (let slide = 1; slide <= slides.length; slide++)
  routes.push(`${slide}`, `presenter/${slide}`, `export/${slide}`)

for (const route of routes) {
  const directory = resolve(output, route)
  await mkdir(directory, { recursive: true })
  await copyFile(resolve(output, 'index.html'), resolve(directory, 'index.html'))
}

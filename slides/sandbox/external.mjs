import { runDevJava } from './devjava.mjs'
import { readFile } from 'node:fs/promises'

export const devJavaUrl = 'https://dev.java/playground/'
export const almanacUrl = 'https://javaalmanac.io/jdk/28/'

export function validateExternal(input) {
  const provider = input.provider ?? devJavaUrl
  if (![devJavaUrl, almanacUrl].includes(provider)) throw new Error('Unbekannter externer Anbieter.')
  if (input.preview !== undefined && typeof input.preview !== 'boolean') throw new Error('preview muss ein Boolean sein.')
  if (provider === devJavaUrl && input.preview === false) {
    throw new Error('dev.java aktiviert Preview fest; zum Abschalten ein lokales JDK oder Java Almanac wählen.')
  }
  return provider
}

export async function runExternal(code, { provider = devJavaUrl, preview = true, setup = '' } = {}, fetcher = fetch) {
  validateExternal({ provider, preview })
  if (provider === devJavaUrl) return runDevJava(code, fetcher, setup)
  // Use the same JShell semantics, including sealed forward references, at both targets.
  const runner = await readFile(new URL('./SnippetRunner.java', import.meta.url), 'utf8')
  const encoded = Buffer.from(code, 'utf8').toString('base64')
  const encodedSetup = Buffer.from(setup, 'utf8').toString('base64')
  const source = `class Sandbox {
    public static void main(String[] args) throws Exception {
      SnippetRunner.main(new String[] { "${preview}", "${encoded}", "${encodedSetup}" });
    }
  }`
  const response = await fetcher('https://sandbox.javaalmanac.io/jdk/28/runfromsource', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mainclass: 'Sandbox.java', preview,
      sourcefiles: [
        { name: 'Sandbox.java', content: source },
        { name: 'SnippetRunner.java', content: runner },
      ],
    }),
    signal: AbortSignal.timeout(20_000),
  })
  if (!response.ok) throw new Error(`Java Almanac antwortet mit HTTP ${response.status}.`)
  const result = await response.json()
  if (typeof result?.output !== 'string' || typeof result.compilesuccess !== 'boolean'
      || (result.compilesuccess && typeof result.runstatus !== 'number')) {
    throw new Error('Unerwartetes Antwortformat von Java Almanac.')
  }
  if (!result.compilesuccess || result.runstatus !== 0) {
    return { ok: false, runtime: 'Java Almanac · JDK 28', output: result.output }
  }
  let evaluation
  const lines = result.output.trimEnd().split('\n')
  // Almanac includes javac preview warnings before the runner's final JSON line.
  try { evaluation = JSON.parse(lines.pop()) }
  catch { throw new Error(`Keine gültige JShell-Antwort von Java Almanac: ${result.output}`) }
  if (typeof evaluation?.ok !== 'boolean' || typeof evaluation.output !== 'string'
      || typeof evaluation.runtime !== 'string') {
    throw new Error('Unerwartetes JShell-Antwortformat von Java Almanac.')
  }
  return {
    ...evaluation,
    output: [...lines, evaluation.output].join('\n'),
    runtime: `Java Almanac · ${evaluation.runtime}`,
  }
}

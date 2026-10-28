import assert from 'node:assert/strict'
import { once } from 'node:events'
import { readFile } from 'node:fs/promises'
import { createServer, request as httpRequest } from 'node:http'
import { test } from 'node:test'
import { resolveDemo } from './demos.mjs'
import { discoverJdks } from './jdks.mjs'
import { javaSandbox, runJava } from './server.mjs'

test('the model runs with sealed forward references and creates usable objects', async () => {
  const source = await readFile(new URL('../demos/01-Medikationsplan-01-Datenmodell.java', import.meta.url), 'utf8')
  const demo = resolveDemo('01-Medikationsplan', { '../demos/01-Medikationsplan-01-Datenmodell.java': source })
  assert.deepEqual(demo.checkpoints, [])
  const result = await runJava(`${demo.code}
    new MedicationPlan("Demo", List.of(new Medication(Drug.IBUPROFEN, new Tablet(1, 0, 1))))
  `)
  assert.equal(result.ok, true, result.output)
  for (const name of ['Drug', 'Dosage', 'Tablet', 'Infusion', 'Medication', 'MedicationPlan'])
    assert.ok(result.output.includes(`=> ${name} deklariert`), name)
  assert.match(result.output, /patientName=Demo/)
  assert.match(result.output, /morning=1, midday=0, evening=1/)
  assert.doesNotMatch(result.output, /Fehler:/)
})

test('example data uses hidden model setup in a fresh JShell and hides setup output but not errors', async () => {
  const files = {}
  for (const name of ['01-Medikationsplan-01-Datenmodell.java', '01-Medikationsplan-02-Beispieldaten.java'])
    files[`../demos/${name}`] = await readFile(new URL(`../demos/${name}`, import.meta.url), 'utf8')
  const demo = resolveDemo('01-Medikationsplan', files)
  assert.equal(demo.checkpoints.length, 1)
  assert.doesNotMatch(demo.checkpoints[0], /record |sealed |@setup/)
  const result = await runJava(demo.checkpoints[0], undefined, false, demo.setups[1])
  assert.equal(result.ok, true, result.output)
  assert.match(result.output, /Medikationsplan für Erika Muster/)
  for (const drug of ['PARACETAMOL', 'IBUPROFEN', 'CAFFEINE'])
    assert.match(result.output, new RegExp(drug))
  assert.doesNotMatch(result.output, /deklariert/)
  const failure = await runJava('System.out.println("must not run");', undefined, false, 'record Broken(Unknown value) {}')
  assert.equal(failure.ok, false)
  assert.match(failure.output, /Nicht vollständig aufgelöst/)
  assert.doesNotMatch(failure.output, /must not run/)
})

test('errors and unresolved declarations are explicit and sessions are isolated', async () => {
  const first = await runJava('int answer = 42;\nanswer + 1')
  assert.equal(first.ok, true)
  assert.match(first.output, /=> 43/)
  const second = await runJava('System.out.println(answer);')
  assert.equal(second.ok, false)
  assert.match(second.output, /answer/)
  const unresolved = await runJava('class Missing { Unknown value; }')
  assert.equal(unresolved.ok, false)
  assert.match(unresolved.output, /Nicht vollständig aufgelöst/)
  const incomplete = await runJava('class Missing {')
  assert.equal(incomplete.ok, false)
  assert.match(incomplete.output, /Unvollständig/)
  const exception = await runJava('throw new IllegalStateException("demo");')
  assert.equal(exception.ok, false)
  assert.match(exception.output, /demo/)
})

test('feature slides 16 through 20 execute their file-backed code with hidden types and dialog-only calls', async () => {
  const { readdir } = await import('node:fs/promises')
  const files = {}
  for (const name of await readdir(new URL('../demos/', import.meta.url)))
    if (name.endsWith('.java'))
      files[`../demos/${name}`] = await readFile(new URL(`../demos/${name}`, import.meta.url), 'utf8')
  const slides = await readFile(new URL('../slides.md', import.meta.url), 'utf8')
  const expectations = [
    ['02-KlassischerSwitch', /"stimulant"/],
    ['03-SwitchExpressions', /"stimulant"/],
    ['04-Records', /Tablet\[morning=1, midday=1, evening=1\]/],
    ['05-Records', /Counts must not be negative/],
    ['06-Dosage', /morning=null, midday=null/],
  ]
  for (const [name, expected] of expectations) {
    const demo = resolveDemo(name, files)
    assert.ok('code' in demo, name)
    const frontmatter = slides.slice(slides.indexOf(`sandbox: ${name}\n`)).split('\n---')[0]
    const calls = frontmatter.match(/sandboxRun: \|\n((?:  .*(?:\n|$))*)/)?.[1] || ''
    const result = await runJava(`${demo.code}\n${calls}`, undefined, false, demo.setups?.[0])
    assert.equal(result.ok, name !== '05-Records', `${name}: ${result.output}`)
    assert.match(result.output, expected, name)
    if (name === '05-Records') assert.match(result.output, /=> \[\]/)
    assert.doesNotMatch(result.output, /Drug deklariert/, name)
  }
})

test('output escaping and the preview flag survive transport', async () => {
  const result = await runJava('System.err.println("Grüße");\nSystem.out.println("\\\"\\\\\\t");', undefined, false)
  assert.equal(result.ok, true)
  assert.match(result.output, /Grüße/)
  assert.match(result.output, /"\\\t/)
  const flags = 'System.out.println(java.lang.management.ManagementFactory.getRuntimeMXBean().getInputArguments());'
  assert.doesNotMatch((await runJava(flags, undefined, false)).output, /--enable-preview/)
  assert.match((await runJava(flags, undefined, true)).output, /--enable-preview/)
})

test('all remaining Java demos execute each tab with their slide calls and expected failures', async () => {
  const { readdir } = await import('node:fs/promises')
  const files = {}
  for (const name of await readdir(new URL('../demos/', import.meta.url)))
    if (name.endsWith('.java'))
      files[`../demos/${name}`] = await readFile(new URL(`../demos/${name}`, import.meta.url), 'utf8')
  const slides = await readFile(new URL('../slides.md', import.meta.url), 'utf8')
  const names = [...slides.matchAll(/^sandbox: ((?:0[7-9]|1\d|2[0-3])-[\w-]+)$/gm)].map(match => match[1])
  assert.equal(names.length, 17)
  let variants = 0
  for (const name of names) {
    const demo = resolveDemo(name, files)
    assert.ok('code' in demo, name)
    const frontmatter = slides.slice(slides.indexOf(`sandbox: ${name}\n`)).split('\n---')[0]
    const single = frontmatter.match(/sandboxRun: \|\n((?:  .*(?:\n|$))*)/)?.[1] || ''
    const extraSetup = frontmatter.match(/sandboxSetup: \|\n((?:  .*(?:\n|$))*)/)?.[1] || ''
    const multiple = frontmatter.match(/sandboxRuns:\n([\s\S]*?)(?=^\S|(?![\s\S]))/m)?.[1]
    const calls = multiple
      ? [...multiple.matchAll(/^  - (?:\|\n((?:      .*(?:\n|$))*)|"")/gm)].map(match => match[1] || '')
      : []
    for (const [index, code] of [demo.code, ...demo.checkpoints].entries()) {
      variants++
      const setup = [demo.setups?.[index], extraSetup].filter(Boolean).join('\n')
      const result = await runJava(`${code}\n${calls[index] ?? single}`, undefined, true, setup)
      const failure = /^(11-|18-|19-|21-|22-|23-)/.test(name) || (name.startsWith('13-') && index === 0)
      assert.equal(result.ok, !failure, `${name}/${index}: ${result.output}`)
      if (/^(18-|19-)/.test(name)) {
        assert.match(result.output, /Pump speed: 50/)
        assert.match(result.output, /Speed does not fit the pump/)
      }
      if (name.startsWith('08-')) assert.match(result.output, /=> 2\n=> 0/)
      if (name.startsWith('13-') && index === 1) assert.match(result.output, /no dosage/)
      if (name.startsWith('17-') && index === 1) assert.match(result.output, /"swallow"/)
    }
  }
  assert.equal(variants, 21)
})

test('timeouts and premature JVM exits do not produce success', async () => {
  await assert.rejects(runJava('while (true) {}'), /Zeitlimit/)
  await assert.rejects(runJava('System.exit(0);'), /Keine gültige Antwort/)
})

test('the local HTTP bridge validates requests and exposes only known JDKs', async () => {
  let handler
  const jdks = await discoverJdks()
  assert.ok(jdks.length, 'At least one local JDK with jdk.jshell is required')
  const externalRequests = []
  javaSandbox({ jdks, executeExternal: async (code, options) => {
    externalRequests.push({ code, ...options })
    return { ok: true, runtime: 'test provider', output: '42' }
  } }).configureServer({
    config: { server: {}, logger: { error() {} } },
    middlewares: { use(_path, middleware) { handler = middleware } },
  })
  const server = createServer(handler)
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const origin = `http://127.0.0.1:${server.address().port}`
  const headers = { Origin: origin, 'Content-Type': 'application/json', 'X-Java-Sandbox': '1' }
  const request = (body, extraHeaders = {}, path = '/run') => fetch(`${origin}${path}`, {
    method: 'POST', headers: { ...headers, ...extraHeaders }, body,
  })
  try {
    assert.equal((await request('{}', { Origin: 'https://foreign.example' })).status, 403)
    const foreignHostStatus = await new Promise((resolve, reject) => {
      const req = httpRequest(origin, {
        method: 'POST', headers: { ...headers, Host: 'foreign.example' },
      }, res => { res.resume(); resolve(res.statusCode) })
      req.on('error', reject)
      req.end('{}')
    })
    assert.equal(foreignHostStatus, 403)
    assert.equal((await request('{}', { 'X-Java-Sandbox': '' })).status, 403)
    assert.equal((await request('{}', { 'Content-Type': 'text/plain' })).status, 400)
    assert.equal((await request('{')).status, 400)
    assert.equal((await request('null')).status, 400)
    assert.equal((await request('{"code":"  "}')).status, 400)
    assert.equal((await request('{"code":"42","jdk":"/unknown"}')).status, 400)
    assert.equal((await request('{"code":"42","preview":"false"}')).status, 400)
    assert.equal((await request('{"code":"42","setup":42}')).status, 400)
    assert.equal((await request('x'.repeat(33 * 1024))).status, 413)
    assert.equal((await request('{}', {}, '/unknown')).status, 404)
    assert.equal((await request('{"code":"42","provider":"https://unknown.example"}', {}, '/external')).status, 400)
    assert.equal((await request('{"code":"42","provider":"https://dev.java/playground/","preview":false}', {}, '/external')).status, 400)
    assert.equal(externalRequests.length, 0)
    const external = await request('{"code":"42","provider":"https://javaalmanac.io/jdk/28/","preview":false}', {}, '/external')
    assert.equal(external.status, 200)
    assert.equal((await external.json()).output, '42')
    assert.deepEqual(externalRequests, [{ code: '42', provider: 'https://javaalmanac.io/jdk/28/', preview: false, setup: undefined }])
    const inventory = await request('{}', {}, '/jdks')
    assert.equal(inventory.status, 200)
    assert.deepEqual(await inventory.json(), { jdks, defaultHome: jdks[0].home || '' })
    const response = await request(JSON.stringify({ code: 'System.out.println(6 * 7);' }))
    assert.equal(response.status, 200)
    const result = await response.json()
    assert.equal(result.ok, true)
    assert.match(result.output, /42/)
    const withSetup = await request(JSON.stringify({
      code: 'new Item(42)', setup: 'record Item(int value) {}', preview: false,
    }))
    const setupResult = await withSetup.json()
    assert.equal(setupResult.ok, true)
    assert.match(setupResult.output, /Item\[value=42\]/)
    assert.doesNotMatch(setupResult.output, /deklariert/)
  }
  finally {
    server.closeAllConnections()
    await new Promise(resolve => server.close(resolve))
  }
})

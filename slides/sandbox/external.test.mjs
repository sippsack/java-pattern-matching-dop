import assert from 'node:assert/strict'
import { test } from 'node:test'
import { almanacUrl, runExternal, validateExternal } from './external.mjs'
import { runDevJava } from './devjava.mjs'

test('unknown destinations and unsupported preview settings are rejected', () => {
  assert.throws(() => validateExternal({ provider: 'https://evil.example' }), /Unbekannt/)
  assert.throws(() => validateExternal({ preview: false }), /Preview fest/)
  assert.throws(() => validateExternal({ preview: 'true' }), /Boolean/)
})

test('Almanac executes snippets through JShell and forwards preview selection', async () => {
  const result = await runExternal('import java.util.List;\nSystem.out.println(List.of(42));', {
    provider: almanacUrl, preview: false, setup: 'record Item(int value) {}',
  }, async (url, options) => {
    assert.equal(url, 'https://sandbox.javaalmanac.io/jdk/28/runfromsource')
    const body = JSON.parse(options.body)
    assert.equal(body.preview, false)
    assert.equal(body.mainclass, 'Sandbox.java')
    assert.match(body.sourcefiles[0].content, /public static void main/)
    assert.ok(body.sourcefiles[0].content.includes(Buffer.from('import java.util.List;\nSystem.out.println(List.of(42));').toString('base64')))
    assert.match(body.sourcefiles[1].content, /import jdk.jshell.JShell;/)
    assert.match(body.sourcefiles[0].content, /"false"/)
    assert.ok(body.sourcefiles[0].content.includes(Buffer.from('record Item(int value) {}').toString('base64')))
    return Response.json({
      compilesuccess: true, runstatus: 0,
      output: 'Note: uses preview features.\n'
        + JSON.stringify({ ok: true, runtime: '28-ea', output: '[42]\n' }) + '\n',
    })

  })
  assert.equal(result.ok, true)
  assert.equal(result.output, 'Note: uses preview features.\n[42]\n')
})

test('dev.java prepends setup but hides its successful rows and retains its errors', async () => {
  const setup = 'record Item(int value) {}'
  const result = await runDevJava('new Item(42)', async (_url, options) => {
    assert.equal(Buffer.from(JSON.parse(options.body).snippet, 'base64').toString(), `${setup}\nnew Item(42)`)
    return Response.json({ body: [
      { out: '', val: 'Item deklariert', exc: false, status: 'VALID', lineStart: 1 },
      { out: '', val: 'Item[value=42]', exc: false, status: 'VALID', lineStart: 2 },
    ] })
  }, setup)
  assert.equal(result.ok, true)
  assert.equal(result.output, '=> Item[value=42]')
  const failure = await runDevJava('new Item(42)', async () => Response.json({ body: [
    { out: 'Unknown type', val: '', exc: false, status: 'REJECTED', lineStart: 1 },
  ] }), setup)
  assert.equal(failure.ok, false)
  assert.match(failure.output, /Unknown type/)
})

test('Almanac compile and service failures are visible', async () => {
  const options = { provider: almanacUrl }
  const result = await runExternal('invalid', options, async () => Response.json({
    compilesuccess: false, output: 'Compiler error',
  }))
  assert.equal(result.ok, false)
  await assert.rejects(runExternal('x', options, async () => new Response('', { status: 500 })), /HTTP 500/)
  await assert.rejects(runExternal('x', options, async () => Response.json({})), /Antwortformat/)
  await assert.rejects(runExternal('x', options, async () => Response.json({
    compilesuccess: true, runstatus: 0, output: 'invalid',
  })), /Keine gültige JShell-Antwort/)
})

test('dev.java encodes snippets and returns output and diagnostics', async () => {
  const result = await runDevJava('System.out.println(42);', async (_url, options) => {
    const body = JSON.parse(options.body)
    assert.equal(Buffer.from(body.snippet, 'base64').toString(), 'System.out.println(42);')
    return Response.json({ body: [{ out: '42\n', val: '', exc: false, status: 'VALID' }] })
  })
  assert.equal(result.ok, true)
  assert.equal(result.output, '42')
  const rejected = await runDevJava('invalid', async () => Response.json({
    body: [{ out: 'Compiler error', val: '', exc: false, status: 'REJECTED' }],
  }))
  assert.equal(rejected.ok, false)
  assert.match(rejected.output, /Compiler error/)
  await assert.rejects(runDevJava('x', async () => new Response('', { status: 503 })), /HTTP 503/)
  await assert.rejects(runDevJava('x', async () => Response.json({ errorMessage: 'unavailable' })), /unavailable/)
  await assert.rejects(runDevJava('x', async () => Response.json({})), /Antwortformat/)
  await assert.rejects(runDevJava('x', async () => Response.json({ body: [
    { out: 'Error, unhandled state.', val: 'Unresolved dependencies: method helper()', exc: false, status: 'RECOVERABLE_DEFINED' },
  ] })), /Vorwärtsreferenz/)
})

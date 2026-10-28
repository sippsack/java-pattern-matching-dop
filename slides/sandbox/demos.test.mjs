import assert from 'node:assert/strict'
import { test } from 'node:test'
import { resolveDemo } from './demos.mjs'

test('loads a single Java snippet unchanged', () => {
  assert.deepEqual(resolveDemo('01-Helloworld', {
    '../demos/01-Helloworld.java': 'System.out.println("Hallo");\n',
  }), { code: 'System.out.println("Hallo");\n', checkpoints: [] })
})

test('orders numbered files numerically and excludes other demos', () => {
  assert.deepEqual(resolveDemo('01-Helloworld', {
    '../demos/01-Helloworld-10.java': 'ten',
    '../demos/01-Helloworld-02.java': 'two',
    '../demos/01-Helloworld-extra.java': 'ignore',
    '../demos/01-Helloworld-01.java': 'one',
    '../demos/02-Other-01.java': 'ignore',
  }), { code: 'one', checkpoints: ['two', 'ten'] })
})

test('reports missing, invalid and ambiguous demos instead of showing default code', () => {
  for (const name of [undefined, null, '', '../demo', 'demo.java', 1]) {
    assert.ok('error' in resolveDemo(name, {}))
  }
  assert.ok('error' in resolveDemo('missing', {}))
  assert.ok('error' in resolveDemo('demo', {
    '../demos/demo.java': 'single', '../demos/demo-01.java': 'step',
  }))
  assert.ok('error' in resolveDemo('demo', {
    '../demos/demo-1.java': 'one', '../demos/demo-01.java': 'also one',
  }))
})

test('orders descriptive steps by number rather than description', () => {
  assert.deepEqual(resolveDemo('02-ValueClasses', {
    '../demos/02-ValueClasses-03-HasIdentity.java': 'three',
    '../demos/02-ValueClasses-10-Ende.java': 'ten',
    '../demos/02-ValueClasses-01-Identitaetsvergleich.java': 'one',
    '../demos/02-ValueClasses-02-ValueRecord.java': 'two',
    '../demos/02-ValueClasses-04-.java': 'ignore',
  }), {
    code: 'one', checkpoints: ['two', 'three', 'ten'], setups: ['', '', '', ''],
    labels: ['Identitaetsvergleich', 'ValueRecord', 'HasIdentity', 'Ende'],
  })
})

test('rejects duplicate numbers even with different descriptions or legacy names', () => {
  assert.ok('error' in resolveDemo('demo', {
    '../demos/demo-01-Start.java': 'one',
    '../demos/demo-01-Other.java': 'also one',
  }))
  assert.ok('error' in resolveDemo('demo', {
    '../demos/demo-01-Start.java': 'one',
    '../demos/demo-1.java': 'also one',
  }))
})

test('resolves hidden setup and descriptive tabs without including directives in editor code', () => {
  const demo = resolveDemo('01-Model', {
    '../demos/01-Model-01-Typen.java': 'record Item(int value) {}',
    '../demos/01-Model-02-Daten.java': '// @setup 01-Model-01-Typen.java\nnew Item(42)',
  })
  assert.deepEqual(demo, {
    code: 'record Item(int value) {}', checkpoints: ['new Item(42)'],
    setups: ['', 'record Item(int value) {}'], labels: ['Typen', 'Daten'],
  })
  assert.ok('error' in resolveDemo('demo', {
    '../demos/demo-01.java': '// @setup missing.java\nnew Item(42)',
  }))
  assert.ok('error' in resolveDemo('demo', {
    '../demos/demo-01.java': '// @setup setup.java\nnew Item(42)',
    '../demos/setup.java': '// @setup nested.java\nrecord Item(int value) {}',
  }))
})

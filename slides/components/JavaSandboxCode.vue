<script setup lang="ts">
import { computed, nextTick, ref, toRefs, watch } from 'vue'
import { useNav, useSlideContext } from '@slidev/client'
import { useClipboard } from '@vueuse/core'
import JavaSandbox from './JavaSandbox.vue'
import { resolveDemo } from '../sandbox/demos.mjs'
import { sandboxState } from '../sandbox/sync'
import { highlightJava } from '../sandbox/highlight'

const props = withDefaults(defineProps<{ checkpoints?: string[] }>(), { checkpoints: () => [] })
const { $frontmatter, $page } = useSlideContext()
const { isPrintMode } = useNav()
const files = import.meta.glob<string>('../demos/*.java', {
  query: '?raw', import: 'default', eager: true,
})
const demo = computed(() => $frontmatter.sandbox === undefined
  ? undefined
  : resolveDemo($frontmatter.sandbox, files))
const demoCode = computed(() => demo.value && 'code' in demo.value ? demo.value.code : undefined)
const demoError = computed(() => demo.value && 'error' in demo.value ? demo.value.error : '')
const checkpoints = computed(() => demo.value && 'checkpoints' in demo.value
  ? demo.value.checkpoints : props.checkpoints)
const setups = computed(() => demo.value && 'setups' in demo.value ? demo.value.setups : [])
const labels = computed(() => demo.value && 'labels' in demo.value ? demo.value.labels : [])

const block = ref<HTMLElement>()
const trigger = ref<HTMLButtonElement>()
const panel = ref<HTMLElement>()
const shared = sandboxState(String($page.value), demoCode.value)
const { open } = toRefs(shared)
const code = ref('')
const error = ref('')
const highlighted = ref('')
const autoRun = ref(false)
const { copied, copy } = useClipboard({ legacy: true })

async function copyCode() {
  const source = demoCode.value ?? block.value?.querySelector('pre code')?.textContent
  if (source === undefined) {
    error.value = 'Kein Code zum Kopieren gefunden.'
    return
  }
  try {
    await copy(source)
  }
  catch (cause) {
    error.value = `Kopieren fehlgeschlagen: ${cause instanceof Error ? cause.message : String(cause)}`
  }
}

watch(demoCode, async (source, _, onCleanup) => {
  let stale = false
  onCleanup(() => { stale = true })
  highlighted.value = ''
  if (source === undefined) return
  try {
    const html = await highlightJava(source)
    if (!stale) highlighted.value = html
  }
  catch (cause) {
    if (!stale) error.value = `Syntax-Highlighting fehlgeschlagen: ${cause instanceof Error ? cause.message : String(cause)}`
  }
}, { immediate: true })

async function show() {
  const source = block.value?.querySelector('pre code')
  if (!source) {
    error.value = 'Kein Codeblock gefunden. Einen Java-Codeblock in JavaSandboxCode einfügen.'
    return
  }
  code.value = demoCode.value ?? (source.textContent?.replace(/\n$/, '') || '')
  shared.code = code.value
  shared.checkpoint = 0
  shared.output = 'Bereit. Lokale JShell wird vorbereitet.'
  shared.runtime = ''
  shared.failed = false
  autoRun.value = true
  open.value = true
  await nextTick()
  panel.value?.querySelector<HTMLButtonElement>('button')?.focus()
}

watch(open, (visible) => {
  if (visible) code.value = demoCode.value ?? shared.code
  else autoRun.value = false
})

async function close() {
  open.value = false
  await nextTick()
  trigger.value?.focus()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
  }
  if (event.key !== 'Tab') return
  const controls = panel.value?.querySelectorAll<HTMLElement>(
    'button:not(:disabled), select:not(:disabled), input:not(:disabled), textarea:not(:disabled), a[href]',
  )
  if (!controls?.length) return
  const first = controls[0]
  const last = controls[controls.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  }
  else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}
</script>

<template>
  <div class="sandbox-code-example">
    <div ref="block" class="sandbox-code-block" :inert="open || undefined">
      <p v-if="demoError" role="alert">{{ demoError }}</p>
      <div v-else-if="highlighted" class="sandbox-highlighted" v-html="highlighted" />
      <pre v-else-if="demoCode !== undefined"><code class="language-java">{{ demoCode }}</code></pre>
      <slot v-else />
      <button
        v-if="!demoError && !isPrintMode"
        class="sandbox-code-copy"
        :aria-label="copied ? 'Code kopiert' : 'Code kopieren'"
        :title="copied ? 'Kopiert' : 'Code kopieren'"
        @click.stop="copyCode"
        @keydown.enter.stop
        @keydown.space.stop
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <path v-if="copied" d="m5 12 4 4L19 6" />
          <template v-else>
            <rect x="8" y="8" width="12" height="13" rx="2" />
            <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3" />
          </template>
        </svg>
      </button>
      <button
        v-if="!demoError && !isPrintMode"
        ref="trigger"
        class="sandbox-code-play"
        aria-label="Code in JShell ausprobieren"
        title="Code in JShell ausprobieren"
        @click.stop="show"
        @keydown.enter.stop
        @keydown.space.stop
        @keydown.left="trigger?.blur()"
        @keydown.right="trigger?.blur()"
      >▶</button>
      <p v-if="error" role="alert">{{ error }}</p>
    </div>
    <div
      v-if="open && !isPrintMode"
      class="sandbox-overlay"
      @click.self.stop="close"
    >
      <div
        ref="panel"
        class="sandbox-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="JShell für den Codeblock"
        @keydown.capture="onKeydown"
        @keydown.stop
        @keyup.stop
        @click.stop
      >
        <JavaSandbox :initial-code="code" :checkpoints="checkpoints" :setups="setups" :labels="labels" :auto-run="autoRun" fill>
          <template #toolbar>
            <button aria-label="Sandbox schließen" title="Schließen (Esc)" @click="close">✕</button>
          </template>
        </JavaSandbox>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sandbox-code-block { position: relative; }
.sandbox-code-block :deep(pre) {
  margin: 6px 0 12px; padding: 10px 82px 10px 16px;
  border-left: 5px solid var(--yellow); border-radius: 6px;
  font-family: var(--slidev-code-font-family); font-size: 15px; line-height: 1.45;
  overflow-x: auto;
}
.sandbox-code-block :deep(code) { font: inherit; }
:global(.dark .sandbox-highlighted .shiki),
:global(.dark .sandbox-highlighted .shiki span) {
  color: var(--shiki-dark) !important;
  background-color: var(--shiki-dark-bg) !important;
}
.sandbox-code-play, .sandbox-code-copy {
  position: absolute; top: 8px; right: 8px;
  width: 28px; height: 28px; border: 1px solid #999; border-radius: 4px;
  background: white; color: #18212b; font-size: 15px; line-height: 1;
}
.sandbox-code-copy { right: 42px; padding: 4px; }
.sandbox-code-copy svg { width: 100%; height: 100%; }
.sandbox-code-play:focus-visible, .sandbox-code-copy:focus-visible { outline: 2px solid var(--red); outline-offset: 2px; }
.sandbox-overlay {
  position: absolute; inset: 0; z-index: 100;
  display: flex; align-items: center; justify-content: center;
  background: rgb(24 33 43 / 42%);
}
.sandbox-dialog {
  box-sizing: border-box; width: 90%; height: 82%; padding: 14px;
  border: 1px solid #bbb; border-radius: 10px; background: white;
  box-shadow: 0 12px 40px rgb(0 0 0 / 35%);
}
@media print {
  .sandbox-code-play, .sandbox-code-copy, .sandbox-overlay { display: none; }
}
</style>

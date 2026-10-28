<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, toRefs, watch } from 'vue'
import { useSlideContext } from '@slidev/client'
import { sandboxState } from '../sandbox/sync'

const props = withDefaults(defineProps<{ initialCode: string; checkpoints?: string[]; setups?: string[]; labels?: string[]; notice?: string; fill?: boolean; autoRun?: boolean }>(), {
  checkpoints: () => [],
  setups: () => [],
  labels: () => [],
})
const { $page } = useSlideContext()
const { code, checkpoint, output, runtime, running, failed, preview } =
  toRefs(sandboxState(String($page.value), props.initialCode))
const loading = ref(import.meta.env.DEV)
const local = import.meta.env.DEV
const jdks = ref<{ home: string; version: string }[]>([])
const providers = [
  { label: 'dev.java', url: 'https://dev.java/playground/' },
  { label: 'Java Almanac · JDK 28', url: 'https://javaalmanac.io/jdk/28/' },
]
const target = ref('')
const provider = computed(() => providers.find(entry => entry.url === target.value))
const fixedPreview = computed(() => provider.value?.url === 'https://dev.java/playground/')
const canRun = computed(() => import.meta.env.DEV && !loading.value && !running.value && Boolean(target.value))
const localHeaders = { 'Content-Type': 'application/json', 'X-Java-Sandbox': '1' }
let mounted = true
onUnmounted(() => { mounted = false })

watch(target, () => {
  runtime.value = ''
  if (fixedPreview.value) preview.value = true
  if (provider.value) {
    output.value = `Run sendet den Editorinhalt an ${provider.value.label}. Nur öffentlichen, nicht vertraulichen Code ausführen.`
    failed.value = false
  }
})

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && (event.metaKey || event.ctrlKey) && !event.isComposing) {
    event.preventDefault()
    event.stopPropagation()
    run()
  }
}

function checkout(index: number) {
  if (loading.value || running.value) return
  checkpoint.value = index
  code.value = index === 0 ? props.initialCode : props.checkpoints[index - 1]
  if (props.notice) {
    output.value = props.notice
    failed.value = false
    runtime.value = ''
  }
  else run()
}

onMounted(async () => {
  if (!import.meta.env.DEV) {
    output.value = 'JShell ist nur in der lokalen Vorschau verfügbar. Im Repository unter slides/ npm ci und npm run dev starten.'
    return
  }
  try {
    const response = await fetch('/__java-sandbox/jdks', {
      method: 'POST', headers: localHeaders, body: '{}',
    })
    if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
      throw new Error(`JShell-Brücke nicht verfügbar (HTTP ${response.status}). Den laufenden Slidev-Dev-Server beenden und mit npm run dev neu starten.`)
    }
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`)
    jdks.value = data.jdks
    target.value = data.defaultHome || ''
    if (!jdks.value.length) {
      failed.value = true
      output.value = 'Kein lokales JDK ab Java 17 mit jdk.jshell gefunden. JAVA_SANDBOX_HOME setzen und Slidev neu starten.'
    }
  }
  catch (error) {
    failed.value = true
    output.value = `JDK-Erkennung fehlgeschlagen: ${error instanceof Error ? error.message : String(error)}`
  }
  finally { loading.value = false }
  if (mounted && props.autoRun) run()
})

async function run() {
  if (!canRun.value) return
  running.value = true
  failed.value = false
  runtime.value = ''
  output.value = provider.value ? `Ausführung bei ${provider.value.label} …` : 'Lokale JShell startet …'
  try {
    const response = await fetch(provider.value ? '/__java-sandbox/external' : '/__java-sandbox/run', {
      method: 'POST',
      headers: localHeaders,
      body: JSON.stringify({
        code: code.value, preview: preview.value,
        setup: props.setups[checkpoint.value] || '',
        ...(provider.value ? { provider: provider.value.url } : { jdk: target.value }),
      }),
      signal: AbortSignal.timeout(30_000),
    })
    if (!response.headers.get('content-type')?.includes('application/json')) {
      throw new Error('Die Ausführungsbrücke liefert keine JSON-Antwort. Konfiguration prüfen.')
    }
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || `HTTP ${response.status}`)
    runtime.value = result.runtime
    output.value = result.output || '(Keine Ausgabe)'
    failed.value = !result.ok
  }
  catch (error) {
    failed.value = true
    output.value = error instanceof TypeError
      ? 'Ausführungsbrücke nicht erreichbar. Slidev-Dev-Server und Netzwerkverbindung prüfen.'
      : error instanceof Error ? error.message : String(error)
  }
  finally { running.value = false }
}
</script>

<template>
  <div class="java-sandbox" :class="{ 'sandbox-fill': fill }" @keydown.capture="onKeydown" @keydown.stop @keyup.stop @click.stop>
    <div class="sandbox-toolbar">
      <slot name="toolbar" />
      <button class="sandbox-run" :disabled="!canRun" @click="run">▶ Run</button>
      <div class="sandbox-checkpoints" role="group" aria-label="Vorbereitete Varianten">
        <button
          v-for="index in checkpoints.length + 1"
          :key="index"
          :disabled="loading || running"
          :aria-pressed="checkpoint === index - 1"
          :title="`${props.labels[index - 1] || `Variante ${index - 1}`} laden und ausführen`"
          @click="checkout(index - 1)"
        >{{ props.labels[index - 1] || index - 1 }}</button>
      </div>
      <select v-model="target" aria-label="Java-Ausführungsziel" :disabled="loading || running">
        <option v-if="loading" value="">JDKs werden erkannt …</option>
        <optgroup v-if="jdks.length" label="Lokale JDKs">
          <option v-for="jdk in jdks" :key="jdk.home" :value="jdk.home">JDK {{ jdk.version }} · {{ jdk.home }}</option>
        </optgroup>
        <optgroup label="Externe Sandboxen">
          <option v-for="entry in providers" :key="entry.url" :value="entry.url">{{ entry.label }}</option>
        </optgroup>
        <option v-if="!loading && !jdks.length" value="">{{ local ? 'Kein lokales JDK gefunden' : 'JShell nur lokal verfügbar' }}</option>
      </select>
      <label :title="fixedPreview ? 'dev.java aktiviert Preview fest.' : 'Preview-Features aktivieren'">
        <input v-model="preview" type="checkbox" :disabled="running || !target || fixedPreview" />
        --enable-preview
      </label>
    </div>
    <div class="sandbox-panes">
      <textarea
        v-model="code" aria-label="Java-Code" spellcheck="false" autocapitalize="off"
        :disabled="running"
      />
      <pre role="status" aria-live="polite" :class="{ failed }">{{ output }}</pre>
    </div>
    <p class="sandbox-hint">
      <span v-if="notice">{{ notice }} </span>
      <template v-if="provider">
        Run sendet Code an {{ provider.label }}. Nur öffentlichen Code verwenden.
        <template v-if="!local">Ausführung benötigt den lokalen Dev-Server.</template>
        <a :href="provider.url" target="_blank" rel="noopener noreferrer">Anbieter öffnen ↗</a>
      </template>
      <template v-else>Lokale JShell · Strg/⌘ + Enter: Run · Nur vertrauenswürdigen Code ausführen.</template>
      <span v-if="props.setups[checkpoint]"> · Datentypen werden im Hintergrund geladen.</span>
      <span v-if="runtime"> · {{ runtime }}</span>
    </p>
  </div>
</template>

<style scoped>
.java-sandbox { font-size: 17px; }
.sandbox-toolbar { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.sandbox-toolbar button { border: 1px solid #999; border-radius: 4px; padding: 3px 8px; font-size: 14px; }
.sandbox-toolbar button:disabled { opacity: 0.5; }
.sandbox-checkpoints { display: flex; gap: 3px; }
.sandbox-checkpoints button[aria-pressed="true"] { background: #18212b; color: white; }
.sandbox-toolbar select { flex: 1; min-width: 0; max-width: 460px; font-size: 14px; border: 1px solid #999; border-radius: 4px; padding: 3px; }
.sandbox-toolbar label { display: flex; align-items: center; gap: 4px; white-space: nowrap; font-size: 14px; }
.sandbox-panes { display: grid; grid-template-columns: 3fr 2fr; gap: 14px; }
.sandbox-panes textarea, .sandbox-panes pre {
  box-sizing: border-box; width: 100%; height: 300px; margin: 0; padding: 14px;
  border: 1px solid #bbb; border-radius: 6px; font: 10px/1.5 'Fira Code', monospace; tab-size: 4;
}
.sandbox-panes textarea { background: #f8f8f8; color: #222; resize: none; }
.sandbox-panes pre { overflow: auto; white-space: pre-wrap; overflow-wrap: anywhere; background: #18212b; color: #e7edf4; }
.sandbox-panes pre.failed { border: 2px solid #cc3434; color: #ffb7b7; }
.sandbox-hint { font-size: 14px; margin-top: 10px; }
.sandbox-fill { display: flex; flex-direction: column; height: 100%; min-height: 0; }
.sandbox-fill .sandbox-toolbar { flex: 0 0 auto; flex-wrap: wrap; }
.sandbox-fill .sandbox-panes { flex: 1; min-height: 0; }
.sandbox-fill .sandbox-panes textarea,
.sandbox-fill .sandbox-panes pre { height: 100%; min-height: 0; }
.sandbox-fill .sandbox-hint { flex: 0 0 auto; margin: 8px 0 0; line-height: 1.2; }
</style>

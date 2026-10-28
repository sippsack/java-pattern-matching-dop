import { effectScope, reactive, watch } from 'vue'

interface SandboxState {
  code: string
  checkpoint: number
  output: string
  runtime: string
  running: boolean
  failed: boolean
  preview: boolean
  open: boolean
}

const states = new Map<string, SandboxState>()
const disposeCallbacks: (() => void)[] = []
const restored: Record<string, SandboxState> = import.meta.hot?.data.sandboxStates ?? {}

if (import.meta.hot) {
  import.meta.hot.dispose((data) => {
    data.sandboxStates = Object.fromEntries(
      [...states].map(([key, state]) => [key, { ...state }]),
    )
    disposeCallbacks.forEach(dispose => dispose())
  })
}

// One channel per slide, shared by presenter previews and dialogs in this tab.
export function sandboxState(key: string, initialCode = '') {
  const existing = states.get(key)
  if (existing) return existing
  const state = reactive<SandboxState>(restored[key] ?? {
    code: initialCode, checkpoint: 0, output: 'Bereit. Ziel wählen und Run drücken.',
    runtime: '', running: false, failed: false, preview: true, open: false,
  })
  states.set(key, state)
  const channel = new BroadcastChannel(`java-sandbox:${import.meta.env.BASE_URL}:${key}`)
  const sender = crypto.randomUUID()
  let clock = 0
  let version = { clock: 0, sender: '' }
  let receiving = false

  // Presenter next-slide previews unmount independently of the shared state.
  const scope = effectScope(true)
  scope.run(() => {
    watch(state, () => {
      if (receiving) return
      version = { clock: ++clock, sender }
      channel.postMessage({ state: { ...state }, version })
    }, { flush: 'sync' })
  })

  channel.onmessage = ({ data }) => {
    if (data.request) {
      if (version.clock) channel.postMessage({ state: { ...state }, version })
      return
    }
    clock = Math.max(clock, data.version.clock)
    if (data.version.clock < version.clock
      || (data.version.clock === version.clock && data.version.sender <= version.sender)) return
    version = data.version
    receiving = true
    Object.assign(state, data.state)
    receiving = false
  }
  channel.postMessage({ request: true })
  disposeCallbacks.push(() => {
    scope.stop()
    channel.close()
  })
  return state
}

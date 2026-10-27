<script setup lang="ts">
const items = [
  { id: 'assign', text: 'Pattern Assignment', tone: 'near' },
  { id: 'foreach', text: 'Patterns in <span style="white-space:nowrap">for-each</span>', tone: 'near' },
  { id: 'classes', text: 'Dekonstruierbare Klassen', tone: 'near' },
  { id: 'interfaces', text: 'Dekonstruierbare Interfaces', tone: 'near' },
  { id: 'with', text: 'with-Ausdrücke', tone: 'near' },
  { id: 'serialization', text: 'Bessere Serialisierung', tone: 'near' },
  { id: 'nominal', text: 'Nominale Patterns', tone: 'far' },
  { id: 'evolution', text: 'Record-Evolution', tone: 'far' },
  { id: 'member', text: 'Member-Patterns', tone: 'far' },
]
</script>

<template>
  <div class="amber">
    <div class="tiles">
      <div v-for="item in items" :key="item.id" class="tile" :class="item.tone">
        <svg class="icon" viewBox="0 0 100 100" fill="none" stroke-linejoin="round" stroke-linecap="round">
          <!-- Pattern Assignment: Objekt wird in Komponenten zerlegt -->
          <g v-if="item.id === 'assign'">
            <rect x="6" y="28" width="34" height="44" rx="8" class="fill-pink" />
            <path d="M46 50h16" />
            <path d="M56 43l7 7-7 7" />
            <circle cx="80" cy="30" r="9" class="fill-purple" />
            <circle cx="80" cy="70" r="9" class="fill-coral" />
          </g>
          <!-- Patterns in for-each: Schleifenpfeil um Komponenten -->
          <g v-else-if="item.id === 'foreach'">
            <path d="M80 36a32 32 0 1 0 4 22" />
            <path d="M84 20v18H66" />
            <rect x="34" y="38" width="12" height="24" rx="4" class="fill-purple" />
            <rect x="52" y="38" width="12" height="24" rx="4" class="fill-coral" />
          </g>
          <!-- Dekonstruierbare Klassen: Klasse mit Zustand, der herausgereicht wird -->
          <g v-else-if="item.id === 'classes'">
            <rect x="8" y="14" width="48" height="72" rx="8" class="fill-mint" />
            <path d="M8 34h48" />
            <circle cx="26" cy="52" r="6" class="fill-purple" />
            <circle cx="26" cy="70" r="6" class="fill-coral" />
            <path d="M62 52h22" />
            <path d="M76 45l8 7-8 7" />
          </g>
          <!-- Dekonstruierbare Interfaces: UML-Lollipop -->
          <g v-else-if="item.id === 'interfaces'">
            <circle cx="30" cy="50" r="16" class="fill-purple" />
            <path d="M46 50h14" />
            <path d="M60 30a20 20 0 0 1 0 40" />
            <rect x="72" y="26" width="22" height="48" rx="6" class="fill-pink" />
          </g>
          <!-- with: Kopie mit einem geänderten Teil -->
          <g v-else-if="item.id === 'with'">
            <rect x="6" y="24" width="32" height="52" rx="8" class="fill-mint" />
            <rect x="14" y="34" width="16" height="10" rx="3" class="fill-purple" />
            <rect x="14" y="54" width="16" height="10" rx="3" class="fill-pink" />
            <path d="M44 50h12" />
            <path d="M50 43l7 7-7 7" />
            <rect x="62" y="24" width="32" height="52" rx="8" class="fill-mint" />
            <rect x="70" y="34" width="16" height="10" rx="3" class="fill-purple" />
            <rect x="70" y="54" width="16" height="10" rx="3" class="fill-coral" />
          </g>
          <!-- Serialisierung: Objekt zu Dokument -->
          <g v-else-if="item.id === 'serialization'">
            <rect x="6" y="30" width="30" height="40" rx="8" class="fill-pink" />
            <path d="M42 50h14" />
            <path d="M50 43l7 7-7 7" />
            <path d="M62 14h22l10 10v62H62z" class="fill-mint" />
            <path d="M84 14v10h10" />
            <path d="M74 44q-5 0-5 5t-4 5q4 0 4 5t5 5" />
            <path d="M84 44q5 0 5 5t4 5q-4 0-4 5t-5 5" />
          </g>
          <!-- Nominale Patterns: Etikett mit Namen -->
          <g v-else-if="item.id === 'nominal'">
            <path d="M10 22h40l40 40-28 28-40-40z" class="fill-cream" />
            <circle cx="28" cy="38" r="6" class="fill-white" />
            <path d="M42 56l14 14" />
            <path d="M50 48l14 14" />
          </g>
          <!-- Record-Evolution: Record wächst um eine Komponente -->
          <g v-else-if="item.id === 'evolution'">
            <rect x="8" y="62" width="22" height="26" rx="5" class="fill-mint" />
            <rect x="8" y="34" width="22" height="26" rx="5" class="fill-purple" />
            <rect x="8" y="6" width="22" height="26" rx="5" class="fill-pink" />
            <path d="M40 74h10" />
            <path d="M44 67l7 7-7 7" />
            <rect x="58" y="62" width="34" height="26" rx="5" class="fill-mint" />
            <rect x="58" y="34" width="34" height="26" rx="5" class="fill-purple" />
            <rect x="58" y="6" width="34" height="26" rx="5" class="fill-coral" />
          </g>
          <!-- Member-Patterns: Zahnrad (Fabrik) mit Muster -->
          <g v-else>
            <g class="fill-coral">
              <rect x="42" y="6" width="16" height="88" rx="5" />
              <rect x="42" y="6" width="16" height="88" rx="5" transform="rotate(45 50 50)" />
              <rect x="42" y="6" width="16" height="88" rx="5" transform="rotate(90 50 50)" />
              <rect x="42" y="6" width="16" height="88" rx="5" transform="rotate(135 50 50)" />
            </g>
            <circle cx="50" cy="50" r="28" class="fill-purple" />
            <circle cx="50" cy="50" r="11" class="fill-white" />
          </g>
        </svg>
        <span class="label" v-html="item.text"></span>
      </div>
    </div>
    <div class="legend">
      <span class="dot near"></span> Konkret in Arbeit
      <span class="dot far"></span> Langfristige Vision
      <span class="muted">· Designrichtungen, keine finalen Features</span>
    </div>
  </div>
</template>

<style scoped>
.amber {
  margin-top: 18px;
}

.tiles {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.tile {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 104px;
  padding: 0 14px;
  border-radius: 14px;
  white-space: normal;
}

.tile.near {
  background: var(--teal);
}

.tile.far {
  background: #f9dcdb;
}

.icon {
  flex: none;
  width: 66px;
  height: 66px;
  stroke: #b3124f;
  stroke-width: 4.5;
}

.icon .fill-pink {
  fill: #fbc3be;
}

.icon .fill-purple {
  fill: #5b3fb0;
}

.icon .fill-coral {
  fill: #f96a6a;
}

.icon .fill-mint {
  fill: #e9f7f4;
}

.icon .fill-cream {
  fill: var(--cream);
}

.icon .fill-white {
  fill: #fff;
}

.label {
  font-size: 23px;
  font-weight: 700;
  line-height: 1.1;
}

.nw {
  white-space: nowrap;
}

.legend {
  margin-top: 18px;
  font-size: 18px;
}

.dot {
  display: inline-block;
  width: 14px;
  height: 14px;
  margin: 0 6px 0 14px;
  border-radius: 50%;
  vertical-align: -1px;
}

.dot.near {
  background: var(--teal);
}

.dot.far {
  background: #f9dcdb;
}
</style>

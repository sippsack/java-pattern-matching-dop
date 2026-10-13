<script setup lang="ts">
type Box = {
  x: number
  y: number
  w: number
  h: number
  kind: 'record' | 'enum' | 'sealed'
  name: string
  lines: string[]
  step: number
}

const HEAD = 44
const LINE = 26

const first: Box = {
  x: 0, y: 140, w: 265, h: 120, kind: 'record', name: 'MedicationPlan', step: 0,
  lines: ['String patientName', 'List<Medication> medications'],
}

const boxes: Box[] = [
  { x: 315, y: 140, w: 170, h: 120, kind: 'record', name: 'Medication', step: 1, lines: ['Drug drug', 'Dosage dosage'] },
  { x: 535, y: 0, w: 215, h: 130, kind: 'enum', name: 'Drug', step: 2, lines: ['PARACETAMOL', 'IBUPROFEN', 'CAFFEINE'] },
  { x: 535, y: 220, w: 230, h: 90, kind: 'sealed', name: 'Dosage', step: 3, lines: ['permits Tablet, Infusion'] },
  { x: 790, y: 120, w: 150, h: 130, kind: 'record', name: 'Tablet', step: 4, lines: ['int morning', 'int midday', 'int evening'] },
  { x: 790, y: 290, w: 150, h: 104, kind: 'record', name: 'Infusion', step: 4, lines: ['int speed', 'int duration'] },
]

const has = [
  { x1: 265, y1: 200, x2: 313, y2: 200, step: 1 },
  { x1: 485, y1: 170, x2: 533, y2: 80, step: 2 },
  { x1: 485, y1: 235, x2: 533, y2: 262, step: 3 },
]
const is = [
  { x1: 790, y1: 200, x2: 767, y2: 240, step: 4 },
  { x1: 790, y1: 340, x2: 767, y2: 298, step: 4 },
]

const fill = (k: Box['kind']) => (k === 'record' ? '#46afe2' : '#f7dd49')
const label = (k: Box['kind']) => (k === 'record' ? '«record»' : k === 'enum' ? '«enum»' : '«sealed interface»')
</script>

<template>
  <svg viewBox="-6 -6 952 412" class="model-diagram" font-family="'Fira Code', monospace">
    <defs>
      <marker id="md-has" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="12" markerHeight="12" orient="auto">
        <path d="M1,1 L11,6 L1,11" fill="none" stroke="#555" stroke-width="2" />
      </marker>
      <marker id="md-is" viewBox="0 0 14 14" refX="13" refY="7" markerWidth="14" markerHeight="14" orient="auto">
        <path d="M1,1 L13,7 L1,13 Z" fill="#fff" stroke="#555" stroke-width="2" />
      </marker>
    </defs>

    <g v-for="(a, i) in has" :key="'h' + i" v-click="a.step">
      <line :x1="a.x1" :y1="a.y1" :x2="a.x2" :y2="a.y2" stroke="#555" stroke-width="2.5" marker-end="url(#md-has)" />
    </g>
    <g v-for="(a, i) in is" :key="'i' + i" v-click="a.step">
      <line :x1="a.x1" :y1="a.y1" :x2="a.x2" :y2="a.y2" stroke="#555" stroke-width="2.5" stroke-dasharray="8 5" marker-end="url(#md-is)" />
    </g>

    <g>
      <rect :x="first.x" :y="first.y" :width="first.w" :height="first.h" rx="8" fill="#fff" :stroke="fill(first.kind)" stroke-width="3" />
      <path :d="`M${first.x},${first.y + HEAD} V${first.y + 8} a8,8 0 0 1 8,-8 H${first.x + first.w - 8} a8,8 0 0 1 8,8 V${first.y + HEAD} Z`" :fill="fill(first.kind)" />
      <text :x="first.x + first.w / 2" :y="first.y + 16" text-anchor="middle" class="t-label">{{ label(first.kind) }}</text>
      <text :x="first.x + first.w / 2" :y="first.y + 37" text-anchor="middle" class="t-name">{{ first.name }}</text>
      <text v-for="(l, j) in first.lines" :key="j" :x="first.x + 14" :y="first.y + HEAD + 26 + j * LINE" class="t-field">{{ l }}</text>
    </g>

    <g v-for="b in boxes" :key="b.name" v-click="b.step">
      <rect :x="b.x" :y="b.y" :width="b.w" :height="b.h" rx="8" fill="#fff" :stroke="fill(b.kind)" stroke-width="3" />
      <path :d="`M${b.x},${b.y + HEAD} V${b.y + 8} a8,8 0 0 1 8,-8 H${b.x + b.w - 8} a8,8 0 0 1 8,8 V${b.y + HEAD} Z`" :fill="fill(b.kind)" />
      <text :x="b.x + b.w / 2" :y="b.y + 16" text-anchor="middle" class="t-label">{{ label(b.kind) }}</text>
      <text :x="b.x + b.w / 2" :y="b.y + 37" text-anchor="middle" class="t-name">{{ b.name }}</text>
      <text v-for="(l, j) in b.lines" :key="j" :x="b.x + 12" :y="b.y + HEAD + 26 + j * LINE" class="t-field">{{ l }}</text>
    </g>
  </svg>
</template>

<style>
.model-diagram {
  width: 100%;
  height: auto;
}
.model-diagram .t-label {
  font-size: 13px;
  font-style: italic;
}
.model-diagram .t-name {
  font-size: 20px;
  font-weight: 700;
}
.model-diagram .t-field {
  font-size: 14px;
}
</style>

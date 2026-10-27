<script setup lang="ts">
const fills = ['#b6d8d5', '#edafad', '#f8eaae', '#98d6f5', '#f9dcdb']
const rows: number[][] = [
  [...Array(13).fill(1), 2],
  [1.5, ...Array(12).fill(1), 1.5],
  [1.75, ...Array(11).fill(1), 2.25],
  [2.25, ...Array(10).fill(1), 2.75],
  [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25],
]
const unit = 60
const gap = 6
let n = 0
const keys = rows.flatMap((row, r) => {
  let x = 0
  return row.map((w) => {
    const key = {
      x: x * unit + gap / 2,
      y: r * unit + gap / 2,
      w: w * unit - gap,
      h: unit - gap,
      fill: fills[(n++ * 7) % fills.length],
    }
    x += w
    return key
  })
})
</script>

<template>
  <svg class="keyboard" viewBox="0 0 900 300" stroke-linejoin="round">
    <rect
      v-for="(k, i) in keys"
      :key="i"
      :x="k.x"
      :y="k.y"
      :width="k.w"
      :height="k.h"
      rx="10"
      :fill="k.fill"
      stroke="#b3124f"
      stroke-width="3.5"
    />
  </svg>
</template>

<style scoped>
.keyboard {
  display: block;
  width: 100%;
}
</style>

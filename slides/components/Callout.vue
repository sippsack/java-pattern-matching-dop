<script setup lang="ts">
defineProps<{
  line: number
  col: number
  title: string
  text?: string
  tone?: 'teal' | 'pink'
}>()
</script>

<template>
  <div class="callout" :style="{ '--l': line, '--c': col }">
    <div class="arrow"></div>
    <div class="box" :class="tone ?? 'teal'">
      <b>{{ title }}</b>
      <span v-if="text">{{ text }}</span>
    </div>
  </div>
</template>

<style scoped>
.callout {
  --fs: var(--slidev-code-font-size);
  position: absolute;
  top: calc(6px + 10px + (var(--l) - 0.5) * var(--fs) * var(--slidev-code-line-height));
  left: calc(5px + 16px + var(--c) * 0.6 * var(--fs) + 8px);
  right: 0;
  display: flex;
  align-items: center;
  transform: translateY(-50%);
}

.arrow {
  position: relative;
  flex: 1;
  min-width: 14px;
  height: 3px;
  background: var(--red);
}

.arrow::before {
  content: '';
  position: absolute;
  left: -2px;
  top: -6px;
  border-right: 11px solid var(--red);
  border-top: 7.5px solid transparent;
  border-bottom: 7.5px solid transparent;
}

.box {
  flex: none;
  width: 270px;
  box-sizing: border-box;
  padding: 5px 12px;
  border-radius: 10px;
  white-space: normal;
  font-size: 18px;
  line-height: 1.15;
}

.box b {
  display: block;
  font-size: 20px;
  font-weight: 700;
}

.box.teal {
  background: var(--teal);
}

.box.pink {
  background: #f9dcdb;
}
</style>

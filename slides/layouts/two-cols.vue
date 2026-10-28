<script setup lang="ts">
defineProps<{ cols?: string }>()
</script>

<template>
  <div class="slidev-layout embarc two-cols">
    <slot />
    <div class="cols" :style="{ gridTemplateColumns: cols || '1fr 1fr' }">
      <div class="col-left"><slot name="left" /></div>
      <div class="col-right"><slot name="right" /></div>
    </div>
  </div>
</template>

<style>
.two-cols .cols {
  display: grid;
  gap: 30px;
  align-items: start;
}
.two-cols .cols > div {
  min-width: 0;
}
</style>

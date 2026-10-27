<script setup lang="ts">
import { resolveAssetUrl } from '@slidev/client/layoutHelper.ts'

defineProps<{ image?: string }>()
</script>

<template>
  <div class="slidev-layout closing">
    <div class="left"></div>
    <div class="right"></div>
    <img v-if="image" class="mascot" :src="resolveAssetUrl(image)" alt="" />
    <div class="text"><slot /></div>
  </div>
</template>

<style>
.closing .left {
  position: absolute; left: 0; top: 0; width: 480px; height: 100%;
  background: linear-gradient(225deg, #7f7f7f 0%, #595959 46%, #404040 99%);
}
.closing .right {
  position: absolute; left: 480px; top: 0; width: 480px; height: 100%;
  background: #b6d8d5;
}
.closing .mascot {
  position: absolute; left: 462px; top: -47px; width: 400px;
}
.closing .text {
  position: absolute; left: 34px; top: 96px; width: 410px; color: #fff;
}
.closing .text h1 {
  font-size: 64px; font-weight: 700; line-height: 0.95; margin: 0 0 40px; color: #fff;
}
.closing .text p {
  font-size: 32px; line-height: 1.2; margin: 0;
}
</style>

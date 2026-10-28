<script setup lang="ts">
import { resolveAssetUrl } from '@slidev/client/layoutHelper.ts'

defineProps<{ image?: string }>()
</script>

<template>
  <div class="slidev-layout embarc-dark cover">
    <div class="oval"></div>
    <img v-if="image" class="oval-img" :src="resolveAssetUrl(image)" alt="" />
    <div class="title-box"><slot /></div>
    <div class="author-box"><slot name="author" /></div>
    <div class="date-box"><slot name="date" /></div>
    <div class="strips"><i /><i /><i /><i /></div>
    <img class="logo" src="/embarc/embarc-white.png" alt="embarc" />
  </div>
</template>

<style>
.cover .oval {
  position: absolute;
  left: 737px;
  top: -240px;
  width: 469px;
  height: 469px;
  border-radius: 50%;
  background: #fff;
}
.cover .oval-img {
  position: absolute;
  left: 788px;
  top: 14px;
  width: 160px;
}
.cover .title-box {
  position: absolute;
  left: 68px;
  top: 40px;
  width: 700px;
  height: 270px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.cover .title-box h1 {
  margin: 0;
  font-size: 54px;
  font-weight: 700;
  line-height: 0.98;
  color: #fff;
}
.cover .title-box p {
  margin: 12px 0 0;
  font-size: 32px;
  font-weight: 500;
  color: #fff;
}
.cover .author-box {
  position: absolute;
  left: 68px;
  top: 326px;
  font-size: 30px;
}
.cover .author-box p {
  margin: 0;
  line-height: 1.15;
}
.cover .author-box .sub {
  font-size: 22px;
  color: #e8e8e8;
}
.cover .date-box {
  position: absolute;
  left: 68px;
  top: 462px;
  font-size: 20px;
  color: #f2f2f2;
}
.cover .date-box p {
  margin: 0;
}
</style>

<script setup lang="ts">
defineProps<{ image?: string; number?: string }>()
</script>

<template>
  <div class="slidev-layout embarc-dark section">
    <div v-if="image" class="oval"></div>
    <img v-if="image" class="oval-img" :src="image" alt="" />
    <div class="title-box">
      <div v-if="number" class="num"><span>{{ number }}</span></div>
      <slot />
    </div>
    <div class="strips"><i /><i /><i /><i /></div>
    <img class="logo" src="/embarc/embarc-white.png" alt="embarc" />
  </div>
</template>

<style>
.section .num {
  position: relative;
  flex: 1 1 0;
  min-height: 0;
  margin-bottom: 14px;
  container-type: size;
}
.section .num span {
  position: absolute;
  left: -0.4em;
  bottom: 0;
  font-size: 140cqh;
  font-weight: 700;
  line-height: 0.7;
  color: #f7dd49;
  white-space: nowrap;
}
.section .oval {
  position: absolute;
  left: 560px;
  top: 70px;
  width: 340px;
  height: 340px;
  border-radius: 50%;
  background: #fff;
}
.section .oval-img {
  position: absolute;
  left: 575px;
  top: 78px;
  width: 310px;
}
.section .title-box {
  position: absolute;
  left: 68px;
  top: 0;
  width: 520px;
  height: 360px;
  box-sizing: border-box;
  padding-top: 40px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.section .title-box h1 {
  margin: 0;
  font-size: 72px;
  font-weight: 700;
  line-height: 0.95;
  color: #fff;
}
.section .title-box p {
  margin: 14px 0 0;
  font-size: 30px;
  color: #fff;
  line-height: 1.1;
}
</style>

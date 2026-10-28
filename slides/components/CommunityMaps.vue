<script setup lang="ts">
import locations from '../../images/iJUG-JUG-Standorte-DACH.svg'
import visited from '../../images/iJUG-JUG-Standorte-besucht-DACH.svg'
</script>

<template>
  <div class="community-maps">
    <svg class="community-map" viewBox="380 110 700 960" role="img" aria-label="Standorte der Java User Groups im iJUG in Deutschland, Österreich und der Schweiz">
      <image :href="locations" width="1612.8" height="1152" />
    </svg>
    <svg v-click="1" class="community-map" viewBox="380 110 700 960" role="img" aria-label="Bereits besuchte Java User Groups, rot markiert">
      <image :href="visited" width="1612.8" height="1152" />
    </svg>
  </div>
  <div class="community-map-tags">
    <span>#KonferenzTourist</span>
    <span>#JugAddicted</span>
  </div>
  <p class="community-map-source">Stand: 24.09.2026 · Gruppen: ijug.eu</p>
</template>

<style>
.slidev-layout.community-maps-slide::before {
  display: none;
}

.community-maps {
  position: absolute;
  inset: 12px 83px 27px 57px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 30px;
}

.community-map {
  width: 100%;
  height: 100%;
}

.community-map-tags {
  position: absolute;
  top: 0;
  right: 12px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.community-map-tags span {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-size: 26px;
  font-weight: 700;
}

.slidev-layout .community-map-source {
  position: absolute;
  bottom: 7px;
  left: 57px;
  margin: 0;
  font-size: 12px;
  color: var(--muted);
}
</style>

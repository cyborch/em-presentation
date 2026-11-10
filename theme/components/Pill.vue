<script setup lang="ts">
withDefaults(defineProps<{ color?: string, active?: boolean }>(), {
  color: '#d9d7d2',
  active: false,
})
</script>

<template>
  <span class="em-pill" :class="{ active }">
    <i class="em-pill-dot" :style="{ background: active ? '#818bff' : color }" />
    <slot />
  </span>
</template>

<style scoped>
.em-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 1rem;
  border: 1px solid var(--em-line);
  border-radius: 10px;
  background: var(--em-bg);
  color: var(--em-fg);
  font-size: 0.9rem;
  letter-spacing: -0.01em;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.em-pill.active {
  border-color: var(--em-fg);
}

.em-pill-dot {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 50%;
  display: inline-block;
}
</style>

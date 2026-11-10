<script setup lang="ts">
import { useNav } from '@slidev/client'
import Bolt from './components/Bolt.vue'

const { currentPage, total, currentLayout } = useNav()
</script>

<template>
  <div
    v-if="currentLayout !== 'cover' && currentLayout !== 'intro'"
    class="em-chrome"
    :class="{ 'em-chrome-dark': ['section', 'end'].includes(currentLayout as string) }"
  >
    <Bolt style="width: 1.1rem; height: 1.1rem; color: var(--em-fg)" />
    <span>{{ String(currentPage).padStart(2, '0') }} / {{ String(total).padStart(2, '0') }}</span>
  </div>
</template>

<style>
.em-chrome-dark {
  color: #a8a6a0;
}

.em-chrome-dark svg {
  color: #fff !important;
}
</style>

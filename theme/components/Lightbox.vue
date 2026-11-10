<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'

const open = ref(false)

function onKeydown(e: KeyboardEvent) {
  // Capture phase: keep Slidev from navigating while the lightbox is open
  e.stopPropagation()
  if (e.key === 'Escape')
    open.value = false
}

watch(open, (isOpen) => {
  if (isOpen)
    window.addEventListener('keydown', onKeydown, true)
  else
    window.removeEventListener('keydown', onKeydown, true)
})

onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown, true))
</script>

<template>
  <div class="em-lightbox-trigger" title="Click to enlarge" @click="open = true">
    <slot />
  </div>

  <Teleport to="body">
    <Transition name="em-lightbox">
      <div v-if="open" class="em-lightbox" role="dialog" aria-modal="true" @click="open = false">
        <div class="em-lightbox-content">
          <slot />
        </div>
        <button class="em-lightbox-close" aria-label="Close" @click.stop="open = false">
          &times;
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
.em-lightbox-trigger {
  cursor: zoom-in;
}

.em-lightbox {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: rgba(10, 10, 10, 0.88);
  cursor: zoom-out;
}

.em-lightbox-content {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  max-height: 100%;
}

.em-lightbox-content img {
  display: block;
  max-width: calc(100vw - 8rem);
  max-height: calc(100vh - 6rem);
  width: auto;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
}

.em-lightbox-close {
  position: absolute;
  top: 1rem;
  right: 1.25rem;
  width: 2.5rem;
  height: 2.5rem;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-size: 1.75rem;
  line-height: 1;
  cursor: pointer;
}

.em-lightbox-close:hover {
  background: rgba(255, 255, 255, 0.24);
}

.em-lightbox-enter-active,
.em-lightbox-leave-active {
  transition: opacity 0.2s ease;
}

.em-lightbox-enter-from,
.em-lightbox-leave-to {
  opacity: 0;
}
</style>

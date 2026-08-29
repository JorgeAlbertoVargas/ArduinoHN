<template>
  <div class="toast-container" :class="{ 'toast-visible': isVisible }">
    <div class="toast-content">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:12px; color: #4ade80;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
      <span>{{ message }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast'
const { isVisible, message } = useToast()
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background-color: var(--bg-card, #ffffff);
  color: var(--text-main, #333333);
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  border: 1px solid var(--glass-border, #eaeaea);
  z-index: 9999;
  transform: translateY(150%);
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
.toast-visible {
  transform: translateY(0);
  opacity: 1;
}
.toast-content {
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 1.05rem;
}
</style>

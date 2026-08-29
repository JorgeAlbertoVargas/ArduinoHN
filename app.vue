<template>
  <div class="app-wrapper">
    <NuxtRouteAnnouncer />
    <Navbar />
    <main class="main-content">
      <NuxtPage />
    </main>
    <Footer />
    <ChatbotWidget />
    <ToastNotification />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useGlobalCurrencyConfig } from '~/composables/useGlobalCurrencyConfig'

const { fetchUser } = useAuth()
const { fetchConfig } = useGlobalCurrencyConfig()

onMounted(async () => {
  await Promise.all([
    fetchUser(),
    fetchConfig()
  ])
})
</script>

<style>
.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.main-content {
  flex: 1;
}
</style>

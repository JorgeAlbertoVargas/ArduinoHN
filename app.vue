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

const { fetchUser } = useAuth()

onMounted(async () => {
  await fetchUser()
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

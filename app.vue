<template>
  <div class="app-wrapper">
    <NuxtRouteAnnouncer />
    <AnnouncementBar />
    <Navbar />
    <main class="main-content">
      <NuxtPage />
    </main>
    <Footer />
    <ChatbotWidget />
    <WelcomeModal />
    <ToastNotification />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useGlobalCurrencyConfig } from '~/composables/useGlobalCurrencyConfig'

const { fetchUser } = useAuth()
const { fetchConfig } = useGlobalCurrencyConfig()

useSeoMeta({
  titleTemplate: '%s - ArduinoHN',
  ogImage: 'https://arduino.hn/logo.png',
  twitterCard: 'summary_large_image',
  description: 'Encuentra los mejores componentes electrónicos, sensores, módulos y accesorios de robótica para tus proyectos Arduino en Honduras.'
})

useSchemaOrg([
  defineOrganization({
    name: 'ArduinoHN',
    logo: '/logo.png',
    sameAs: [
      // Agrega aquí tus URLs de redes sociales cuando las crees:
      // 'https://www.facebook.com/tu-pagina',
      // 'https://www.instagram.com/tu-pagina'
    ]
  }),
  defineWebSite({
    name: 'ArduinoHN'
  })
])

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

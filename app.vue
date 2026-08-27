<template>
  <div class="app-wrapper">
    <NuxtRouteAnnouncer />
    <Navbar />
    <main class="main-content">
      <NuxtPage />
    </main>
    <Footer />
    <ChatbotWidget />
  </div>
</template>

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

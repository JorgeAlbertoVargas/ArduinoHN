<template>
  <div class="container blog-page">
    <div class="blog-header text-center">
      <h1>Blog Interactivo</h1>
      <p>Noticias, tutoriales y artículos sobre el mundo Arduino e IIoT.</p>
    </div>
    
    <div class="blog-grid">
      <div class="blog-post glass" v-for="post in posts" :key="post.id">
        <h3 class="post-title">{{ post.title }}</h3>
        <span class="post-date">{{ post.date }}</span>
        <p class="post-excerpt">{{ post.excerpt }}</p>
        <NuxtLink :to="`/blog/${post.id}`" class="read-more">Leer artículo completo &rarr;</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const posts = [
  { id: 1, title: 'Introducción a LoRaWAN', date: '15 Ago 2026', excerpt: 'Cómo conectar tus sensores a grandes distancias sin internet.' },
  { id: 2, title: 'PLC vs Arduino Portenta', date: '02 Ago 2026', excerpt: '¿Puede un microcontrolador reemplazar a un PLC industrial?' },
  { id: 3, title: 'Optimizando el Consumo de Batería', date: '20 Jul 2026', excerpt: 'Técnicas de deep sleep para dispositivos IIoT remotos.' }
]
</script>

<style scoped>
.blog-page {
  padding: 4rem 0;
}
.blog-header {
  margin-bottom: 4rem;
}
.blog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
}
.blog-post {
  padding: 2rem;
  border-top: 4px solid var(--color-accent);
}
.post-title {
  font-size: 1.4rem;
  margin-bottom: 0.5rem;
}
.post-date {
  font-size: 0.85rem;
  color: var(--text-muted);
  display: block;
  margin-bottom: 1rem;
}
.post-excerpt {
  margin-bottom: 1.5rem;
}
.read-more {
  font-weight: 600;
  color: var(--color-primary);
}
.read-more:hover {
  text-decoration: underline;
}
.text-center {
  text-align: center;
}
</style>

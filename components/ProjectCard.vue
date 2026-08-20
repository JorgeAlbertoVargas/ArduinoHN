<template>
  <div class="project-card glass">
    <div class="project-content">
      <span class="project-category">{{ category }}</span>
      <h3 class="project-title">{{ title }}</h3>
      <p class="project-excerpt">{{ excerpt }}</p>
      <NuxtLink :to="`/projects/${id}`" class="project-link">Ver Proyecto &rarr;</NuxtLink>
    </div>
  </div>
</template>

<script setup>
defineProps({
  id: String,
  title: String,
  excerpt: String,
  category: String
})
</script>

<style scoped>
.project-card {
  padding: 2rem;
  transition: all 0.3s ease;
  border-left: 4px solid var(--color-primary);
}
.project-card:hover {
  transform: scale(1.02);
  box-shadow: var(--glass-shadow);
}
.project-category {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--color-accent);
  font-weight: 700;
}
.project-title {
  margin-top: 0.5rem;
  font-size: 1.5rem;
}
.project-excerpt {
  color: var(--text-muted);
  margin-bottom: 1.5rem;
}
.project-link {
  font-weight: 600;
  color: var(--color-primary);
}
.project-link:hover {
  text-decoration: underline;
}
</style>

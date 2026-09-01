<template>
  <div class="projects-page">
    <div class="store-intro-banner">
      <p class="intro-text">Proyectos e IIoT: Código, arquitectura y soluciones para automatización industrial.</p>
    </div>
    
    <StoreHeroCarousel />

    <div class="container store-content">
      <div v-if="pending" class="text-center" style="padding: 2rem;">
        <p>Cargando proyectos desde NocoDB...</p>
      </div>
    <div v-else-if="error" class="text-center" style="padding: 2rem; color: #d9534f;">
      <p>Hubo un error cargando los proyectos. Verifica tus credenciales o esquema de NocoDB.</p>
      <p>Detalle: {{ error.message || error }}</p>
    </div>
    <div v-else-if="projects.length === 0" class="text-center" style="padding: 2rem;">
      <p>No se encontraron proyectos. Asegúrate de agregar algunos en tu tabla de NocoDB.</p>
    </div>
    
    <div v-else class="projects-list">
      <ProjectCard 
        v-for="project in projects" 
        :key="project.id"
        :id="project.id"
        :title="project.title"
        :category="project.category"
        :excerpt="project.excerpt"
      />
    </div>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig();

// Configuración de la petición a NocoDB
const nocodbUrl = config.public.nocodbUrl?.replace(/\/$/, ''); // Remover slash final si existe
const tableName = config.public.nocodbProjectsTable || 'projects';
const endpoint = `${nocodbUrl}/api/v2/tables/${tableName}/records`;

const { data: nocoData, pending, error } = await useAsyncData('nocodbProjects', () => {
  return $fetch(endpoint, {
    headers: {
      'xc-token': config.public.nocodbToken
    }
  });
});

// Mapear los resultados de NocoDB (normalmente vienen en la propiedad 'list')
const projects = computed(() => {
  if (!nocoData.value || !nocoData.value.list) return [];
  
  return nocoData.value.list.map(record => ({
    id: record.Id || record.id,
    title: record.Title || record.title || 'Sin título',
    category: record.Category || record.category || 'General',
    excerpt: record.Expert || record.expert || record.Excerpt || record.excerpt || 'Sin descripción.'
  }));
});
</script>

<style scoped>
.projects-page { width: 100%; }
.store-intro-banner { width: 100%; background-color: rgba(0, 168, 150, 0.05); padding: 16px 20px; text-align: center; border-bottom: 1px solid rgba(0, 168, 150, 0.2); }
.intro-text { margin: 0; font-size: 1.1rem; color: var(--color-primary, #00a896); font-weight: 800; letter-spacing: 0.5px; width: 100%; }
.store-content { padding: 4rem 1rem; }
.projects-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
}
.text-center {
  text-align: center;
}
</style>

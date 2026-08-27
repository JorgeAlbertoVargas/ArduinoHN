<template>
  <div class="container projects-page">
    <div class="projects-header text-center">
      <h1>Proyectos e IIoT</h1>
      <p>Código, arquitectura y soluciones para automatización industrial.</p>
    </div>
    
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
.projects-page {
  padding: 4rem 0;
}
.projects-header {
  margin-bottom: 4rem;
}
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

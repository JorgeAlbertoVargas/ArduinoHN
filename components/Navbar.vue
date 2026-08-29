<template>
  <header class="navbar glass">
    <!-- Top Tier -->
    <div class="container navbar-top">
      <div class="nav-left">
        <button class="mobile-menu-btn" @click="isMobileMenuOpen = !isMobileMenuOpen">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <NuxtLink to="/" class="brand">
          <img src="/logo.png" alt="Logo" class="brand-logo" />
          <span class="logo">ArduinoHN</span>
        </NuxtLink>
      </div>

      <div class="nav-center search-bar-container">
        <form class="search-bar" @submit.prevent="handleSearch">
          <input v-model="searchQuery" type="text" placeholder="Buscar productos, proyectos..." class="search-input" />
          <button type="submit" class="search-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
        </form>
      </div>

      <div class="nav-right">
        <CartIcon />
        <div class="nav-actions flex items-center gap-4">
          <ClientOnly>
            <template v-if="isAuthenticated">
              <div class="user-dropdown">
                <button class="user-btn">
                  <span>{{ user?.full_name || user?.email || 'Usuario' }}</span>
                  <span class="points-badge">{{ points }} pts</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </button>
                <div class="dropdown-menu glass">
                  <NuxtLink v-if="isAdmin" to="/admin/users" class="dropdown-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    Gestión de Usuarios
                  </NuxtLink>
                  <NuxtLink v-if="isAdmin" to="/admin/offers" class="dropdown-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 12H16c-.7 2-2 3-4 3s-3.3-1-4-3H2.5"/><path d="M5.5 5.1L2 12v6c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 17 5H7a2 2 0 0 0-1.5.1z"/></svg>
                    Ofertas del mes
                  </NuxtLink>
                  <NuxtLink v-if="isAdmin" to="/admin/loyalty" class="dropdown-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    Lealtad (Puntos)
                  </NuxtLink>
                  <button @click="handleLogout" class="dropdown-item text-danger">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </template>
            <template v-else>
              <NuxtLink to="/login" class="btn btn-primary login-btn">Iniciar Sesión</NuxtLink>
            </template>
          </ClientOnly>
        </div>
      </div>
    </div>

    <!-- Bottom Tier (Desktop) / Mobile Menu -->
    <div :class="['navbar-bottom', { 'mobile-open': isMobileMenuOpen }]">
      <div class="container">
        <nav class="nav-links">
          <NuxtLink to="/store" @click="closeMobileMenu">Tienda virtual</NuxtLink>
          <NuxtLink to="/deals" @click="closeMobileMenu">Ofertas del mes</NuxtLink>
          <NuxtLink to="/coupons" @click="closeMobileMenu">Cupones</NuxtLink>
          <NuxtLink to="/projects" @click="closeMobileMenu">Proyectos</NuxtLink>
          <NuxtLink to="/blog" @click="closeMobileMenu">Blog</NuxtLink>
          <NuxtLink to="/history" @click="closeMobileMenu" class="auth-only">Historial de consumo</NuxtLink>
          <NuxtLink to="/customer-service" @click="closeMobileMenu">Servicio al cliente</NuxtLink>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import CartIcon from '~/components/CartIcon.vue';
import { useAuth } from '~/composables/useAuth';
import { useLoyalty } from '~/composables/useLoyalty';

const { user, isAuthenticated, isAdmin, logout } = useAuth();
const { points, fetchLoyalty } = useLoyalty();

watch(isAuthenticated, (newVal) => {
  if (newVal) fetchLoyalty();
}, { immediate: true });
const isMobileMenuOpen = ref(false);
const searchQuery = ref('');
const router = useRouter();

const handleLogout = async () => {
  await logout();
  router.push('/login');
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/store', query: { q: searchQuery.value.trim() } });
    closeMobileMenu();
  } else {
    router.push({ path: '/store' });
  }
};
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  border-radius: 0;
  border-left: none;
  border-right: none;
  border-top: none;
  display: flex;
  flex-direction: column;
}

.navbar-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 20px;
  gap: 1rem;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  color: var(--text-main);
  cursor: pointer;
  padding: 4px;
}

.brand {
  display: flex;
  align-items: center;
}

.brand-logo {
  height: 36px;
  width: auto;
  margin-right: 12px;
  filter: brightness(0) saturate(100%) invert(42%) sepia(51%) saturate(2320%) hue-rotate(143deg) brightness(93%) contrast(101%);
}

.brand .logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
  white-space: nowrap;
}

.search-bar-container {
  flex: 1;
  max-width: 500px; /* Moderate size as requested */
  display: flex;
  justify-content: center;
}

.search-bar {
  display: flex;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--glass-border);
  background-color: var(--bg-card);
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);
}

.search-input {
  flex: 1;
  border: none;
  padding: 8px 12px;
  font-family: inherit;
  font-size: 0.95rem;
  background: transparent;
  color: var(--text-main);
  outline: none;
}

.search-btn {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 0 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.search-btn:hover {
  background-color: var(--color-secondary);
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.login-btn {
  padding: 8px 16px;
  font-size: 0.9rem;
}

.navbar-bottom {
  background-color: rgba(0, 151, 156, 0.05); /* Slight tint for the bottom bar */
  border-top: 1px solid var(--glass-border);
  padding: 0.5rem 0;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto; /* Allow scrolling if too many items on small screens */
  white-space: nowrap;
  scrollbar-width: none; /* Hide scrollbar Firefox */
}
.nav-links::-webkit-scrollbar {
  display: none; /* Hide scrollbar Chrome/Safari */
}

.nav-links a {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-main);
  opacity: 0.8;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: var(--color-primary);
  opacity: 1;
}

/* User Dropdown */
.user-dropdown {
  position: relative;
  display: inline-block;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  font-family: var(--font-family);
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-main);
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.user-btn:hover {
  background-color: rgba(0, 151, 156, 0.1);
}

.points-badge {
  background-color: #f39c12;
  color: white;
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 700;
  margin-left: 4px;
}

.dropdown-menu {
  display: none;
  position: absolute;
  right: 0;
  top: 100%;
  min-width: 180px;
  background-color: var(--bg-card);
  border-radius: 8px;
  padding: 8px 0;
  z-index: 1000;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.user-dropdown:hover .dropdown-menu {
  display: block;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: none;
  text-align: left;
  font-family: var(--font-family);
  font-size: 0.9rem;
  color: var(--text-main);
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: rgba(0, 151, 156, 0.05);
  color: var(--color-primary);
}

.text-danger {
  color: #c62828 !important;
}

.text-danger:hover {
  background-color: rgba(198, 40, 40, 0.05);
}

/* Responsive Design */
@media (max-width: 768px) {
  .mobile-menu-btn {
    display: block;
  }
  
  .search-bar-container {
    display: none; /* Hide on very small screens, or we can move it below */
  }
  
  .navbar-bottom {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: var(--bg-card);
    border-bottom: 1px solid var(--glass-border);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    padding: 1rem 0;
    z-index: 99;
  }
  
  .navbar-bottom.mobile-open {
    display: block;
  }
  
  .nav-links {
    flex-direction: column;
    gap: 1rem;
    padding: 0 20px;
  }
  
  .brand .logo {
    display: none; /* Hide text logo on mobile to save space */
  }
}

/* Show search bar on mobile by adding it inside the mobile menu or a dedicated row if needed */
/* For simplicity, we hide the main search on mobile and rely on navigation, but let's make it visible but smaller instead */
@media (max-width: 768px) {
  .navbar-top {
    flex-wrap: wrap;
  }
  .search-bar-container {
    display: flex;
    order: 3;
    flex-basis: 100%;
    max-width: 100%;
    margin-top: 0.5rem;
  }
  .brand .logo {
    display: block;
  }
}
</style>

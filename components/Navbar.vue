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
                  <span>{{ (user?.full_name && user.full_name.toLowerCase() !== 'administrador' && user.full_name.toLowerCase() !== 'admin') ? user.full_name : 'Jorge Vargas' }}</span>
                  <span class="points-badge">{{ points }} pts</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </button>
                <div class="dropdown-menu glass">
                  <template v-if="isAdmin">
                    <div class="dropdown-header">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                      <span>Gestión del Negocio</span>
                    </div>

                    <!-- Tree View Structure -->
                    <div class="tree-menu">
                      <!-- Expandable Parent Node: Usuarios & Seguridad -->
                      <div class="tree-node tree-branch" :class="{ 'is-expanded': isUsersExpanded }">
                        <button 
                          type="button" 
                          class="tree-item branch-header"
                          @click.stop="isUsersExpanded = !isUsersExpanded"
                        >
                          <span class="tree-toggle">
                            <svg :class="{ 'rotated': isUsersExpanded }" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                              <path d="m9 18 6-6-6-6"/>
                            </svg>
                          </span>
                          <span class="tree-icon folder-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                          </span>
                          <span class="tree-label">Usuarios & Seguridad</span>
                        </button>

                        <div v-show="isUsersExpanded" class="tree-children">
                          <NuxtLink to="/admin/users" class="tree-item tree-child leaf-node">
                            <span class="tree-icon child-icon">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>
                            </span>
                            <span class="tree-label">Gestión de Usuarios</span>
                          </NuxtLink>

                          <NuxtLink to="/admin/audit-logs" class="tree-item tree-child leaf-node">
                            <span class="tree-icon child-icon">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="11" r="3"/></svg>
                            </span>
                            <span class="tree-label">Auditoría de Seguridad</span>
                          </NuxtLink>
                        </div>
                      </div>

                      <!-- Node: Ofertas del mes -->
                      <div class="tree-node">
                        <NuxtLink to="/admin/offers" class="tree-item leaf-node">
                          <span class="tree-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 12H16c-.7 2-2 3-4 3s-3.3-1-4-3H2.5"/><path d="M5.5 5.1L2 12v6c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 17 5H7a2 2 0 0 0-1.5.1z"/></svg>
                          </span>
                          <span class="tree-label">Ofertas del mes</span>
                        </NuxtLink>
                      </div>

                      <!-- Expandable Parent Node: Ajustes -->
                      <div class="tree-node tree-branch" :class="{ 'is-expanded': isSettingsExpanded }">
                        <button 
                          type="button" 
                          class="tree-item branch-header"
                          @click.stop="isSettingsExpanded = !isSettingsExpanded"
                        >
                          <span class="tree-toggle">
                            <svg :class="{ 'rotated': isSettingsExpanded }" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                              <path d="m9 18 6-6-6-6"/>
                            </svg>
                          </span>
                          <span class="tree-icon folder-icon">
                            <svg v-if="!isSettingsExpanded" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>
                            </svg>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>
                              <path d="M2 13h20"/>
                            </svg>
                          </span>
                          <span class="tree-label">Ajustes</span>
                        </button>

                        <!-- Subnodes de Ajustes -->
                        <div v-show="isSettingsExpanded" class="tree-children">
                          <NuxtLink to="/admin/loyalty?section=puntos" class="tree-item tree-child leaf-node">
                            <span class="tree-icon child-icon">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
                            </span>
                            <span class="tree-label">Sistema de Puntos</span>
                          </NuxtLink>

                          <NuxtLink to="/admin/loyalty?section=moneda" class="tree-item tree-child leaf-node">
                            <span class="tree-icon child-icon">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                            </span>
                            <span class="tree-label">Moneda y Tasa de Cambio</span>
                          </NuxtLink>

                          <NuxtLink to="/admin/loyalty?section=margenes" class="tree-item tree-child leaf-node">
                            <span class="tree-icon child-icon">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 7-7.5 7.5-3.5-3.5-7 7"/><path d="M16 7h6v6"/></svg>
                            </span>
                            <span class="tree-label">Márgenes & Semiconductores</span>
                          </NuxtLink>

                          <NuxtLink to="/admin/loyalty?section=facturacion" class="tree-item tree-child leaf-node">
                            <span class="tree-icon child-icon">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
                            </span>
                            <span class="tree-label">Impuestos y Facturación</span>
                          </NuxtLink>

                          <NuxtLink to="/admin/loyalty?section=niveles" class="tree-item tree-child leaf-node">
                            <span class="tree-icon child-icon">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                            </span>
                            <span class="tree-label">Sistema de Niveles</span>
                          </NuxtLink>
                        </div>
                      </div>

                      <!-- Expandable Parent Node: Análisis De Producto -->
                      <div class="tree-node tree-branch" :class="{ 'is-expanded': isProductAnalysisExpanded }">
                        <button 
                          type="button" 
                          class="tree-item branch-header"
                          @click.stop="isProductAnalysisExpanded = !isProductAnalysisExpanded"
                        >
                          <span class="tree-toggle">
                            <svg :class="{ 'rotated': isProductAnalysisExpanded }" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                              <path d="m9 18 6-6-6-6"/>
                            </svg>
                          </span>
                          <span class="tree-icon folder-icon">
                            <svg v-if="!isProductAnalysisExpanded" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>
                            </svg>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>
                              <path d="M2 13h20"/>
                            </svg>
                          </span>
                          <span class="tree-label">Análisis De Producto</span>
                        </button>

                        <!-- Children / Subnodes with Hierarchy Guidelines -->
                        <div v-show="isProductAnalysisExpanded" class="tree-children">
                          <NuxtLink to="/admin/product-matrix" class="tree-item tree-child leaf-node">
                            <span class="tree-icon child-icon">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                                <line x1="3" x2="21" y1="9" y2="9"/>
                                <line x1="3" x2="21" y1="15" y2="15"/>
                                <line x1="9" x2="9" y1="3" y2="21"/>
                                <line x1="15" x2="15" y1="3" y2="21"/>
                              </svg>
                            </span>
                            <span class="tree-label">Matriz de evaluación de productos</span>
                          </NuxtLink>

                          <NuxtLink to="/admin/product-matrix-config" class="tree-item tree-child leaf-node">
                            <span class="tree-icon child-icon">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                                <circle cx="12" cy="12" r="3"/>
                              </svg>
                            </span>
                            <span class="tree-label">Ajustes de Criterios & Filtros</span>
                          </NuxtLink>
                        </div>
                      </div>

                      <!-- Expandable Parent Node: Métricas & Meta Ads -->
                      <div class="tree-node tree-branch" :class="{ 'is-expanded': isMetaMetricsExpanded }">
                        <button 
                          type="button" 
                          class="tree-item branch-header"
                          @click.stop="isMetaMetricsExpanded = !isMetaMetricsExpanded"
                        >
                          <span class="tree-toggle">
                            <svg :class="{ 'rotated': isMetaMetricsExpanded }" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                              <path d="m9 18 6-6-6-6"/>
                            </svg>
                          </span>
                          <span class="tree-icon folder-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <line x1="12" x2="12" y1="20" y2="10"/>
                              <line x1="18" x2="18" y1="20" y2="4"/>
                              <line x1="6" x2="6" y1="20" y2="16"/>
                            </svg>
                          </span>
                          <span class="tree-label">Métricas</span>
                        </button>

                        <!-- Children / Subnodes of Métricas -->
                        <div v-show="isMetaMetricsExpanded" class="tree-children">
                          <NuxtLink to="/admin/meta-metrics" class="tree-item tree-child leaf-node">
                            <span class="tree-icon child-icon">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                              </svg>
                            </span>
                            <span class="tree-label">Cascada de Rentabilidad & ROAS</span>
                          </NuxtLink>

                          <NuxtLink to="/admin/meta-metrics?tab=diagnostico" class="tree-item tree-child leaf-node">
                            <span class="tree-icon child-icon">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"/>
                                <circle cx="12" cy="12" r="6"/>
                                <circle cx="12" cy="12" r="2"/>
                              </svg>
                            </span>
                            <span class="tree-label">Matriz de Diagnóstico & Benchmarks</span>
                          </NuxtLink>

                          <NuxtLink to="/admin/meta-metrics?tab=comparador" class="tree-item tree-child leaf-node">
                            <span class="tree-icon child-icon">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect width="18" height="18" x="3" y="3" rx="2"/>
                                <line x1="8" x2="8" y1="12" y2="16"/>
                                <line x1="12" x2="12" y1="8" y2="16"/>
                                <line x1="16" x2="16" y1="4" y2="16"/>
                              </svg>
                            </span>
                            <span class="tree-label">Comparador de Escenarios (AOV)</span>
                          </NuxtLink>

                          <NuxtLink to="/admin/meta-metrics?tab=scenarios" class="tree-item tree-child leaf-node">
                            <span class="tree-icon child-icon">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="16" x2="8" y1="13" y2="13"/>
                                <line x1="16" x2="8" y1="17" y2="17"/>
                                <line x1="10" x2="8" y1="9" y2="9"/>
                              </svg>
                            </span>
                            <span class="tree-label">Historial & CRUD de Auditorías</span>
                          </NuxtLink>
                        </div>
                      </div>
                    </div>

                    <div class="dropdown-divider"></div>
                  </template>

                  <button @click="handleLogout" class="dropdown-item text-danger logout-btn">
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
          <NuxtLink to="/semiconductores" @click="closeMobileMenu" class="semiconductors-nav-link">
            Semiconductores
          </NuxtLink>
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
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import CartIcon from '~/components/CartIcon.vue';
import { useAuth } from '~/composables/useAuth';
import { useLoyalty } from '~/composables/useLoyalty';

const { user, isAuthenticated, isAdmin, logout } = useAuth();
const { points, fetchLoyalty } = useLoyalty();

const isUsersExpanded = ref(true);
const isSettingsExpanded = ref(true);
const isProductAnalysisExpanded = ref(true);
const isMetaMetricsExpanded = ref(true);
const isMobileMenuOpen = ref(false);
const searchQuery = ref('');
const router = useRouter();

watch(isAuthenticated, (newVal) => {
  if (newVal) fetchLoyalty();
}, { immediate: true });

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

.semiconductors-nav-link {
  color: #38bdf8 !important;
  font-weight: 600 !important;
  opacity: 1 !important;
  position: relative;
}

.semiconductors-nav-link:hover,
.semiconductors-nav-link.router-link-active {
  color: #00a896 !important;
  text-shadow: 0 0 10px rgba(0, 168, 150, 0.4);
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
  min-width: 280px;
  background-color: var(--bg-card);
  border-radius: 10px;
  padding: 8px;
  z-index: 1000;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.14);
  border: 1px solid var(--glass-border);
}

.user-dropdown:hover .dropdown-menu {
  display: block;
}

.dropdown-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px 8px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-primary);
  border-bottom: 1px solid var(--glass-border);
  margin-bottom: 6px;
}

/* Tree Structure Styles */
.tree-menu {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tree-node {
  position: relative;
}

.tree-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 7px 12px;
  border: none;
  background: none;
  text-align: left;
  font-family: var(--font-family);
  font-size: 0.88rem;
  color: var(--text-main);
  cursor: pointer;
  text-decoration: none;
  border-radius: 6px;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.tree-item:hover {
  background-color: rgba(0, 151, 156, 0.08);
  color: var(--color-primary);
}

.tree-item.router-link-active {
  background-color: rgba(0, 151, 156, 0.12);
  color: var(--color-primary);
  font-weight: 600;
}

.tree-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  color: var(--text-muted, #64748b);
  flex-shrink: 0;
}

.tree-toggle svg {
  transition: transform 0.2s ease;
}

.tree-toggle svg.rotated {
  transform: rotate(90deg);
}

.tree-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--color-primary);
}

.folder-icon {
  color: #eab308;
}

.child-icon {
  color: #0284c7;
}

.tree-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Sub-branch guidelines (Arbol de dependencias) */
.tree-children {
  position: relative;
  margin-left: 20px;
  padding-left: 12px;
  border-left: 1.5px solid rgba(0, 151, 156, 0.3);
  margin-top: 2px;
  margin-bottom: 4px;
}

.tree-child {
  position: relative;
  font-size: 0.82rem;
  padding: 6px 10px;
}

.tree-child::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 50%;
  width: 10px;
  height: 1.5px;
  background-color: rgba(0, 151, 156, 0.3);
}

.dropdown-divider {
  height: 1px;
  background-color: var(--glass-border);
  margin: 6px 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: none;
  text-align: left;
  font-family: var(--font-family);
  font-size: 0.88rem;
  color: var(--text-main);
  cursor: pointer;
  text-decoration: none;
  border-radius: 6px;
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
  background-color: rgba(198, 40, 40, 0.08);
}

/* Responsive Design */
@media (max-width: 768px) {
  .mobile-menu-btn {
    display: block;
  }
  
  .search-bar-container {
    display: none;
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
    display: none;
  }
}

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


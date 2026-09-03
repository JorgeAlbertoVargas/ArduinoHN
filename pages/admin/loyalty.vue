<template>
  <div class="admin-container">
    <div class="admin-header-row">
      <div>
        <div class="admin-breadcrumb">
          <NuxtLink to="/admin/users">Administración</NuxtLink>
          <span class="separator">/</span>
          <NuxtLink to="/admin/loyalty?section=all">Ajustes</NuxtLink>
          <template v-if="activeSection !== 'all'">
            <span class="separator">/</span>
            <span class="current">{{ activeSectionTitle }}</span>
          </template>
        </div>
        <h1 class="admin-title">{{ activeSection === 'all' ? 'Ajustes del Negocio' : activeSectionTitle }}</h1>
      </div>
      <NuxtLink to="/" class="btn btn-accent">Volver a la Tienda</NuxtLink>
    </div>

    <!-- Navigation Tabs / Pills -->
    <div class="settings-tabs-nav">
      <button 
        type="button" 
        class="tab-btn" 
        :class="{ active: activeSection === 'all' }"
        @click="setSection('all')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
        <span>Todos</span>
      </button>

      <button 
        type="button" 
        class="tab-btn" 
        :class="{ active: activeSection === 'puntos' }"
        @click="setSection('puntos')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
        <span>Puntos</span>
      </button>

      <button 
        type="button" 
        class="tab-btn" 
        :class="{ active: activeSection === 'moneda' }"
        @click="setSection('moneda')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        <span>Moneda</span>
      </button>

      <button 
        type="button" 
        class="tab-btn" 
        :class="{ active: activeSection === 'margenes' }"
        @click="setSection('margenes')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 7-7.5 7.5-3.5-3.5-7 7"/><path d="M16 7h6v6"/></svg>
        <span>Márgenes</span>
      </button>

      <button 
        type="button" 
        class="tab-btn" 
        :class="{ active: activeSection === 'facturacion' }"
        @click="setSection('facturacion')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
        <span>Impuestos & Facturación (SAR)</span>
      </button>

      <button 
        type="button" 
        class="tab-btn" 
        :class="{ active: activeSection === 'niveles' }"
        @click="setSection('niveles')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        <span>Niveles</span>
      </button>
    </div>

    <div v-if="errorMsg" class="alert alert-error">
      {{ errorMsg }}
    </div>

    <div v-if="successMsg" class="alert alert-success">
      {{ successMsg }}
    </div>

    <div v-if="isLoading" class="loading-state">
      Cargando configuración...
    </div>

    <div v-else class="config-card glass">
      <!-- 1. Sección: Sistema de Puntos -->
      <section v-show="activeSection === 'all' || activeSection === 'puntos'" id="puntos" class="setting-section">
        <div class="table-styled-header">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
          <h2>Sistema de Puntos y Recompensas</h2>
        </div>
        
        <div class="table-styled-body">
          <div class="form-grid">
            <div class="form-group">
              <label>Lempiras requeridos para ganar 1 punto:</label>
              <input type="number" v-model="config.earnRate" class="form-control" />
              <small class="text-muted">Ejemplo: Si pones 100, una compra de L. 500 otorgará 5 puntos.</small>
            </div>

            <div class="form-group">
              <label>Valor de 1 punto en Lempiras (Descuento):</label>
              <input type="number" v-model="config.redemptionValue" class="form-control" />
              <small class="text-muted">Ejemplo: Si pones 1, entonces 50 puntos = L. 50 de descuento.</small>
            </div>
          </div>
        </div>
      </section>

      <hr v-show="activeSection === 'all'" class="divider" />

      <!-- 2. Sección: Moneda y Referencias -->
      <section v-show="activeSection === 'all' || activeSection === 'moneda'" id="moneda" class="setting-section">
        <div class="table-styled-header">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          <h2>Moneda y Tasa de Cambio</h2>
        </div>

        <div class="table-styled-body">
          <div class="form-group">
            <label>Tasa de Cambio (Lempiras por 1 USD):</label>
            <input type="number" step="0.01" v-model="config.exchangeRate" class="form-control" />
            <small class="text-muted">Ejemplo: Si pones 24.85, se usará este valor para mostrar los precios en Dólares en toda la tienda.</small>
          </div>
        </div>
      </section>

      <hr v-show="activeSection === 'all'" class="divider" />

      <!-- 3. Sección: Márgenes & Semiconductores -->
      <section v-show="activeSection === 'all' || activeSection === 'margenes'" id="margenes" class="setting-section">
        <div class="table-styled-header">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 7-7.5 7.5-3.5-3.5-7 7"/><path d="M16 7h6v6"/></svg>
          <h2>Márgenes & Semiconductores</h2>
        </div>

        <div class="table-styled-body">
          <div class="form-group">
            <label>Multiplicador de Margen de Ganancia:</label>
            <div class="input-with-addons">
              <input 
                type="number" 
                step="0.05" 
                min="1.00" 
                v-model.number="config.digikeyProfitMargin" 
                class="form-control" 
              />
              <span class="addon-badge">
                {{ Math.round(((config.digikeyProfitMargin || 2) - 1) * 100) }}% de Ganancia
              </span>
            </div>
            <small class="text-muted">
              Multiplicador sobre el costo base de catálogo (Ej: 2.00 = 100% de ganancia, 1.50 = 50%, 1.30 = 30%).
            </small>

            <div class="margin-preview-box">
              <div class="preview-title">💡 Ejemplo de Cálculo en Vivo:</div>
              <div class="preview-text">
                Un componente con costo base de <strong>$5.00 USD</strong> se ofrecerá a 
                <span class="highlight-price">${{ (5 * (config.digikeyProfitMargin || 2)).toFixed(2) }} USD</span> 
                (aprox. <strong>L. {{ (5 * (config.digikeyProfitMargin || 2) * (config.exchangeRate || 25)).toFixed(2) }} HNL</strong>).
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr v-show="activeSection === 'all'" class="divider" />

      <!-- 4. Sección: Impuestos y Facturación (SAR - Autoimpresor) -->
      <section v-show="activeSection === 'all' || activeSection === 'facturacion'" id="facturacion" class="setting-section sar-fiscal-section">
        <div class="table-styled-header">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
          <div>
            <h2>Impuestos y Facturación Fiscal (SAR)</h2>
            <p class="section-desc">Solicitud de Autorización de Impresión por Autoimpresor según el SAR de Honduras.</p>
          </div>
        </div>

        <div class="table-styled-body-container">
          <!-- 4.1 Datos de la Solicitud / CAI -->
          <div class="sar-subpanel">
            <div class="sar-subpanel-header">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h10"/><path d="M7 12h10"/><path d="M7 17h10"/></svg>
              <h3>Datos de la Solicitud y Autorización de Facturación (CAI)</h3>
            </div>

            <div class="sar-subpanel-content">
              <div class="form-grid">
                <div class="form-group full-width">
                  <label>CAI (Código de Autorización de Impresión):</label>
                  <input 
                    type="text" 
                    v-model="config.sar.cai" 
                    placeholder="Ej. 52BA20-7B982A-0A62E0-63BE03-090966-04" 
                    class="form-control font-mono font-bold"
                    @input="config.cai = config.sar.cai"
                  />
                  <small class="text-muted">El código CAI oficial emitido por el SAR.</small>
                </div>

                <div class="form-group">
                  <label>Fecha Límite de Emisión (Calendario):</label>
                  <input 
                    type="date" 
                    v-model="config.sar.fechaLimiteEmision" 
                    class="form-control date-input"
                  />
                  <small class="text-muted">Fecha máxima de validez autorizada por el SAR.</small>
                </div>

                <div class="form-group">
                  <label>Porcentaje de ISV (%):</label>
                  <input type="number" step="0.01" v-model="config.isvPercent" class="form-control" />
                  <small class="text-muted">Ejemplo: 15 para 15% (Impuesto Sobre Ventas regular en Honduras).</small>
                </div>

                <div class="form-group">
                  <label>Punto de Emisión:</label>
                  <input type="text" v-model="config.sar.puntoEmision" class="form-control" placeholder="001 - Auto impresor: SFC en Red Fijo" />
                  <small class="text-muted">Ej. 001 - Auto impresor: SFC en Red Fijo</small>
                </div>

                <div class="form-group">
                  <label>Documento Fiscal:</label>
                  <input type="text" v-model="config.sar.documentoFiscal" class="form-control" placeholder="01 - Factura" />
                  <small class="text-muted">Tipo de comprobante autorizado (01 - Factura).</small>
                </div>

                <div class="form-group">
                  <label>Cantidad Autorizada:</label>
                  <input type="number" v-model="config.sar.cantidadAutorizada" class="form-control" placeholder="100" />
                  <small class="text-muted">Número total de facturas aprobadas por el SAR.</small>
                </div>

                <div class="form-group">
                  <label>Siguiente Factura Correlativa:</label>
                  <input type="text" v-model="config.sar.siguienteFactura" class="form-control font-mono" placeholder="000-001-01-00002451" />
                  <small class="text-muted">Próximo correlativo a emitir en la tienda.</small>
                </div>

                <div class="form-group">
                  <label>Rango Autorizado Inicial:</label>
                  <input type="text" v-model="config.sar.rangoInicial" class="form-control font-mono" placeholder="000-001-01-00002451" />
                  <small class="text-muted">Rango inicial autorizado.</small>
                </div>

                <div class="form-group">
                  <label>Rango Autorizado Final:</label>
                  <input type="text" v-model="config.sar.rangoFinal" class="form-control font-mono" placeholder="000-001-01-00002550" />
                  <small class="text-muted">Rango final autorizado.</small>
                </div>
              </div>
            </div>
          </div>

          <!-- 4.2 Datos Generales de la Empresa (ArduinoHN) -->
          <div class="sar-subpanel mt-5">
            <div class="sar-subpanel-header">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M19 21v-4"/><path d="M19 7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v14"/><path d="M9 18h6"/><path d="M9 14h6"/><path d="M9 10h6"/></svg>
              <h3>Datos Generales de la Empresa (Contribuyente)</h3>
            </div>

            <div class="sar-subpanel-content">
              <div class="form-grid">
                <div class="form-group">
                  <label>RTN de la Empresa:</label>
                  <input type="text" v-model="config.company.rtn" class="form-control font-mono font-bold" placeholder="18041969022884" />
                  <small class="text-muted">Registro Tributario Nacional sin guiones.</small>
                </div>

                <div class="form-group">
                  <label>Razón o Denominación Social:</label>
                  <input type="text" v-model="config.company.razonSocial" class="form-control" placeholder="ArduinoHN S.R.L." />
                  <small class="text-muted">Razón social inscrita ante el SAR.</small>
                </div>

                <div class="form-group full-width">
                  <label>Nombre Comercial:</label>
                  <input type="text" v-model="config.company.nombreComercial" class="form-control" placeholder="ArduinoHN SRL" />
                  <small class="text-muted">Nombre del establecimiento comercial.</small>
                </div>

                <div class="form-group">
                  <label>Teléfono Fijo:</label>
                  <input type="text" v-model="config.company.telefonoFijo" class="form-control" placeholder="95205861" />
                  <small class="text-muted">Línea de contacto fija registrada.</small>
                </div>

                <div class="form-group">
                  <label>Teléfono Móvil:</label>
                  <input type="text" v-model="config.company.telefonoMovil" class="form-control" placeholder="95205861" />
                  <small class="text-muted">Línea móvil de contacto comercial.</small>
                </div>

                <div class="form-group full-width">
                  <label>Correo Electrónico Fiscal:</label>
                  <input type="email" v-model="config.company.email" class="form-control" placeholder="info@arduino.hn" />
                  <small class="text-muted">Email oficial para notificaciones tributarias y facturación.</small>
                </div>
              </div>
            </div>
          </div>

          <!-- 4.3 Domicilio Tributario -->
          <div class="sar-subpanel mt-5">
            <div class="sar-subpanel-header">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              <h3>Domicilio Tributario</h3>
            </div>

            <div class="sar-subpanel-content">
              <div class="form-grid">
                <div class="form-group">
                  <label>Departamento:</label>
                  <input type="text" v-model="config.company.departamento" class="form-control" placeholder="CORTÉS" />
                  <small class="text-muted">Departamento donde opera el domicilio fiscal.</small>
                </div>

                <div class="form-group">
                  <label>Municipio:</label>
                  <input type="text" v-model="config.company.municipio" class="form-control" placeholder="VILLANUEVA" />
                  <small class="text-muted">Municipio del domicilio fiscal.</small>
                </div>

                <div class="form-group">
                  <label>Barrio / Colonia / Aldea:</label>
                  <input type="text" v-model="config.company.colonia" class="form-control" placeholder="BUFALO" />
                  <small class="text-muted">Colonia o barrio fiscal.</small>
                </div>

                <div class="form-group">
                  <label>Calle / Avenida / Boulevard:</label>
                  <input type="text" v-model="config.company.calle" class="form-control" placeholder="PRINCIPAL" />
                  <small class="text-muted">Avenida, calle o boulevard.</small>
                </div>

                <div class="form-group">
                  <label>Sector / Zona / Etapa:</label>
                  <input type="text" v-model="config.company.zona" class="form-control" placeholder="Opcional" />
                  <small class="text-muted">Sector o zona (opcional).</small>
                </div>

                <div class="form-group">
                  <label>Bloque:</label>
                  <input type="text" v-model="config.company.bloque" class="form-control" placeholder="Opcional" />
                  <small class="text-muted">Bloque o número de edificio (opcional).</small>
                </div>

                <div class="form-group full-width">
                  <label>Referencia de Domicilio:</label>
                  <input type="text" v-model="config.company.referencia" class="form-control" placeholder="PARQUE INDUSTRIAL ZIP BUFALO" />
                  <small class="text-muted">Puntos de referencia para ubicación física del establecimiento.</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr v-show="activeSection === 'all'" class="divider" />

      <!-- 5. Sección: Sistema de Niveles -->
      <section v-show="activeSection === 'all' || activeSection === 'niveles'" id="niveles" class="setting-section">
        <div class="table-styled-header">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <h2>Sistema de Niveles</h2>
        </div>

        <div class="table-styled-body">
          <div class="form-group toggle-group">
            <label class="toggle-switch">
              <input type="checkbox" v-model="config.enableTiers">
              <span class="slider round"></span>
            </label>
            <span class="font-medium">Habilitar beneficios por niveles (Bronce, Plata, Oro)</span>
          </div>

          <div v-if="config.enableTiers" class="tiers-config">
            <div class="tier-box">
              <h3>Nivel Plata</h3>
              <div class="form-group">
                <label>Gasto histórico requerido (L.):</label>
                <input type="number" v-model="config.tiers.silverThreshold" class="form-control" />
                <small class="text-muted">Consumo mínimo acumulado para acceder.</small>
              </div>
              <div class="form-group">
                <label>Descuento automático (%):</label>
                <input type="number" v-model="config.tiers.silverDiscount" class="form-control" />
                <small class="text-muted">Porcentaje de descuento otorgado en compras.</small>
              </div>
            </div>
            <div class="tier-box">
              <h3>Nivel Oro</h3>
              <div class="form-group">
                <label>Gasto histórico requerido (L.):</label>
                <input type="number" v-model="config.tiers.goldThreshold" class="form-control" />
                <small class="text-muted">Consumo mínimo acumulado para acceder.</small>
              </div>
              <div class="form-group">
                <label>Descuento automático (%):</label>
                <input type="number" v-model="config.tiers.goldDiscount" class="form-control" />
                <small class="text-muted">Porcentaje de descuento otorgado en compras.</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="actions-row">
        <button class="btn btn-primary w-full save-btn" @click="saveConfig" :disabled="isSaving">
          {{ isSaving ? 'Guardando...' : 'Guardar Configuración' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '~/composables/useAuth'

const { isAdmin, fetchUser } = useAuth()
const router = useRouter()
const route = useRoute()

const activeSection = ref<string>('all')

const sectionTitles: Record<string, string> = {
  puntos: 'Sistema de Puntos',
  moneda: 'Moneda y Tasa de Cambio',
  margenes: 'Márgenes & Semiconductores',
  facturacion: 'Impuestos y Facturación Fiscal (SAR)',
  niveles: 'Sistema de Niveles',
  all: 'Todos los Ajustes'
}

const activeSectionTitle = computed(() => {
  return sectionTitles[activeSection.value] || 'Ajustes'
})

const updateActiveSectionFromRoute = () => {
  const sec = (route.query.section as string) || 'all'
  activeSection.value = ['all', 'puntos', 'moneda', 'margenes', 'facturacion', 'niveles'].includes(sec) ? sec : 'all'
}

watch(() => route.query.section, () => {
  updateActiveSectionFromRoute()
}, { immediate: true })

const setSection = (sec: string) => {
  activeSection.value = sec
  router.push({ path: '/admin/loyalty', query: { section: sec } })
}

const config = ref({
  earnRate: 100,
  redemptionValue: 1,
  exchangeRate: 25,
  isvPercent: 15,
  cai: '52BA20-7B982A-0A62E0-63BE03-090966-04',
  digikeyProfitMargin: 2.0,
  enableTiers: false,
  tiers: {
    silverThreshold: 5000,
    silverDiscount: 5,
    goldThreshold: 20000,
    goldDiscount: 10
  },
  company: {
    rtn: '18041969022884',
    razonSocial: 'ArduinoHN S.R.L.',
    nombreComercial: 'ArduinoHN SRL',
    colonia: 'BUFALO',
    calle: 'PRINCIPAL',
    zona: '',
    bloque: '',
    referencia: 'PARQUE INDUSTRIAL ZIP BUFALO',
    departamento: 'CORTÉS',
    municipio: 'VILLANUEVA',
    telefonoFijo: '95205861',
    telefonoMovil: '95205861',
    email: 'info@arduino.hn'
  },
  sar: {
    cai: '52BA20-7B982A-0A62E0-63BE03-090966-04',
    fechaLimiteEmision: '2027-05-26',
    puntoEmision: '001 - Auto impresor: SFC en Red Fijo',
    documentoFiscal: '01 - Factura',
    cantidadAutorizada: 100,
    rangoInicial: '000-001-01-00002451',
    rangoFinal: '000-001-01-00002550',
    siguienteFactura: '000-001-01-00002451'
  }
})

const isLoading = ref(true)
const isSaving = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

onMounted(async () => {
  await fetchUser()
  if (!isAdmin.value) {
    router.push('/')
    return
  }
  await fetchConfig()
  updateActiveSectionFromRoute()
})

const fetchConfig = async () => {
  isLoading.value = true
  try {
    const data = await $fetch<any>('/api/admin/loyalty')
    if (data) {
      config.value = {
        ...config.value,
        ...data,
        company: {
          ...config.value.company,
          ...(data.company || {})
        },
        sar: {
          ...config.value.sar,
          ...(data.sar || {}),
          cai: data.sar?.cai || data.cai || config.value.sar.cai
        }
      }
    }
  } catch (e) {
    errorMsg.value = 'Error al cargar configuración.'
  } finally {
    isLoading.value = false
  }
}

const saveConfig = async () => {
  isSaving.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    if (config.value.sar?.cai) {
      config.value.cai = config.value.sar.cai
    }
    await $fetch('/api/admin/loyalty', {
      method: 'POST',
      body: config.value
    })
    successMsg.value = 'Configuración e información fiscal del SAR guardadas correctamente.'
    setTimeout(() => { successMsg.value = '' }, 3500)
  } catch (e) {
    errorMsg.value = 'Error al guardar configuración.'
  } finally {
    isSaving.value = false
  }
}

useHead({
  title: computed(() => `${activeSectionTitle.value} - ArduinoHN Admin`)
})
</script>

<style scoped>
.admin-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 30px 20px 60px;
  min-height: calc(100vh - 200px);
}

.admin-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 1rem;
}

.admin-breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-muted, #64748b);
  margin-bottom: 0.35rem;
}

.admin-breadcrumb a {
  color: var(--color-primary, #00979c);
  text-decoration: none;
}

.admin-breadcrumb a:hover {
  text-decoration: underline;
}

.admin-breadcrumb .separator {
  opacity: 0.5;
}

.admin-breadcrumb .current {
  font-weight: 600;
  color: var(--text-main);
}

.admin-title {
  color: var(--text-main);
  font-size: 1.85rem;
  font-weight: 700;
  margin: 0;
}

/* Tabs Navigation */
.settings-tabs-nav {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 12px;
  margin-bottom: 20px;
  scrollbar-width: thin;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--bg-card);
  border: 1px solid var(--glass-border);
  border-radius: 9999px;
  font-family: var(--font-family);
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--text-muted, #64748b);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: rgba(0, 151, 156, 0.05);
}

.tab-btn.active {
  background: var(--color-primary);
  color: #ffffff;
  border-color: var(--color-primary);
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 151, 156, 0.25);
}

.config-card {
  padding: 24px;
  border-radius: 16px;
  background-color: var(--bg-card);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
}

.setting-section {
  animation: fadeIn 0.25s ease-in-out;
  border: 1px solid rgba(0, 151, 156, 0.35);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
  background: var(--bg-card);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Table-styled Headers with Website Standard Teal Background */
.table-styled-header {
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, var(--color-primary, #00979C) 0%, #007e82 100%);
  color: #ffffff;
  padding: 12px 18px;
}

.table-styled-header h2 {
  margin: 0;
  font-size: 1.15rem;
  color: #ffffff;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.table-styled-header .section-desc {
  margin: 2px 0 0 0;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.78rem;
  font-weight: 400;
}

.table-styled-body {
  padding: 20px;
}

.table-styled-body-container {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* SAR Fiscal Panels with Table appearance */
.sar-subpanel {
  background: rgba(0, 151, 156, 0.02);
  border: 1px solid rgba(0, 151, 156, 0.25);
  border-radius: 10px;
  overflow: hidden;
}

.sar-subpanel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(0, 151, 156, 0.12);
  border-bottom: 1px solid rgba(0, 151, 156, 0.25);
  color: var(--color-primary, #00979c);
}

.sar-subpanel-header h3 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-main);
}

.sar-subpanel-content {
  padding: 18px 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 18px;
}

.full-width {
  grid-column: 1 / -1;
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.form-group {
  margin-bottom: 0.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.35rem;
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--text-main);
}

/* Textbox with Gray Background and Crisp Border */
.form-control {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid #cbd5e1;
  background-color: #f1f5f9; /* Fondo gris claro */
  color: #1e293b;
  border-radius: 6px;
  font-size: 0.92rem;
  font-family: inherit;
  transition: all 0.2s ease;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.04);
}

:global([data-theme="dark"]) .form-control {
  background-color: #242b35; /* Fondo gris oscuro en modo dark */
  border-color: rgba(255, 255, 255, 0.15);
  color: #f8fafc;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
}

.form-control:focus {
  outline: none;
  background-color: #ffffff;
  border-color: var(--color-primary, #00979C);
  box-shadow: 0 0 0 3px rgba(0, 151, 156, 0.2);
}

:global([data-theme="dark"]) .form-control:focus {
  background-color: #1e242c;
  border-color: #38bdf8;
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.2);
}

.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.font-bold {
  font-weight: 700;
}

.font-medium {
  font-weight: 500;
  color: var(--text-main);
}

.date-input {
  cursor: pointer;
}

/* Helper Text Font Size: 8pt (Ilustrativo) */
.text-muted {
  color: var(--text-muted, #64748b);
  display: block;
  margin-top: 3px;
  font-size: 8pt; /* Tamaño 8pt solicitado */
  line-height: 1.25;
}

.divider {
  margin: 24px 0;
  border: none;
  border-top: 1px solid var(--glass-border);
}

.toggle-group {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 1.25rem;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: .3s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .3s;
}

input:checked + .slider {
  background-color: var(--color-primary);
}

input:checked + .slider:before {
  transform: translateX(24px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

.tiers-config {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 16px;
}

@media (max-width: 640px) {
  .tiers-config {
    grid-template-columns: 1fr;
  }
}

.tier-box {
  padding: 16px;
  border: 1px solid rgba(0, 151, 156, 0.25);
  border-radius: 8px;
  background: rgba(0, 151, 156, 0.02);
}

.tier-box h3 {
  margin-bottom: 12px;
  color: var(--color-primary, #00979c);
  font-size: 1rem;
  font-weight: 700;
}

.actions-row {
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--glass-border);
}

.w-full {
  width: 100%;
}

.mt-5 {
  margin-top: 1.25rem;
}

.save-btn {
  padding: 12px;
  font-size: 1rem;
  font-weight: 600;
}

.alert {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 18px;
  font-size: 0.88rem;
}

.alert-error {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
}

.alert-success {
  background-color: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}

.input-with-addons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.addon-badge {
  background: rgba(0, 168, 150, 0.15);
  color: var(--color-primary, #00979c);
  border: 1px solid rgba(0, 168, 150, 0.35);
  font-weight: 700;
  padding: 9px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  white-space: nowrap;
}

.margin-preview-box {
  background: rgba(15, 23, 42, 0.04);
  border: 1px dashed rgba(0, 151, 156, 0.35);
  border-radius: 6px;
  padding: 10px 14px;
  margin-top: 10px;
}

:global([data-theme="dark"]) .margin-preview-box {
  background: rgba(15, 23, 42, 0.6);
  border: 1px dashed rgba(56, 189, 248, 0.35);
}

.preview-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-primary, #00979c);
  margin-bottom: 3px;
}

.preview-text {
  font-size: 0.85rem;
  color: var(--text-main);
}

.highlight-price {
  color: #10b981;
  font-weight: 700;
}
</style>

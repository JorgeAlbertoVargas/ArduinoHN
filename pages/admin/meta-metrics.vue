<template>
  <div class="admin-meta-container">
    <!-- Breadcrumb & Top Header -->
    <div class="admin-header-row">
      <div>
        <div class="admin-breadcrumb">
          <NuxtLink to="/admin/users">Administración</NuxtLink>
          <span class="separator">/</span>
          <span>Métricas</span>
          <span class="separator">/</span>
          <span class="current">Cascada de Rentabilidad & Árbol de Métricas (Meta Ads)</span>
        </div>
        <div class="title-with-badge">
          <h1 class="meta-main-title">Árbol De Métricas — Meta Ads</h1>
          <span class="badge-arduino">ArduinoHN Growth Suite</span>
        </div>
      </div>

      <div class="header-actions">
        <!-- Preset Templates Selector -->
        <div class="preset-dropdown-container">
          <label class="preset-label">📦 Kits / Plantillas:</label>
          <select class="form-select preset-select" @change="onSelectPreset($event)">
            <option value="" disabled selected>Seleccionar plantilla...</option>
            <option v-for="(tpl, idx) in presetTemplates" :key="idx" :value="idx">
              {{ tpl.name }} (AOV: ${{ tpl.precioMedio }})
            </option>
          </select>
        </div>

        <button class="btn btn-secondary" @click="handleNewAnalysis">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          <span>Nuevo</span>
        </button>

        <button v-if="activeScenario.id" class="btn btn-outline" @click="handleSaveCopy" :disabled="isSaving" title="Guardar como nueva copia">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          <span>Copiar</span>
        </button>

        <button class="btn btn-primary" @click="handleSaveScenario" :disabled="isSaving">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          <span>{{ isSaving ? 'Guardando...' : (activeScenario.id ? 'Actualizar' : 'Guardar Análisis') }}</span>
        </button>
      </div>
    </div>

    <!-- Alert Notifications -->
    <transition name="fade">
      <div v-if="successMessage" class="alert alert-success">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        <span>{{ successMessage }}</span>
      </div>
    </transition>
    <transition name="fade">
      <div v-if="errorMessage" class="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span>{{ errorMessage }}</span>
      </div>
    </transition>

    <!-- Navigation Tabs Bar -->
    <div class="meta-tabs-bar glass-card">
      <button 
        class="tab-btn" 
        :class="{ active: currentTab === 'tree' }"
        @click="currentTab = 'tree'"
      >
        <span class="tab-icon">📁</span>
        <span>Árbol De Métricas</span>
      </button>

      <button 
        class="tab-btn" 
        :class="{ active: currentTab === 'diagnostico' }"
        @click="currentTab = 'diagnostico'"
      >
        <span class="tab-icon">🎯</span>
        <span>Matriz de Diagnóstico & Regla 3 Días</span>
        <span v-if="diagnosis.criticalCount > 0" class="tab-badge critical">{{ diagnosis.criticalCount }}</span>
        <span v-else-if="diagnosis.alertCount > 0" class="tab-badge alert">{{ diagnosis.alertCount }}</span>
      </button>

      <button 
        class="tab-btn" 
        :class="{ active: currentTab === 'comparador' }"
        @click="currentTab = 'comparador'"
      >
        <span class="tab-icon">📊</span>
        <span>Comparador AOV vs CPA</span>
      </button>

      <button 
        class="tab-btn" 
        :class="{ active: currentTab === 'scenarios' }"
        @click="currentTab = 'scenarios'"
      >
        <span class="tab-icon">📋</span>
        <span>Historial de Auditorías</span>
        <span class="tab-badge info">{{ scenarios.length }}</span>
      </button>
    </div>

    <!-- TAB 1: 2 EQUAL-SIZED COLUMNS (50% 3D FOLDER TREE ON LEFT, 50% SIMULATION ON RIGHT) -->
    <div v-show="currentTab === 'tree'" class="tab-content fade-in">
      
      <!-- Top Quick Meta Bar -->
      <div class="campaign-meta-strip glass-card">
        <div class="strip-field name-field">
          <label>Campaña / Análisis:</label>
          <input type="text" v-model="activeScenario.name" list="product-list" placeholder="Ej. Kit IoT Starter - Audiencia Fría" class="form-control-clean font-bold" />
          <datalist id="product-list">
            <option v-for="p in allProducts" :key="p.id" :value="`Simulación: ${p.title}`"></option>
          </datalist>
        </div>
        <div class="strip-field">
          <label>Tipo:</label>
          <select v-model="activeScenario.campaignType" class="form-select-clean">
            <option value="cold_traffic">Audiencia Fría</option>
            <option value="retargeting">Retargeting 75%</option>
            <option value="advantage_plus">Advantage+ / Broad</option>
            <option value="lead_messages">WhatsApp Leads</option>
            <option value="bundle_launch">Lanzamiento Kit</option>
          </select>
        </div>
        <div class="strip-field">
          <label>Público:</label>
          <input type="text" v-model="activeScenario.targetAudience" placeholder="Ingenieros, Makers, Estudiantes" class="form-control-clean" />
        </div>
        <div class="strip-field date-field">
          <label>Fecha:</label>
          <input type="date" v-model="activeScenario.date" class="form-control-clean" />
        </div>
      </div>

      <!-- MAIN 2 EQUAL-SIZED COLUMNS (1fr 1fr) -->
      <div class="tree-workspace-grid-equal">
        
        <!-- LEFT COLUMN: 3D FOLDER HIERARCHY DIAGRAM (50% WIDTH) -->
        <div class="tree-diagram-column glass-card">
          <div class="tree-header-row">
            <div class="tree-legend-box">
              <span class="legend-title">Jerarquía de Cascada:</span>
              <span class="legend-step step-1">1. ROAS</span>
              <span class="legend-arrow">→</span>
              <span class="legend-step step-2">2. AOV / CPA</span>
              <span class="legend-arrow">→</span>
              <span class="legend-step step-3">3. Subasta & Tienda</span>
            </div>
            
            <!-- Health Status Badge -->
            <div class="tree-status-pill" :class="diagnosis.overallStatus">
              <span class="status-dot"></span>
              <span>{{ diagnosis.overallStatus === 'saludable' ? 'Rentabilidad Saludable' : (diagnosis.overallStatus === 'alerta' ? 'Alerta de Optimización' : 'Estado Crítico') }}</span>
            </div>
          </div>

          <!-- 3D FOLDER TREE VIEWPORT WITH PIPE CONNECTORS (2/3 SPACIOUS WIDTH & DOUBLE-CLICK TO EDIT) -->
          <div class="folder-tree-viewport">
            <!-- SVG 3D Tubular Pipes (840 x 680 Resolution with Wide Separations) -->
            <svg class="folder-pipes-svg" viewBox="0 0 840 680" preserveAspectRatio="xMidYMid meet">
              <defs>
                <!-- 3D Glossy Blue Pipe Gradient -->
                <linearGradient id="pipe3DGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#38bdf8" />
                  <stop offset="35%" stop-color="#0284c7" />
                  <stop offset="85%" stop-color="#0369a1" />
                  <stop offset="100%" stop-color="#075985" />
                </linearGradient>

                <!-- 3D Drop Shadow for Tubular Pipes -->
                <filter id="pipe3DShadow" x="-15%" y="-15%" width="130%" height="130%">
                  <feDropShadow dx="0" dy="5" stdDeviation="3.5" flood-color="#0284c7" flood-opacity="0.22"/>
                </filter>
              </defs>

              <!-- Main Pipe Trunk: Level 1 ROAS (420, 114) -> Level 2 AOV (220, 258) and CPA (620, 258) -->
              <path d="M 420 156 L 420 193 Q 420 205 408 205 L 232 205 Q 220 205 220 217 L 220 228" class="pipe-tube" />
              <path d="M 420 193 Q 420 205 432 205 L 608 205 Q 620 205 620 217 L 620 228" class="pipe-tube" />
              <circle cx="420" cy="205" r="7" class="pipe-joint-node" />

              <!-- Left Branch: Level 2 AOV (220, 258) -> Level 3 Precio (115, 415) and Cantidad (325, 415) -->
              <path d="M 220 300 L 220 352 Q 220 364 208 364 L 127 364 Q 115 364 115 376 L 115 385" class="pipe-tube" />
              <path d="M 220 352 Q 220 364 232 364 L 313 364 Q 325 364 325 376 L 325 385" class="pipe-tube" />
              <circle cx="220" cy="364" r="6" class="pipe-joint-node" />

              <!-- Right Branch: Level 2 CPA (620, 258) -> Level 3 CPC (515, 415) and %CVR (725, 415) -->
              <path d="M 620 300 L 620 352 Q 620 364 608 364 L 527 364 Q 515 364 515 376 L 515 385" class="pipe-tube" />
              <path d="M 620 352 Q 620 364 632 364 L 713 364 Q 725 364 725 376 L 725 385" class="pipe-tube" />
              <circle cx="620" cy="364" r="6" class="pipe-joint-node" />

              <!-- Sub-Branch: Level 3 CPC (515, 415) -> Level 4 CPM (405, 590) and %CTR (625, 590) [WIDE SEPARATION] -->
              <path d="M 515 456 L 515 514 Q 515 526 503 526 L 417 526 Q 405 526 405 538 L 405 558" class="pipe-tube pipe-tube-sub" />
              <path d="M 515 514 Q 515 526 527 526 L 613 526 Q 625 526 625 538 L 625 558" class="pipe-tube pipe-tube-sub" />
              <circle cx="515" cy="526" r="5.5" class="pipe-joint-node" />
            </svg>

            <!-- 3D FOLDER NODES LAYER (ARDUINOHN TEAL THEME & EXPANDED BREATHING ROOM) -->
            <div class="folder-nodes-layer">
              
              <!-- ROOT FOLDER NODE: ROAS (Level 1) -->
              <div 
                class="f3d-folder pos-f-roas" 
                :class="{ 'is-selected': selectedNode === 'roas', 'is-editing': editingNode === 'roas' }"
                @click="selectedNode = 'roas'"
                @dblclick.stop="handleNodeDblClick('roas')"
                title="Doble clic para editar ROAS objetivo"
              >
                <div class="f3d-back theme-arduino">
                  <div class="f3d-tab tab-arduino-orange">
                    <span class="f3d-tab-icon">🏆</span>
                    <span class="f3d-tab-text">ROAS Vértice</span>
                  </div>
                </div>
                
                <div class="f3d-sheets">
                  <div class="f3d-sheet-back"></div>
                  <div class="f3d-sheet-main">
                    <span class="f3d-sheet-title">Meta Ads Cascade</span>
                    <span class="f3d-sheet-formula">AOV ÷ CPA</span>
                  </div>
                </div>

                <div class="f3d-front theme-arduino">
                  <div class="f3d-front-glow"></div>
                  <div v-if="editingNode === 'roas'" class="f3d-inline-edit" @click.stop>
                    <input 
                      ref="editInputRef"
                      type="number"
                      step="0.1"
                      v-model.number="editValue"
                      @keydown.enter.prevent="commitNodeEdit"
                      @keydown.esc.prevent="cancelNodeEdit"
                      @blur="commitNodeEdit"
                      class="f3d-inline-input"
                    />
                    <span class="f3d-edit-sym">x</span>
                    <button type="button" class="f3d-inline-ok" @mousedown.prevent="commitNodeEdit" title="Guardar">✓</button>
                  </div>
                  <div v-else class="f3d-front-content">
                    <span class="f3d-metric-label">ROAS</span>
                    <span class="f3d-metric-val">{{ computedRoas.toFixed(2) }}x</span>
                    <span class="f3d-dblclick-hint">✏️ Doble clic</span>
                  </div>
                </div>
              </div>

              <!-- LEVEL 1 OPERATOR PILL -->
              <div class="f3d-op-badge pos-f-op-level1" title="División: AOV ÷ CPA">÷</div>

              <!-- LEVEL 2 FOLDER: AOV (Ticket Promedio) -->
              <div 
                class="f3d-folder pos-f-aov" 
                :class="{ 'is-selected': selectedNode === 'aov', 'is-editing': editingNode === 'aov' }"
                @click="selectedNode = 'aov'"
                @dblclick.stop="handleNodeDblClick('aov')"
                title="Doble clic para editar AOV objetivo"
              >
                <div class="f3d-back theme-arduino">
                  <div class="f3d-tab tab-arduino-teal">
                    <span class="f3d-tab-icon">📦</span>
                    <span class="f3d-tab-text">Valor Pedido</span>
                  </div>
                </div>
                
                <div class="f3d-sheets">
                  <div class="f3d-sheet-back"></div>
                  <div class="f3d-sheet-main">
                    <span class="f3d-sheet-title">Ticket Promedio</span>
                    <span class="f3d-sheet-formula">Precio × Cant.</span>
                  </div>
                </div>

                <div class="f3d-front theme-arduino">
                  <div class="f3d-front-glow"></div>
                  <div v-if="editingNode === 'aov'" class="f3d-inline-edit" @click.stop>
                    <span class="f3d-edit-sym">$</span>
                    <input 
                      ref="editInputRef"
                      type="number"
                      step="1"
                      v-model.number="editValue"
                      @keydown.enter.prevent="commitNodeEdit"
                      @keydown.esc.prevent="cancelNodeEdit"
                      @blur="commitNodeEdit"
                      class="f3d-inline-input"
                    />
                    <button type="button" class="f3d-inline-ok" @mousedown.prevent="commitNodeEdit" title="Guardar">✓</button>
                  </div>
                  <div v-else class="f3d-front-content">
                    <span class="f3d-metric-label">AOV</span>
                    <span class="f3d-metric-val">${{ computedAov.toFixed(1) }}</span>
                    <span class="f3d-dblclick-hint">✏️ Doble clic</span>
                  </div>
                </div>
              </div>

              <!-- LEVEL 2 FOLDER: CPA (Costo por Adquisición) -->
              <div 
                class="f3d-folder pos-f-cpa" 
                :class="{ 'is-selected': selectedNode === 'cpa', 'is-editing': editingNode === 'cpa' }"
                @click="selectedNode = 'cpa'"
                @dblclick.stop="handleNodeDblClick('cpa')"
                title="Doble clic para editar CPA objetivo"
              >
                <div class="f3d-back theme-arduino">
                  <div class="f3d-tab tab-arduino-dark">
                    <span class="f3d-tab-icon">🎯</span>
                    <span class="f3d-tab-text">Costo Venta</span>
                  </div>
                </div>
                
                <div class="f3d-sheets">
                  <div class="f3d-sheet-back"></div>
                  <div class="f3d-sheet-main">
                    <span class="f3d-sheet-title">Costo Adquisición</span>
                    <span class="f3d-sheet-formula">CPC ÷ %CVR</span>
                  </div>
                </div>

                <div class="f3d-front theme-arduino">
                  <div class="f3d-front-glow"></div>
                  <div v-if="editingNode === 'cpa'" class="f3d-inline-edit" @click.stop>
                    <span class="f3d-edit-sym">$</span>
                    <input 
                      ref="editInputRef"
                      type="number"
                      step="0.1"
                      v-model.number="editValue"
                      @keydown.enter.prevent="commitNodeEdit"
                      @keydown.esc.prevent="cancelNodeEdit"
                      @blur="commitNodeEdit"
                      class="f3d-inline-input"
                    />
                    <button type="button" class="f3d-inline-ok" @mousedown.prevent="commitNodeEdit" title="Guardar">✓</button>
                  </div>
                  <div v-else class="f3d-front-content">
                    <span class="f3d-metric-label">CPA</span>
                    <span class="f3d-metric-val">${{ computedCpa.toFixed(2) }}</span>
                    <span class="f3d-dblclick-hint">✏️ Doble clic</span>
                  </div>
                </div>
              </div>

              <!-- LEVEL 3 OPERATORS -->
              <div class="f3d-op-badge pos-f-op-aov" title="Multiplicación: Precio × Cantidad">×</div>
              <div class="f3d-op-badge pos-f-op-cpa" title="División: CPC ÷ %CVR">÷</div>

              <!-- LEVEL 3 FOLDER: PRECIO MEDIO -->
              <div 
                class="f3d-folder f3d-compact pos-f-precio" 
                :class="{ 'is-selected': selectedNode === 'precio', 'is-editing': editingNode === 'precio' }"
                @click="selectedNode = 'precio'"
                @dblclick.stop="handleNodeDblClick('precio')"
                title="Doble clic para editar Precio"
              >
                <div class="f3d-back theme-arduino">
                  <div class="f3d-tab tab-arduino-teal">
                    <span class="f3d-tab-text">Unitario</span>
                  </div>
                </div>
                <div class="f3d-sheets">
                  <div class="f3d-sheet-main">
                    <span class="f3d-sheet-title">Precio Kit</span>
                  </div>
                </div>
                <div class="f3d-front theme-arduino">
                  <div class="f3d-front-glow"></div>
                  <div v-if="editingNode === 'precio'" class="f3d-inline-edit" @click.stop>
                    <span class="f3d-edit-sym">$</span>
                    <input 
                      ref="editInputRef"
                      type="number"
                      step="1"
                      v-model.number="editValue"
                      @keydown.enter.prevent="commitNodeEdit"
                      @keydown.esc.prevent="cancelNodeEdit"
                      @blur="commitNodeEdit"
                      class="f3d-inline-input"
                    />
                    <button type="button" class="f3d-inline-ok" @mousedown.prevent="commitNodeEdit" title="Guardar">✓</button>
                  </div>
                  <div v-else class="f3d-front-content">
                    <span class="f3d-metric-label">Precio</span>
                    <span class="f3d-metric-val">${{ activeScenario.precioMedio }}</span>
                    <span class="f3d-dblclick-hint">✏️ Doble clic</span>
                  </div>
                </div>
              </div>

              <!-- LEVEL 3 FOLDER: CANTIDAD MEDIA -->
              <div 
                class="f3d-folder f3d-compact pos-f-cant" 
                :class="{ 'is-selected': selectedNode === 'cant', 'is-editing': editingNode === 'cant' }"
                @click="selectedNode = 'cant'"
                @dblclick.stop="handleNodeDblClick('cant')"
                title="Doble clic para editar Cantidad Media"
              >
                <div class="f3d-back theme-arduino">
                  <div class="f3d-tab tab-arduino-teal">
                    <span class="f3d-tab-text">Uds/Orden</span>
                  </div>
                </div>
                <div class="f3d-sheets">
                  <div class="f3d-sheet-main">
                    <span class="f3d-sheet-title">Unidades</span>
                  </div>
                </div>
                <div class="f3d-front theme-arduino">
                  <div class="f3d-front-glow"></div>
                  <div v-if="editingNode === 'cant'" class="f3d-inline-edit" @click.stop>
                    <input 
                      ref="editInputRef"
                      type="number"
                      step="0.1"
                      v-model.number="editValue"
                      @keydown.enter.prevent="commitNodeEdit"
                      @keydown.esc.prevent="cancelNodeEdit"
                      @blur="commitNodeEdit"
                      class="f3d-inline-input"
                    />
                    <button type="button" class="f3d-inline-ok" @mousedown.prevent="commitNodeEdit" title="Guardar">✓</button>
                  </div>
                  <div v-else class="f3d-front-content">
                    <span class="f3d-metric-label">Cant.</span>
                    <span class="f3d-metric-val">{{ activeScenario.cantidadMedia }}</span>
                    <span class="f3d-dblclick-hint">✏️ Doble clic</span>
                  </div>
                </div>
              </div>

              <!-- LEVEL 3 FOLDER: CPC (Costo Clic) -->
              <div 
                class="f3d-folder f3d-compact pos-f-cpc" 
                :class="{ 'is-selected': selectedNode === 'cpc', 'is-editing': editingNode === 'cpc' }"
                @click="selectedNode = 'cpc'"
                @dblclick.stop="handleNodeDblClick('cpc')"
                title="Doble clic para editar CPC objetivo"
              >
                <div class="f3d-back theme-arduino">
                  <div class="f3d-tab tab-arduino-orange">
                    <span class="f3d-tab-text">Por Clic</span>
                  </div>
                </div>
                <div class="f3d-sheets">
                  <div class="f3d-sheet-main">
                    <span class="f3d-sheet-title">Tráfico</span>
                  </div>
                </div>
                <div class="f3d-front theme-arduino">
                  <div class="f3d-front-glow"></div>
                  <div v-if="editingNode === 'cpc'" class="f3d-inline-edit" @click.stop>
                    <span class="f3d-edit-sym">$</span>
                    <input 
                      ref="editInputRef"
                      type="number"
                      step="0.01"
                      v-model.number="editValue"
                      @keydown.enter.prevent="commitNodeEdit"
                      @keydown.esc.prevent="cancelNodeEdit"
                      @blur="commitNodeEdit"
                      class="f3d-inline-input"
                    />
                    <button type="button" class="f3d-inline-ok" @mousedown.prevent="commitNodeEdit" title="Guardar">✓</button>
                  </div>
                  <div v-else class="f3d-front-content">
                    <span class="f3d-metric-label">CPC</span>
                    <span class="f3d-metric-val">${{ computedCpc.toFixed(3) }}</span>
                    <span class="f3d-dblclick-hint">✏️ Doble clic</span>
                  </div>
                </div>
              </div>

              <!-- LEVEL 3 FOLDER: %CVR (Conversión Landing) -->
              <div 
                class="f3d-folder f3d-compact pos-f-cvr" 
                :class="{ 'is-selected': selectedNode === 'cvr', 'is-editing': editingNode === 'cvr' }"
                @click="selectedNode = 'cvr'"
                @dblclick.stop="handleNodeDblClick('cvr')"
                title="Doble clic para editar %CVR"
              >
                <div class="f3d-back theme-arduino">
                  <div class="f3d-tab tab-arduino-dark">
                    <span class="f3d-tab-text">Tienda</span>
                  </div>
                </div>
                <div class="f3d-sheets">
                  <div class="f3d-sheet-main">
                    <span class="f3d-sheet-title">Conversión</span>
                  </div>
                </div>
                <div class="f3d-front theme-arduino">
                  <div class="f3d-front-glow"></div>
                  <div v-if="editingNode === 'cvr'" class="f3d-inline-edit" @click.stop>
                    <input 
                      ref="editInputRef"
                      type="number"
                      step="0.1"
                      v-model.number="editValue"
                      @keydown.enter.prevent="commitNodeEdit"
                      @keydown.esc.prevent="cancelNodeEdit"
                      @blur="commitNodeEdit"
                      class="f3d-inline-input"
                    />
                    <span class="f3d-edit-sym">%</span>
                    <button type="button" class="f3d-inline-ok" @mousedown.prevent="commitNodeEdit" title="Guardar">✓</button>
                  </div>
                  <div v-else class="f3d-front-content">
                    <span class="f3d-metric-label">%CVR</span>
                    <span class="f3d-metric-val">{{ activeScenario.cvr }}%</span>
                    <span class="f3d-dblclick-hint">✏️ Doble clic</span>
                  </div>
                </div>
              </div>

              <!-- LEVEL 4 OPERATOR -->
              <div class="f3d-op-badge pos-f-op-cpc" title="División: CPM ÷ %CTR">÷</div>

              <!-- LEVEL 4 FOLDER: CPM (Subasta Meta) -->
              <div 
                class="f3d-folder f3d-mini pos-f-cpm" 
                :class="{ 'is-selected': selectedNode === 'cpm', 'is-editing': editingNode === 'cpm' }"
                @click="selectedNode = 'cpm'"
                @dblclick.stop="handleNodeDblClick('cpm')"
                title="Doble clic para editar CPM"
              >
                <div class="f3d-back theme-arduino">
                  <div class="f3d-tab tab-arduino-dark">
                    <span class="f3d-tab-text">Subasta</span>
                  </div>
                </div>
                <div class="f3d-sheets">
                  <div class="f3d-sheet-main">
                    <span class="f3d-sheet-title">Meta Ads</span>
                  </div>
                </div>
                <div class="f3d-front theme-arduino">
                  <div class="f3d-front-glow"></div>
                  <div v-if="editingNode === 'cpm'" class="f3d-inline-edit" @click.stop>
                    <span class="f3d-edit-sym">$</span>
                    <input 
                      ref="editInputRef"
                      type="number"
                      step="0.1"
                      v-model.number="editValue"
                      @keydown.enter.prevent="commitNodeEdit"
                      @keydown.esc.prevent="cancelNodeEdit"
                      @blur="commitNodeEdit"
                      class="f3d-inline-input"
                    />
                    <button type="button" class="f3d-inline-ok" @mousedown.prevent="commitNodeEdit" title="Guardar">✓</button>
                  </div>
                  <div v-else class="f3d-front-content">
                    <span class="f3d-metric-label">CPM</span>
                    <span class="f3d-metric-val">${{ Number(activeScenario.cpm).toFixed(2) }}</span>
                    <span class="f3d-dblclick-hint">✏️ Doble clic</span>
                  </div>
                </div>
              </div>

              <!-- LEVEL 4 FOLDER: %CTR (Creativo Único) -->
              <div 
                class="f3d-folder f3d-mini pos-f-ctr" 
                :class="{ 'is-selected': selectedNode === 'ctr', 'is-editing': editingNode === 'ctr' }"
                @click="selectedNode = 'ctr'"
                @dblclick.stop="handleNodeDblClick('ctr')"
                title="Doble clic para editar %CTR"
              >
                <div class="f3d-back theme-arduino">
                  <div class="f3d-tab tab-arduino-teal">
                    <span class="f3d-tab-text">Creativo</span>
                  </div>
                </div>
                <div class="f3d-sheets">
                  <div class="f3d-sheet-main">
                    <span class="f3d-sheet-title">Hook %</span>
                  </div>
                </div>
                <div class="f3d-front theme-arduino">
                  <div class="f3d-front-glow"></div>
                  <div v-if="editingNode === 'ctr'" class="f3d-inline-edit" @click.stop>
                    <input 
                      ref="editInputRef"
                      type="number"
                      step="0.1"
                      v-model.number="editValue"
                      @keydown.enter.prevent="commitNodeEdit"
                      @keydown.esc.prevent="cancelNodeEdit"
                      @blur="commitNodeEdit"
                      class="f3d-inline-input"
                    />
                    <span class="f3d-edit-sym">%</span>
                    <button type="button" class="f3d-inline-ok" @mousedown.prevent="commitNodeEdit" title="Guardar">✓</button>
                  </div>
                  <div v-else class="f3d-front-content">
                    <span class="f3d-metric-label">%CTR</span>
                    <span class="f3d-metric-val">{{ Number(activeScenario.ctr).toFixed(1) }}%</span>
                    <span class="f3d-dblclick-hint">✏️ Doble clic</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- WIDGET DE ESTRATEGIA DE MARGEN ARDUINOHN (COLOCADO INMEDIATAMENTE ABAJO DEL ÁRBOL) -->
          <div class="tree-strategy-card-below">
            <div class="strat-header">
              <div class="strat-title-wrap">
                <span class="strat-bulb-icon">💡</span>
                <span class="strat-main-heading">Estrategia de Margen ArduinoHN</span>
                <span class="strat-badge-sub">Apalancamiento de Kits</span>
              </div>
              <div class="strat-kpi-badge">
                <span class="kpi-label">Margen Neto Estimado:</span>
                <strong class="kpi-val" :class="computedFinancials.profitPerUnit >= 0 ? 'profit-pos' : 'profit-neg'">
                  {{ computedFinancials.profitPerUnit >= 0 ? '+' : '' }}${{ computedFinancials.profitPerUnit.toFixed(2) }} / pedido
                </strong>
              </div>
            </div>
            <p class="strat-desc">
              Empaquetar componentes en <strong>Kit Bundle ($60+)</strong> en vez de componente suelto ($25) dispara tu ROAS a <strong>{{ computedRoas.toFixed(1) }}x</strong> absorbiendo cómodamente el CPA (${{ computedCpa.toFixed(2) }}).
            </p>
          </div>

          <!-- RECUADROS DE FÓRMULAS DISTRIBUIDOS EN TODO EL ESPACIO RESTANTE CON TEXTO MÁS GRANDE -->
          <div class="tree-formulas-expanded-grid">
            <!-- 1. CPC -->
            <div class="formula-card-expanded">
              <div class="f-card-header">
                <span class="f-num-badge">1</span>
                <span class="f-title">CPC (Costo por Clic)</span>
              </div>
              <div class="f-card-math">
                <span class="f-expr">(${{ Number(activeScenario.cpm).toFixed(2) }} ÷ 1000) ÷ ({{ activeScenario.ctr }}% ÷ 100)</span>
                <span class="f-equals">=</span>
                <strong class="f-result">${{ computedCpc.toFixed(3) }}</strong>
              </div>
              <div class="f-caption">Costo por visitante calificado a la tienda</div>
            </div>

            <!-- 2. CPA -->
            <div class="formula-card-expanded">
              <div class="f-card-header">
                <span class="f-num-badge">2</span>
                <span class="f-title">CPA (Costo por Compra)</span>
              </div>
              <div class="f-card-math">
                <span class="f-expr">${{ computedCpc.toFixed(3) }} ÷ ({{ activeScenario.cvr }}% ÷ 100)</span>
                <span class="f-equals">=</span>
                <strong class="f-result">${{ computedCpa.toFixed(2) }}</strong>
              </div>
              <div class="f-caption">Costo por adquisición según conversión de tienda</div>
            </div>

            <!-- 3. AOV -->
            <div class="formula-card-expanded">
              <div class="f-card-header">
                <span class="f-num-badge">3</span>
                <span class="f-title">AOV (Valor del Pedido)</span>
              </div>
              <div class="f-card-math">
                <span class="f-expr">${{ activeScenario.precioMedio }} × {{ activeScenario.cantidadMedia }} ud{{ activeScenario.cantidadMedia > 1 ? 's' : '' }}</span>
                <span class="f-equals">=</span>
                <strong class="f-result">${{ computedAov.toFixed(2) }}</strong>
              </div>
              <div class="f-caption">Ticket promedio facturado por cada compra</div>
            </div>

            <!-- 4. ROAS (Vértice Maestro) -->
            <div class="formula-card-expanded highlight-roas">
              <div class="f-card-header">
                <span class="f-num-badge badge-orange">4</span>
                <span class="f-title text-orange">ROAS (Retorno Publicitario)</span>
              </div>
              <div class="f-card-math">
                <span class="f-expr">${{ computedAov.toFixed(2) }} ÷ ${{ computedCpa.toFixed(2) }}</span>
                <span class="f-equals">=</span>
                <strong class="f-result text-orange">{{ computedRoas.toFixed(2) }}x</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN: SIMULATION CONTROLS & LIVE CASHFLOW PANEL (50% EQUAL WIDTH) -->
        <div class="simulation-column-equal">
          
          <!-- Node Controls Panel -->
          <div class="sim-card glass-card">
            <div class="sim-card-header">
              <div class="sim-title-group">
                <span class="sim-icon">🎛️</span>
                <h3>Palancas de Simulación en Vivo</h3>
              </div>
              <span class="sim-badge-live">Reactivo</span>
            </div>

            <div class="controls-vertical-list">
              <!-- Control 1: Precio Medio (AOV) -->
              <div class="control-box" :class="{ 'box-highlight': selectedNode === 'precio' || selectedNode === 'aov' }">
                <div class="control-row">
                  <div class="control-meta">
                    <span class="ctrl-code">(D)</span>
                    <label>Precio Medio del Kit / Producto:</label>
                  </div>
                  <div class="ctrl-input-wrap">
                    <span class="curr">$</span>
                    <input type="number" step="1" min="1" v-model.number="activeScenario.precioMedio" class="ctrl-input font-bold" />
                  </div>
                </div>
                <input type="range" min="5" max="250" step="1" v-model.number="activeScenario.precioMedio" class="range-arduino" />
                <div class="ctrl-hints">
                  <span>$25 (Componente solo)</span>
                  <span>$60 (Kit IoT)</span>
                  <span>$120 (Kit Pro)</span>
                </div>
              </div>

              <!-- Control 2: Cantidad Media -->
              <div class="control-box" :class="{ 'box-highlight': selectedNode === 'cant' }">
                <div class="control-row">
                  <div class="control-meta">
                    <span class="ctrl-code">(E)</span>
                    <label>Cantidad Media por Pedido:</label>
                  </div>
                  <div class="ctrl-input-wrap">
                    <input type="number" step="0.1" min="1" max="5" v-model.number="activeScenario.cantidadMedia" class="ctrl-input font-bold" />
                  </div>
                </div>
                <input type="range" min="1.0" max="3.0" step="0.1" v-model.number="activeScenario.cantidadMedia" class="range-arduino" />
              </div>

              <!-- Control 3: CPM Subasta -->
              <div class="control-box" :class="{ 'box-highlight': selectedNode === 'cpm' }">
                <div class="control-row">
                  <div class="control-meta">
                    <span class="ctrl-code">(J)</span>
                    <label>CPM (Costo por 1,000 Impresiones):</label>
                  </div>
                  <div class="ctrl-input-wrap">
                    <span class="curr">$</span>
                    <input type="number" step="0.1" min="0.5" max="20" v-model.number="activeScenario.cpm" class="ctrl-input font-bold" />
                  </div>
                </div>
                <input type="range" min="1.0" max="12.0" step="0.1" v-model.number="activeScenario.cpm" class="range-arduino" />
                <div class="ctrl-hints">
                  <span>$1.5 (Económico)</span>
                  <span>$3.0 (Subasta HN)</span>
                  <span>$6.0+ (Saturado)</span>
                </div>
              </div>

              <!-- Control 4: CTR Creativo -->
              <div class="control-box" :class="{ 'box-highlight': selectedNode === 'ctr' }">
                <div class="control-row">
                  <div class="control-meta">
                    <span class="ctrl-code">(K)</span>
                    <label>CTR Único (% Clics al Enlace):</label>
                  </div>
                  <div class="ctrl-input-wrap">
                    <input type="number" step="0.1" min="0.1" max="10" v-model.number="activeScenario.ctr" class="ctrl-input font-bold" />
                    <span class="curr">%</span>
                  </div>
                </div>
                <input type="range" min="0.4" max="5.0" step="0.1" v-model.number="activeScenario.ctr" class="range-arduino" />
                <div class="ctrl-hints">
                  <span class="text-danger">&lt; 1% Alerta Maker</span>
                  <span class="text-success">&ge; 2% Excelente</span>
                </div>
              </div>

              <!-- Control 5: CVR Landing/Tienda -->
              <div class="control-box" :class="{ 'box-highlight': selectedNode === 'cvr' }">
                <div class="control-row">
                  <div class="control-meta">
                    <span class="ctrl-code">(G)</span>
                    <label>%CVR (Conversión Landing / Tienda):</label>
                  </div>
                  <div class="ctrl-input-wrap">
                    <input type="number" step="0.1" min="0.2" max="15" v-model.number="activeScenario.cvr" class="ctrl-input font-bold" />
                    <span class="curr">%</span>
                  </div>
                </div>
                <input type="range" min="0.5" max="8.0" step="0.1" v-model.number="activeScenario.cvr" class="range-arduino" />
                <div class="ctrl-hints">
                  <span class="text-danger">&lt; 2% Fricción</span>
                  <span class="text-success">&ge; 3% Saludable</span>
                </div>
              </div>

              <!-- Control 6: Frecuencia -->
              <div class="control-box">
                <div class="control-row">
                  <div class="control-meta">
                    <label>Frecuencia de Anuncio:</label>
                  </div>
                  <div class="ctrl-input-wrap">
                    <input type="number" step="0.1" min="1" max="5" v-model.number="activeScenario.frecuencia" class="ctrl-input font-bold" />
                    <span class="curr">x</span>
                  </div>
                </div>
                <input type="range" min="1.0" max="3.5" step="0.1" v-model.number="activeScenario.frecuencia" class="range-arduino" />
                <div class="ctrl-hints">
                  <span>1.0x</span>
                  <span class="text-warning">&le; 2.0 Límite Técnico</span>
                  <span class="text-danger">&gt; 2.0 Fatiga</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Real Cashflow & Profit Impact Card -->
          <div class="sim-card glass-card cashflow-section">
            <div class="sim-card-header">
              <div class="sim-title-group">
                <span class="sim-icon">💰</span>
                <h3>Flujo de Caja & Rentabilidad Neta</h3>
              </div>
            </div>

            <!-- Ad Budget Input -->
            <div class="ad-spend-row">
              <label>Presupuesto Publicitario Asignado:</label>
              <div class="ctrl-input-wrap">
                <span class="curr">$</span>
                <input type="number" step="10" min="10" v-model.number="activeScenario.inversionSimulada" class="ctrl-input font-bold" />
              </div>
            </div>

            <!-- Financial Metrics Grid -->
            <div class="cashflow-kpi-grid">
              <div class="kpi-card">
                <span class="kpi-label">Pedidos Estimados</span>
                <span class="kpi-value text-teal">{{ computedFinancials.estimatedPurchases }}</span>
                <span class="kpi-sub">Ad Spend ÷ CPA</span>
              </div>

              <div class="kpi-card">
                <span class="kpi-label">Ingresos Facturados</span>
                <span class="kpi-value text-teal">${{ computedFinancials.grossRevenue.toFixed(0) }}</span>
                <span class="kpi-sub">{{ computedFinancials.estimatedPurchases }} × ${{ computedAov.toFixed(1) }}</span>
              </div>

              <div class="kpi-card">
                <span class="kpi-label">Ganancia Bruta</span>
                <span class="kpi-value text-orange">${{ computedFinancials.grossProfitFromProducts.toFixed(0) }}</span>
                <span class="kpi-sub">{{ activeScenario.margenBrutoPct }}% margen</span>
              </div>

              <div class="kpi-card" :class="computedFinancials.isProfitable ? 'card-profit' : 'card-loss'">
                <span class="kpi-label">Beneficio Neto Real</span>
                <span class="kpi-value">{{ computedFinancials.netProfitAfterAds >= 0 ? '+' : '' }}${{ computedFinancials.netProfitAfterAds.toFixed(0) }}</span>
                <span class="kpi-sub">Tras pagar Meta Ads</span>
              </div>
            </div>

            <!-- Break Even & Margin Banner -->
            <div class="margin-break-even-strip">
              <div><strong>Margen Neto / Unidad:</strong> <span :class="computedFinancials.profitPerUnit >= 0 ? 'text-success' : 'text-danger'">${{ computedFinancials.profitPerUnit.toFixed(2) }}</span></div>
              <div><strong>Break-Even ROAS:</strong> <span class="text-orange">{{ computedFinancials.breakEvenRoas }}x</span></div>
            </div>
          </div>

        </div>

      </div>
    </div>

    <!-- TAB 2: MATRIZ DE DIAGNÓSTICO & REGLAS ARDUINOHN -->
    <div v-show="currentTab === 'diagnostico'" class="tab-content fade-in">
      <div class="diagnosis-summary-header">
        <h2 class="section-title">🎯 Diagnóstico de Campañas & Benchmarks ArduinoHN</h2>
        <p class="section-subtitle">Matriz de síntomas, diagnósticos y acciones correctivas ajustadas al nicho de ingeniería y makers</p>
      </div>

      <!-- Live Diagnosis Grid -->
      <div class="diagnosis-alerts-grid">
        <div 
          v-for="(item, idx) in diagnosis.alerts" 
          :key="idx" 
          class="diag-card glass-card"
          :class="'card-' + item.level"
        >
          <div class="diag-header">
            <div class="diag-metric-title">
              <span class="status-indicator-dot" :class="item.level"></span>
              <span>{{ item.metric }}</span>
            </div>
            <span class="diag-badge" :class="item.level">
              {{ item.level === 'healthy' ? 'Saludable' : (item.level === 'alert' ? 'Alerta' : 'Crítico') }}
            </span>
          </div>

          <div class="diag-values-row">
            <div>
              <span class="label-tiny">Valor en Simulación:</span>
              <div class="diag-current-val">{{ item.currentValue }}</div>
            </div>
            <div>
              <span class="label-tiny">Benchmark Técnico:</span>
              <div class="diag-bench-val text-teal">{{ item.benchmark }}</div>
            </div>
          </div>

          <div class="diag-body">
            <div class="diag-finding">
              <strong>Diagnóstico:</strong> {{ item.diagnosisText }}
            </div>
            <div class="diag-action text-orange">
              <strong>Cura Recomendada:</strong> {{ item.actionText }}
            </div>
          </div>
        </div>
      </div>

      <!-- REGLA DE LOS 3 DÍAS DECISION ASSISTANT -->
      <div class="decision-rule-card glass-card">
        <div class="rule-header">
          <div class="rule-icon-box">⏳</div>
          <div>
            <h3 class="rule-title">5. Regla de Decisión Maestra: No reacciones al ruido de 24 horas</h3>
            <p class="rule-desc">Protocolo de escalado y auditoría publicitaria para ArduinoHN</p>
          </div>
        </div>

        <div class="rule-columns-grid">
          <!-- Col 1: Fase de Aprendizaje -->
          <div class="rule-col glass-sub">
            <div class="col-badge badge-teal">Fase 1: Aprendizaje (Días 1 a 3)</div>
            <h4>El Algoritmo Empareja</h4>
            <p>Si el costo por resultado es errático o llega hasta <strong>1.5x tu objetivo</strong> en los primeros días, <strong>NO TOQUES LA CAMPAÑA</strong>. Meta todavía está emparejando anuncio con comprador.</p>
            <div class="rule-tip-box">
              💡 <em>Tocar presupuesto o creativos en las primeras 48h reinicia el algoritmo.</em>
            </div>
          </div>

          <!-- Col 2: Regla de los 3 Días -->
          <div class="rule-col glass-sub">
            <div class="col-badge badge-orange">Fase 2: Regla de las 72 Horas</div>
            <h4>Confirmación de Tendencia</h4>
            <p>Solo actúa si la tendencia negativa se mantiene constante durante <strong>72 horas de costo acumulado</strong>.</p>
            <div class="rule-tip-box">
              ⏱️ <em>Filtra datos en Ads Manager por "Últimos 3 días" para tomar decisiones certeras.</em>
            </div>
          </div>

          <!-- Col 3: Palancas Disponibles -->
          <div class="rule-col glass-sub">
            <div class="col-badge badge-green">Fase 3: Palancas Disponibles</div>
            <h4>Aislar Palancas (1 a la vez)</h4>
            <ul class="rule-actions-list">
              <li><strong>1. Renovar Creatividades:</strong> Ataca directamente el CTR bajo (&lt;1%).</li>
              <li><strong>2. Ajustar Presupuesto:</strong> Escalar o reducir un 15-20%.</li>
              <li><strong>3. Ampliar Audiencias:</strong> Ataca el CPM y la frecuencia saturada &gt; 2.0.</li>
            </ul>
            <div class="rule-tip-box caution">
              ⚠️ <em>¡Nunca muevas las tres a la vez para poder aislar qué funcionó!</em>
            </div>
          </div>
        </div>
      </div>

      <!-- TABLA DE REFERENCIA RÁPIDA SEMANAL -->
      <div class="benchmarks-table-card glass-card">
        <div class="table-header-clean">
          <h3 class="card-title">📑 Tabla de Referencia Rápida para Auditar Campañas Cada Semana</h3>
          <span class="card-subtitle">Benchmarks consolidados y calibrados para el nicho de electrónica y dropshipping de ArduinoHN</span>
        </div>

        <div class="table-responsive">
          <table class="benchmark-table">
            <thead>
              <tr>
                <th>Métrica</th>
                <th>Rango Saludable</th>
                <th>Alerta</th>
                <th>Acción si está en Alerta</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="font-bold text-teal">CTR único (enlace)</td>
                <td><span class="badge-pill good">≥ 1.0%</span></td>
                <td><span class="badge-pill warning">&lt; 1.0%</span></td>
                <td>Rota creativo — cambia el gancho de los primeros 3 segundos (muestra código, pines o caso de uso real).</td>
              </tr>
              <tr>
                <td class="font-bold text-teal">CTR (Todos)</td>
                <td><span class="badge-pill good">≥ 2.0%</span></td>
                <td><span class="badge-pill warning">&lt; 1.5%</span></td>
                <td>El arte visual no es disruptivo; prueba formato Reel con demostración práctica.</td>
              </tr>
              <tr>
                <td class="font-bold text-teal">CPM</td>
                <td><span class="badge-pill good">Estable (var &lt; 20% semanal)</span></td>
                <td><span class="badge-pill warning">Sube &gt; 20% en 1 semana</span></td>
                <td>Revisa saturación de audiencia o calidad del anuncio. Abre a Advantage+ con segmentación Broad.</td>
              </tr>
              <tr>
                <td class="font-bold text-teal">Frecuencia (Audiencia Fría)</td>
                <td><span class="badge-pill good">≤ 2.0</span></td>
                <td><span class="badge-pill warning">&gt; 2.0</span></td>
                <td>Amplía audiencia (de "Arduino" a "electrónica DIY general") o rota creatividades (el nicho técnico se satura rápido).</td>
              </tr>
              <tr>
                <td class="font-bold text-teal">Frecuencia (Retargeting 75%)</td>
                <td><span class="badge-pill good">≤ 3.0</span></td>
                <td><span class="badge-pill warning">&gt; 3.0 sin ventas nuevas</span></td>
                <td>Refresca el público objetivo o cambia el ángulo del mensaje comercial hacia WhatsApp.</td>
              </tr>
              <tr>
                <td class="font-bold text-teal">CPC</td>
                <td><span class="badge-pill good">Según subasta, estable</span></td>
                <td><span class="badge-pill warning">Sube sin cambio en CTR</span></td>
                <td>Subasta saturada; ajusta puja o abre segmentación a toda Honduras.</td>
              </tr>
              <tr>
                <td class="font-bold text-teal">CVR (checkout / landing)</td>
                <td><span class="badge-pill good">≥ 2–3%</span></td>
                <td><span class="badge-pill warning">&lt; 2%</span></td>
                <td>Fricción en checkout: aclara tiempos de envío en Honduras, métodos de pago locales y soporte técnico.</td>
              </tr>
              <tr>
                <td class="font-bold text-teal">CPA (costo por venta)</td>
                <td><span class="badge-pill good">Por debajo del margen bruto</span></td>
                <td><span class="badge-pill danger">Se acerca o supera el margen</span></td>
                <td>Diagnostica con la cascada: ¿es problema de CPC (tráfico) o de CVR (tienda)?</td>
              </tr>
              <tr>
                <td class="font-bold text-teal">Tasa de cierre (mensaje → venta)</td>
                <td><span class="badge-pill good">≥ 5%</span></td>
                <td><span class="badge-pill warning">&lt; 5%</span></td>
                <td>El fallo está en el proceso comercial o tiempo de respuesta en WhatsApp, no en Meta Ads.</td>
              </tr>
              <tr>
                <td class="font-bold text-teal">ROAS (Retorno publicitario)</td>
                <td><span class="badge-pill good">≥ 3–4x</span></td>
                <td><span class="badge-pill danger">&lt; 2x</span></td>
                <td><strong>Sube el AOV empaquetando en Kits/Bundles</strong> antes de intentar bajar el CPA.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 3: COMPARADOR AOV VS CPA -->
    <div v-show="currentTab === 'comparador'" class="tab-content fade-in">
      <div class="comparer-header">
        <h2 class="section-title">📊 El Poder del Apalancamiento del AOV en Meta Ads</h2>
        <p class="section-subtitle">Demostración visual: empaquetar kits eleva el AOV y dispara el ROAS manteniendo exactamente el mismo CPA</p>
      </div>

      <!-- Visual Bar Chart Component (Matching Image 3) -->
      <div class="chart-container-card glass-card">
        <div class="chart-header">
          <div class="chart-title">ROAS: Componente Suelto vs. Kit IoT Bundle — Mismo CPA de $5.00</div>
          <div class="chart-badge">ROAS (x)</div>
        </div>

        <div class="bar-chart-visual">
          <!-- Bar 1: Componente Suelto -->
          <div class="chart-bar-group">
            <div class="bar-column-wrapper">
              <span class="bar-value-label text-teal">5.0x</span>
              <div class="bar-pillar pillar-teal" style="height: 35%;"></div>
            </div>
            <div class="bar-label-box">
              <span class="bar-name">Componente suelto</span>
              <span class="bar-sub">(AOV $25.00 | CPA $5.00)</span>
            </div>
          </div>

          <!-- Bar 2: Kit IoT Bundle -->
          <div class="chart-bar-group">
            <div class="bar-column-wrapper">
              <span class="bar-value-label text-orange">12.0x</span>
              <div class="bar-pillar pillar-orange" style="height: 80%;"></div>
            </div>
            <div class="bar-label-box">
              <span class="bar-name">Kit IoT Starter Bundle</span>
              <span class="bar-sub">(AOV $60.00 | CPA $5.00)</span>
            </div>
          </div>

          <!-- Bar 3: Kit Robótica STEM -->
          <div class="chart-bar-group">
            <div class="bar-column-wrapper">
              <span class="bar-value-label text-green">14.9x</span>
              <div class="bar-pillar pillar-green" style="height: 95%;"></div>
            </div>
            <div class="bar-label-box">
              <span class="bar-name">Kit Robótica & STEM</span>
              <span class="bar-sub">(AOV $85.00 | CPA $5.68)</span>
            </div>
          </div>

          <!-- Bar 4: Current Simulation -->
          <div class="chart-bar-group active-sim-group">
            <div class="bar-column-wrapper">
              <span class="bar-value-label text-yellow">{{ computedRoas.toFixed(1) }}x</span>
              <div 
                class="bar-pillar pillar-gold" 
                :style="{ height: Math.min(100, Math.max(10, (computedRoas / 16) * 100)) + '%' }"
              ></div>
            </div>
            <div class="bar-label-box">
              <span class="bar-name">Tu Simulación Actual</span>
              <span class="bar-sub">(AOV ${{ computedAov.toFixed(1) }} | CPA ${{ computedCpa.toFixed(2) }})</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Strategic Explainer Card -->
      <div class="strategy-explainer-card glass-card">
        <div class="explainer-icon">💡</div>
        <div class="explainer-text">
          <h3>Estrategia Solution-Based para ArduinoHN</h3>
          <p>
            En la subasta publicitaria de Meta, los anunciantes que venden productos de bajo precio ($10–$25) quedan atrapados cuando el costo por adquisición ronda los $5–$8, ya que su margen bruto es mínimo.
          </p>
          <p>
            Al crear un <strong>Kit Bundle Solution-Based</strong> (ejemplo: <em>"Kit de inicio IoT: ESP32 + Sensores DHT22 + Relé + Protoboard + Cables"</em> por <strong>$60</strong> en vez de vender el ESP32 solo a <strong>$25</strong>):
          </p>
          <ul class="explainer-list">
            <li>✅ El ROAS salta de <strong>5.0x a 12.0x</strong> manteniendo el mismo CPA publicitario ($5.00).</li>
            <li>✅ Obtienes un margen neto de más de <strong>$20 por pedido</strong> tras pagar publicidad, en lugar de ganar solo $3–$4.</li>
            <li>✅ Puedes permitirte pujar con mayor agresividad en subastas saturadas superando a competidores locales.</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- TAB 4: HISTORIAL & CRUD DE AUDITORÍAS -->
    <div v-show="currentTab === 'scenarios'" class="tab-content fade-in">
      <div class="history-header-row">
        <div>
          <h2 class="section-title">📋 Registro y CRUD de Auditorías de Campaña</h2>
          <p class="section-subtitle">Gestiona, carga al simulador, modifica y audita tus campañas publicitarias guardadas</p>
        </div>

        <div class="history-actions">
          <input 
            type="text" 
            v-model="searchFilter" 
            placeholder="🔍 Buscar por nombre o público..." 
            class="form-control-clean search-filter-input"
          />
          <button class="btn btn-outline" @click="exportToCSV" title="Exportar tabla a archivo CSV">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      <!-- Scenarios Table -->
      <div class="table-container glass-card">
        <table class="scenarios-table">
          <thead>
            <tr>
              <th>Campaña / Análisis</th>
              <th>Tipo</th>
              <th>Fecha</th>
              <th>AOV</th>
              <th>CPM</th>
              <th>CTR</th>
              <th>CPC</th>
              <th>CVR</th>
              <th>CPA</th>
              <th>ROAS</th>
              <th>Frec.</th>
              <th>Salud</th>
              <th class="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sc in filteredScenarios" :key="sc.id" :class="{ 'selected-row': activeScenario.id === sc.id }">
              <td>
                <div class="sc-name font-bold">{{ sc.name }}</div>
                <div class="sc-sub">{{ sc.targetAudience || 'Audiencia no especificada' }}</div>
              </td>
              <td>
                <span class="type-pill" :class="sc.campaignType">{{ formatCampaignType(sc.campaignType) }}</span>
              </td>
              <td class="font-mono text-sm">{{ sc.date }}</td>
              <td class="font-bold text-teal">${{ sc.aov ? sc.aov.toFixed(1) : (sc.precioMedio * (sc.cantidadMedia || 1)).toFixed(1) }}</td>
              <td class="font-mono">${{ Number(sc.cpm).toFixed(2) }}</td>
              <td class="font-mono" :class="sc.ctr >= 1.0 ? 'text-success' : 'text-danger'">{{ Number(sc.ctr).toFixed(1) }}%</td>
              <td class="font-mono">${{ Number(sc.cpc).toFixed(3) }}</td>
              <td class="font-mono" :class="sc.cvr >= 2.0 ? 'text-success' : 'text-warning'">{{ Number(sc.cvr).toFixed(1) }}%</td>
              <td class="font-bold font-mono">${{ Number(sc.cpa).toFixed(2) }}</td>
              <td>
                <span class="roas-pill font-bold" :class="sc.roas >= 3 ? 'roas-high' : (sc.roas >= 2 ? 'roas-mid' : 'roas-low')">
                  {{ Number(sc.roas).toFixed(2) }}x
                </span>
              </td>
              <td class="font-mono">{{ Number(sc.frecuencia || 1.5).toFixed(1) }}x</td>
              <td>
                <span class="health-badge">
                  {{ (sc.healthStatus === 'saludable' ? '🟢' : (sc.healthStatus === 'alerta' ? '🟡' : '🔴')) }}
                </span>
              </td>
              <td class="text-right">
                <div class="action-buttons-group">
                  <button class="action-icon-btn btn-load" @click="loadScenario(sc)" title="Cargar en el Árbol">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    <span>Cargar</span>
                  </button>

                  <button class="action-icon-btn btn-delete" @click="confirmDelete(sc.id)" title="Eliminar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredScenarios.length === 0">
              <td colspan="13" class="empty-state">
                No se encontraron auditorías con el filtro seleccionado.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useMetaMetrics } from '~/composables/useMetaMetrics'
import { useProducts } from '~/composables/useProducts'

const route = useRoute()
const { allProducts } = useProducts()
const currentTab = ref('tree')
const selectedNode = ref<string>('roas')
const searchFilter = ref('')

// Interactive Node Inline Editing via Double-Click
const editingNode = ref<string | null>(null)
const editValue = ref<number>(0)
const editInputRef = ref<HTMLInputElement | null>(null)

const handleNodeDblClick = (nodeKey: string) => {
  editingNode.value = nodeKey
  if (nodeKey === 'precio') {
    editValue.value = activeScenario.value.precioMedio
  } else if (nodeKey === 'cant') {
    editValue.value = activeScenario.value.cantidadMedia
  } else if (nodeKey === 'cpm') {
    editValue.value = activeScenario.value.cpm
  } else if (nodeKey === 'ctr') {
    editValue.value = activeScenario.value.ctr
  } else if (nodeKey === 'cvr') {
    editValue.value = activeScenario.value.cvr
  } else if (nodeKey === 'aov') {
    editValue.value = Number(computedAov.value.toFixed(1))
  } else if (nodeKey === 'cpc') {
    editValue.value = Number(computedCpc.value.toFixed(3))
  } else if (nodeKey === 'cpa') {
    editValue.value = Number(computedCpa.value.toFixed(2))
  } else if (nodeKey === 'roas') {
    editValue.value = Number(computedRoas.value.toFixed(2))
  }
  nextTick(() => {
    editInputRef.value?.focus()
    editInputRef.value?.select()
  })
}

const commitNodeEdit = () => {
  if (!editingNode.value) return
  const val = Number(editValue.value)
  if (isNaN(val) || val <= 0) {
    editingNode.value = null
    return
  }

  const key = editingNode.value
  editingNode.value = null

  if (key === 'precio') {
    activeScenario.value.precioMedio = Math.max(1, val)
  } else if (key === 'cant') {
    activeScenario.value.cantidadMedia = Math.max(0.1, val)
  } else if (key === 'cpm') {
    activeScenario.value.cpm = Math.max(0.1, val)
  } else if (key === 'ctr') {
    activeScenario.value.ctr = Math.max(0.05, val)
  } else if (key === 'cvr') {
    activeScenario.value.cvr = Math.max(0.05, val)
  } else if (key === 'aov') {
    // AOV = precioMedio * cantidadMedia => adjust precioMedio to achieve desired AOV
    const qty = activeScenario.value.cantidadMedia || 1
    activeScenario.value.precioMedio = +(val / qty).toFixed(2)
  } else if (key === 'cpc') {
    // CPC = (CPM / 1000) / (CTR / 100) => adjust CTR to achieve desired CPC
    const cpm = activeScenario.value.cpm
    activeScenario.value.ctr = +(((cpm / 1000) / val) * 100).toFixed(2)
  } else if (key === 'cpa') {
    // CPA = CPC / (CVR / 100) => adjust CVR to achieve desired CPA
    const cpc = computedCpc.value
    activeScenario.value.cvr = +((cpc / val) * 100).toFixed(2)
  } else if (key === 'roas') {
    // ROAS = AOV / CPA => adjust price to achieve target ROAS
    const cpa = computedCpa.value
    const targetAov = val * cpa
    const qty = activeScenario.value.cantidadMedia || 1
    activeScenario.value.precioMedio = +(targetAov / qty).toFixed(2)
  }
}

const cancelNodeEdit = () => {
  editingNode.value = null
}

const {
  scenarios,
  activeScenario,
  presetTemplates,
  isSaving,
  errorMessage,
  successMessage,
  computedAov,
  computedCpc,
  computedCpa,
  computedRoas,
  computedFinancials,
  diagnosis,
  fetchScenarios,
  loadScenario,
  applyPreset,
  resetToNew,
  saveCurrentScenario,
  removeScenario
} = useMetaMetrics()

onMounted(async () => {
  if (route.query.tab && typeof route.query.tab === 'string') {
    currentTab.value = route.query.tab
  }
  await fetchScenarios()
})

const filteredScenarios = computed(() => {
  if (!searchFilter.value) return scenarios.value
  const q = searchFilter.value.toLowerCase()
  return scenarios.value.filter(s => 
    (s.name && s.name.toLowerCase().includes(q)) ||
    (s.targetAudience && s.targetAudience.toLowerCase().includes(q)) ||
    (s.notes && s.notes.toLowerCase().includes(q))
  )
})

const formatCampaignType = (type: string) => {
  const map: Record<string, string> = {
    cold_traffic: 'Audiencia Fría',
    retargeting: 'Retargeting 75%',
    advantage_plus: 'Advantage+',
    lead_messages: 'WhatsApp Leads',
    bundle_launch: 'Kit Bundle'
  }
  return map[type] || type
}

const onSelectPreset = (event: Event) => {
  const select = event.target as HTMLSelectElement
  const idx = Number(select.value)
  if (!isNaN(idx) && presetTemplates[idx]) {
    applyPreset(presetTemplates[idx])
  }
}

const handleNewAnalysis = () => {
  resetToNew()
  currentTab.value = 'tree'
}

const handleSaveScenario = async () => {
  await saveCurrentScenario(false)
}

const handleSaveCopy = async () => {
  await saveCurrentScenario(true)
}

const confirmDelete = async (id: string) => {
  if (confirm('¿Estás seguro de eliminar esta auditoría de campaña?')) {
    await removeScenario(id)
  }
}

const exportToCSV = () => {
  if (scenarios.value.length === 0) return
  const headers = ['Nombre', 'Tipo', 'Fecha', 'Precio Medio', 'Cant Media', 'AOV', 'CPM', 'CTR', 'CPC', 'CVR', 'CPA', 'ROAS', 'Frecuencia', 'Estado']
  const rows = scenarios.value.map(s => [
    `"${s.name.replace(/"/g, '""')}"`,
    s.campaignType,
    s.date,
    s.precioMedio,
    s.cantidadMedia,
    s.aov,
    s.cpm,
    s.ctr,
    s.cpc,
    s.cvr,
    s.cpa,
    s.roas,
    s.frecuencia || 1.0,
    s.healthStatus || 'saludable'
  ])

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `auditoria_meta_ads_arduinohn_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<style scoped>
/* ARDUINOHN CLEAN THEME & 3D FOLDER CANVAS */
.admin-meta-container {
  max-width: 1540px;
  margin: 0 auto;
  padding: 1.5rem 1.25rem 4rem;
  color: var(--text-main, #212529);
}

/* Breadcrumb & Top Bar */
.admin-breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-muted, #64748b);
  margin-bottom: 0.35rem;
}
.admin-breadcrumb a {
  color: var(--color-primary, #00979C);
  text-decoration: none;
  font-weight: 500;
}
.admin-breadcrumb a:hover {
  color: var(--color-secondary, #005C5F);
}
.admin-breadcrumb .current {
  color: var(--text-main, #212529);
  font-weight: 600;
}
.admin-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.title-with-badge {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex-wrap: wrap;
}
.meta-main-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-main, #212529);
  letter-spacing: -0.02em;
  margin: 0;
}
.badge-arduino {
  background: rgba(0, 151, 156, 0.12);
  border: 1px solid rgba(0, 151, 156, 0.35);
  color: var(--color-primary, #00979C);
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
}

/* Header Action Buttons */
.header-actions {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
}
.preset-dropdown-container {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.preset-label {
  font-size: 0.8rem;
  color: var(--text-muted, #64748b);
  font-weight: 600;
}
.preset-select {
  background: var(--bg-card, #ffffff);
  border: 1px solid rgba(0, 151, 156, 0.35);
  color: var(--color-primary, #00979C);
  border-radius: 8px;
  padding: 0.45rem 0.65rem;
  font-size: 0.82rem;
  font-weight: 600;
  outline: none;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 0.9rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}
.btn-primary {
  background: var(--color-primary, #00979C);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 151, 156, 0.25);
}
.btn-primary:hover:not(:disabled) {
  background: var(--color-secondary, #005C5F);
  transform: translateY(-1px);
}
.btn-secondary {
  background: #f1f5f9;
  color: #1e293b;
  border: 1px solid rgba(0, 0, 0, 0.1);
}
.btn-secondary:hover {
  background: #e2e8f0;
}
.btn-outline {
  background: transparent;
  color: var(--text-muted, #64748b);
  border: 1px solid rgba(0, 0, 0, 0.15);
}
.btn-outline:hover {
  background: rgba(0, 0, 0, 0.04);
  color: var(--text-main, #212529);
}

/* Glassmorphism Card Container */
.glass-card {
  background: var(--bg-card, #ffffff);
  border: 1px solid rgba(0, 151, 156, 0.18);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border-radius: 12px;
}
.glass-sub {
  background: #f8fafc;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 10px;
}

/* Tabs Bar */
.meta-tabs-bar {
  display: flex;
  gap: 0.5rem;
  padding: 0.35rem;
  margin-bottom: 1.25rem;
  overflow-x: auto;
}
.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.1rem;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: var(--text-muted, #64748b);
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.tab-btn:hover {
  color: var(--text-main, #212529);
  background: rgba(0, 151, 156, 0.06);
}
.tab-btn.active {
  background: rgba(0, 151, 156, 0.12);
  color: var(--color-primary, #00979C);
  border: 1px solid rgba(0, 151, 156, 0.35);
}
.tab-badge {
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
}
.tab-badge.critical { background: #ef4444; color: white; }
.tab-badge.alert { background: #eab308; color: black; }
.tab-badge.info { background: #00979C; color: white; }

/* Alerts */
.alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  font-size: 0.88rem;
  margin-bottom: 1rem;
}
.alert-success { background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); color: #059669; }
.alert-error { background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3); color: #dc2626; }

/* Campaign Meta Strip */
.campaign-meta-strip {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.strip-field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.strip-field label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted, #64748b);
  text-transform: uppercase;
}
.name-field { flex: 1.5; }
.form-control-clean, .form-select-clean {
  background: var(--bg-card, #ffffff);
  border: 1px solid rgba(0, 0, 0, 0.12);
  color: var(--text-main, #212529);
  padding: 0.4rem 0.65rem;
  border-radius: 6px;
  font-size: 0.82rem;
  outline: none;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.03);
}
.form-control-clean:focus, .form-select-clean:focus {
  border-color: #00979C;
  box-shadow: 0 0 0 2px rgba(0, 151, 156, 0.15);
}

/* 2 COLUMNS: 2/3 TREE (66.7%) AND 1/3 CONTROLS (33.3%) */
.tree-workspace-grid-equal {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: 1.5rem;
  align-items: stretch;
}
@media (max-width: 1100px) {
  .tree-workspace-grid-equal {
    grid-template-columns: 1fr;
  }
}

/* LEFT COLUMN: 3D FOLDER DIAGRAM */
.tree-diagram-column {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
}
.tree-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}
.tree-legend-box {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.78rem;
  color: var(--text-main, #334155);
  font-weight: 600;
}
.legend-title { font-weight: 700; color: var(--text-muted, #64748b); }
.legend-step {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
}
.step-1 { background: rgba(34, 197, 94, 0.15); color: #15803d; }
.step-2 { background: rgba(234, 179, 8, 0.15); color: #ca8a04; }
.step-3 { background: rgba(225, 29, 72, 0.15); color: #be123c; }
.legend-arrow { color: #94a3b8; font-size: 0.75rem; }

.tree-status-pill {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
}
.tree-status-pill.saludable { background: rgba(16, 185, 129, 0.15); color: #059669; }
.tree-status-pill.alerta { background: rgba(234, 179, 8, 0.15); color: #b45309; }
.tree-status-pill.critico { background: rgba(239, 68, 68, 0.15); color: #dc2626; }
.status-dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; }

/* 3D FOLDER VIEWPORT (Clean White Background, NO GRID, Tubular Pipes) */
.folder-tree-viewport {
  position: relative;
  width: 100%;
  min-height: 680px;
  background-color: #ffffff; /* Clean, modern white background with NO GRID */
  border: 1.5px solid rgba(0, 151, 156, 0.22);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}
.folder-pipes-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.pipe-tube {
  fill: none;
  stroke: url(#pipe3DGradient);
  stroke-width: 10;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: url(#pipe3DShadow);
}
.pipe-tube-sub {
  stroke-width: 8;
}
.pipe-joint-node {
  fill: #ffffff;
  stroke: #0284c7;
  stroke-width: 3.5;
  filter: drop-shadow(0 2px 4px rgba(2, 132, 199, 0.25));
}

/* 3D FOLDER NODES LAYER */
.folder-nodes-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* 3D CLAYMORPHISM FOLDER CARD (ARDUINOHN TEAL THEME & EXPANDED BREATHING ROOM) */
.f3d-folder {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.28s ease;
  z-index: 5;
  width: 126px;
  filter: drop-shadow(0 10px 18px rgba(0, 151, 156, 0.2));
}
.f3d-folder:hover {
  transform: translate(-50%, -56%) scale(1.05);
  filter: drop-shadow(0 16px 26px rgba(0, 151, 156, 0.35));
}
.f3d-folder:hover .f3d-sheets {
  transform: translateY(-9px);
}
.f3d-folder.is-selected {
  transform: translate(-50%, -56%) scale(1.08);
  filter: drop-shadow(0 18px 30px rgba(228, 113, 40, 0.45));
}
.f3d-folder.is-selected .f3d-sheets {
  transform: translateY(-11px);
}
.f3d-folder.is-selected .f3d-front {
  box-shadow: 0 0 0 2.5px #E47128, inset 0 2px 4px rgba(255, 255, 255, 0.8), 0 8px 20px rgba(228, 113, 40, 0.3);
}

/* 3D Folder Back Plate & Elevated Tab (ArduinoHN Colors) */
.f3d-back.theme-arduino {
  background: linear-gradient(145deg, #00b4b9 0%, #00979C 55%, #005C5F 100%);
  border-radius: 12px 12px 14px 14px;
  padding-top: 18px;
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.5);
  position: relative;
}
.f3d-tab {
  position: absolute;
  top: -11px;
  left: 10px;
  height: 20px;
  padding: 0 9px;
  border-radius: 7px 7px 0 0;
  font-size: 0.68rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-bottom: none;
}
.tab-arduino-orange { background: linear-gradient(180deg, #f97316 0%, #E47128 100%); color: #ffffff; }
.tab-arduino-teal { background: linear-gradient(180deg, #00b4b9 0%, #007d82 100%); color: #ffffff; }
.tab-arduino-dark { background: linear-gradient(180deg, #00767a 0%, #004d50 100%); color: #ffffff; }

.f3d-tab-icon { font-size: 0.72rem; }
.f3d-tab-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 3D Protruding Document Sheets (More Height & Breathing Room) */
.f3d-sheets {
  margin: 0 10px;
  position: relative;
  z-index: 2;
  transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.f3d-sheet-back {
  position: absolute;
  top: -4px;
  left: 4px;
  right: 4px;
  height: 8px;
  background: #f1f5f9;
  border-radius: 6px 6px 0 0;
  opacity: 0.85;
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.05);
}
.f3d-sheet-main {
  background: #ffffff;
  border-radius: 8px 8px 3px 3px;
  padding: 6px 8px 18px 8px; /* Generous bottom padding so text is never covered by front flap */
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.f3d-sheet-title {
  font-size: 0.64rem;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}
.f3d-sheet-formula {
  font-size: 0.62rem;
  font-weight: 800;
  color: #005C5F;
  background: #e6f7f8;
  border: 1px solid rgba(0, 151, 156, 0.25);
  padding: 2px 6px;
  border-radius: 4px;
  margin-top: 3px;
  white-space: nowrap;
}

/* 3D Front Pocket / Flap (ArduinoHN Colors) */
.f3d-front.theme-arduino {
  background: linear-gradient(180deg, #00b4b9 0%, #00979C 45%, #005C5F 100%);
  border-radius: 4px 4px 14px 14px;
  margin-top: -15px;
  padding: 7px 8px;
  position: relative;
  z-index: 3;
  box-shadow: 
    0 -3px 8px rgba(0, 92, 95, 0.25),
    inset 0 2px 4px rgba(255, 255, 255, 0.7);
  border-top: 1.5px solid rgba(255, 255, 255, 0.65);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.f3d-front-glow {
  position: absolute;
  top: 0;
  left: 10px;
  right: 10px;
  height: 2px;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 2px;
}
.f3d-front-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}
.f3d-metric-label {
  font-size: 0.72rem;
  font-weight: 900;
  color: #ffffff;
  text-transform: uppercase;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
  letter-spacing: 0.03em;
}
.f3d-metric-val {
  font-size: 1.15rem;
  font-weight: 900;
  color: #ffffff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.45);
  line-height: 1.1;
  margin-top: 2px;
}

/* Specific Sizes & Positions with Generous Breathing Room (2/3 Grid Layout) */
.pos-f-roas { top: 16.8%; left: 50%; width: 168px; }
.pos-f-op-level1 { top: 30.1%; left: 50%; }

.pos-f-aov { top: 38%; left: 26.2%; width: 154px; }
.pos-f-cpa { top: 38%; left: 73.8%; width: 154px; }

.pos-f-op-aov { top: 53.5%; left: 26.2%; }
.pos-f-precio { top: 61%; left: 13.7%; width: 126px; }
.pos-f-cant { top: 61%; left: 38.7%; width: 126px; }

.pos-f-op-cpa { top: 53.5%; left: 73.8%; }
.pos-f-cpc { top: 61%; left: 61.3%; width: 126px; }
.pos-f-cvr { top: 61%; left: 86.3%; width: 126px; }

.pos-f-op-cpc { top: 77.4%; left: 61.3%; }
.pos-f-cpm { top: 86.8%; left: 48.2%; width: 118px; }
.pos-f-ctr { top: 86.8%; left: 74.4%; width: 118px; }

.f3d-compact .f3d-metric-val { font-size: 1.02rem; }
.f3d-mini .f3d-metric-val { font-size: 0.94rem; }

/* INLINE EDITING ON DOUBLE-CLICK */
.f3d-inline-edit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  background: rgba(255, 255, 255, 0.97);
  border: 1.5px solid #E47128;
  box-shadow: 0 4px 14px rgba(228, 113, 40, 0.35);
  border-radius: 6px;
  padding: 3px 5px;
  width: 95%;
  margin-top: 2px;
  z-index: 10;
}
.f3d-edit-sym {
  font-size: 0.85rem;
  font-weight: 800;
  color: #005C5F;
}
.f3d-inline-input {
  width: 100%;
  min-width: 45px;
  max-width: 68px;
  border: none;
  background: transparent;
  font-size: 1.02rem;
  font-weight: 900;
  color: #005C5F;
  text-align: center;
  outline: none;
  padding: 0;
}
.f3d-inline-ok {
  background: #00979C;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  font-size: 0.72rem;
  font-weight: 900;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: all 0.15s ease;
  flex-shrink: 0;
}
.f3d-inline-ok:hover {
  background: #00767a;
  transform: scale(1.1);
}
.f3d-folder.is-editing {
  z-index: 10 !important;
  transform: translate(-50%, -58%) scale(1.12) !important;
  filter: drop-shadow(0 14px 28px rgba(228, 113, 40, 0.55)) !important;
}
.f3d-folder.is-editing .f3d-front {
  border-color: #E47128 !important;
  box-shadow: 0 0 0 3px #E47128, inset 0 2px 4px rgba(255, 255, 255, 0.8), 0 8px 20px rgba(228, 113, 40, 0.35) !important;
}
.f3d-dblclick-hint {
  font-size: 0.56rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 1px;
  letter-spacing: 0.02em;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}
.f3d-folder:hover .f3d-dblclick-hint {
  opacity: 1;
  color: #ffffff;
}

/* 3D OPERATOR BADGES ON PIPES */
.f3d-op-badge {
  position: absolute;
  transform: translate(-50%, -50%);
  font-size: 1.15rem;
  font-weight: 900;
  color: #0284c7;
  background: #ffffff;
  border: 2.5px solid #0284c7;
  box-shadow: 0 4px 10px rgba(2, 132, 199, 0.28);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 6;
  cursor: help;
  transition: transform 0.2s ease;
}
.f3d-op-badge:hover {
  transform: translate(-50%, -50%) scale(1.15);
}

/* STRATEGY CARD PLACED IMMEDIATELY BELOW TREE VIEWPORT */
.tree-strategy-card-below {
  margin-top: 1rem;
  background: #ffffff;
  border: 1.5px solid rgba(0, 151, 156, 0.35);
  box-shadow: 0 4px 16px rgba(0, 151, 156, 0.08);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.strat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.strat-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.strat-bulb-icon { font-size: 1.2rem; }
.strat-main-heading {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--color-primary, #00979C);
  text-transform: uppercase;
  letter-spacing: 0.02em;
}
.strat-badge-sub {
  font-size: 0.72rem;
  font-weight: 700;
  background: rgba(0, 151, 156, 0.12);
  color: #00767a;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
}
.strat-kpi-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f0fdfa;
  border: 1px solid rgba(0, 151, 156, 0.25);
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
}
.kpi-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #475569;
}
.kpi-val {
  font-size: 0.92rem;
  font-weight: 900;
}
.profit-pos { color: #059669; }
.profit-neg { color: #dc2626; }
.strat-desc {
  font-size: 0.82rem;
  color: var(--text-main, #334155);
  line-height: 1.45;
  margin: 0;
}

/* RECUADROS DE FÓRMULAS DISTRIBUIDOS (TEXTO MÁS GRANDE Y ESPACIOSO) */
.tree-formulas-expanded-grid {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
}
@media (max-width: 768px) {
  .tree-formulas-expanded-grid {
    grid-template-columns: 1fr;
  }
}
.formula-card-expanded {
  background: #ffffff;
  border: 1.5px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.formula-card-expanded:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 151, 156, 0.12);
  border-color: rgba(0, 151, 156, 0.35);
}
.formula-card-expanded.highlight-roas {
  border-color: rgba(228, 113, 40, 0.4);
  background: linear-gradient(180deg, #fffbf7 0%, #ffffff 100%);
}
.f-card-header {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}
.f-num-badge {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #00979C;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}
.badge-orange {
  background: #E47128;
}
.f-title {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--color-primary, #00979C);
}
.text-orange { color: #E47128 !important; }
.text-orange-sub { color: #c2410c !important; }
.f-card-math {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.35rem;
  font-size: 0.92rem;
  color: var(--text-main, #1e293b);
  padding: 0.2rem 0;
}
.f-expr {
  font-weight: 600;
  color: #475569;
}
.f-equals {
  font-weight: 800;
  color: #94a3b8;
}
.f-result {
  font-size: 1.15rem;
  font-weight: 900;
  color: #0f172a;
}
.f-caption {
  font-size: 0.72rem;
  font-weight: 600;
  color: #64748b;
}

/* RIGHT COLUMN: EQUAL 50% SIMULATION CONTROLS */
.simulation-column-equal {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.sim-card {
  padding: 1.25rem;
}
.sim-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.sim-title-group {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}
.sim-title-group h3 {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-main, #212529);
  margin: 0;
}
.sim-badge-live {
  font-size: 0.68rem;
  font-weight: 700;
  background: rgba(0, 151, 156, 0.15);
  color: var(--color-primary, #00979C);
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  text-transform: uppercase;
}

.controls-vertical-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}
.control-box {
  background: #f8fafc;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  padding: 0.65rem 0.85rem;
  transition: all 0.2s ease;
}
.control-box.box-highlight {
  border-color: var(--color-primary, #00979C);
  background: rgba(0, 151, 156, 0.06);
}
.control-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.35rem;
}
.control-meta {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
.ctrl-code {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--color-primary, #00979C);
}
.control-meta label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-main, #334155);
}
.ctrl-input-wrap {
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid rgba(0, 151, 156, 0.4);
  border-radius: 6px;
  padding: 0.15rem 0.45rem;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.03);
}
.ctrl-input-wrap .curr {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-primary, #00979C);
}
.ctrl-input {
  width: 58px;
  background: transparent;
  border: none;
  color: var(--text-main, #212529);
  text-align: center;
  font-size: 0.88rem;
  outline: none;
}
.range-arduino {
  width: 100%;
  height: 5px;
  border-radius: 5px;
  background: #e2e8f0;
  accent-color: var(--color-primary, #00979C);
  outline: none;
  cursor: pointer;
}
.ctrl-hints {
  display: flex;
  justify-content: space-between;
  font-size: 0.68rem;
  color: var(--text-muted, #64748b);
  margin-top: 0.2rem;
}

/* Cashflow Section */
.ad-spend-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
  padding: 0.65rem 0.85rem;
  border-radius: 8px;
  margin-bottom: 0.85rem;
  border: 1px solid rgba(0, 0, 0, 0.06);
}
.ad-spend-row label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-main, #334155);
}
.cashflow-kpi-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.65rem;
  margin-bottom: 0.85rem;
}
.kpi-card {
  background: #f8fafc;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 8px;
  padding: 0.65rem;
  display: flex;
  flex-direction: column;
}
.kpi-label {
  font-size: 0.72rem;
  color: var(--text-muted, #64748b);
  font-weight: 600;
}
.kpi-value {
  font-size: 1.25rem;
  font-weight: 800;
  margin: 0.15rem 0;
}
.kpi-sub {
  font-size: 0.65rem;
  color: var(--text-muted, #94a3b8);
}
.card-profit {
  border-color: rgba(16, 185, 129, 0.3);
  background: rgba(16, 185, 129, 0.08);
}
.card-profit .kpi-value { color: #059669; }
.card-loss {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.08);
}
.card-loss .kpi-value { color: #dc2626; }

.margin-break-even-strip {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  background: #f8fafc;
  padding: 0.55rem 0.75rem;
  border-radius: 6px;
  color: var(--text-main, #334155);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

/* TAB 2, 3, 4 GENERAL STYLING */
.section-title {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--text-main, #212529);
  margin: 0 0 0.3rem 0;
}
.section-subtitle {
  font-size: 0.85rem;
  color: var(--text-muted, #64748b);
  margin: 0 0 1.25rem 0;
}
.diagnosis-alerts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.diag-card {
  padding: 1.1rem;
  border-left: 4px solid transparent;
}
.card-healthy { border-left-color: #10b981; }
.card-alert { border-left-color: #eab308; }
.card-critical { border-left-color: #ef4444; }

.diag-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.65rem;
}
.diag-metric-title {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--text-main, #212529);
}
.status-indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.status-indicator-dot.healthy { background: #10b981; }
.status-indicator-dot.alert { background: #eab308; }
.status-indicator-dot.critical { background: #ef4444; }

.diag-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
}
.diag-badge.healthy { background: rgba(16, 185, 129, 0.15); color: #059669; }
.diag-badge.alert { background: rgba(234, 179, 8, 0.15); color: #b45309; }
.diag-badge.critical { background: rgba(239, 68, 68, 0.15); color: #dc2626; }

.diag-values-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  background: #f8fafc;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  margin-bottom: 0.75rem;
}
.label-tiny { font-size: 0.68rem; color: var(--text-muted, #64748b); display: block; }
.diag-current-val { font-weight: 800; font-size: 0.95rem; color: var(--text-main, #212529); }
.diag-bench-val { font-size: 0.8rem; font-weight: 600; }
.diag-body { font-size: 0.8rem; line-height: 1.45; display: flex; flex-direction: column; gap: 0.35rem; }
.diag-finding { color: var(--text-main, #334155); }

/* Decision Rules */
.decision-rule-card {
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(228, 113, 40, 0.3);
}
.rule-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.rule-icon-box {
  font-size: 1.6rem;
  background: rgba(228, 113, 40, 0.12);
  border-radius: 10px;
  padding: 0.4rem 0.65rem;
}
.rule-title { font-size: 1.1rem; font-weight: 800; color: var(--text-main, #212529); margin: 0; }
.rule-desc { font-size: 0.8rem; color: var(--text-muted, #64748b); margin: 0; }
.rule-columns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 0.85rem;
}
.rule-col { padding: 1rem; }
.col-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.45rem;
  border-radius: 4px;
  margin-bottom: 0.4rem;
  display: inline-block;
}
.badge-teal { background: rgba(0, 151, 156, 0.15); color: var(--color-primary, #00979C); }
.badge-orange { background: rgba(228, 113, 40, 0.15); color: var(--color-accent, #E47128); }
.badge-green { background: rgba(16, 185, 129, 0.15); color: #059669; }
.rule-col h4 { font-size: 0.95rem; font-weight: 700; color: var(--text-main, #212529); margin-bottom: 0.35rem; }
.rule-col p { font-size: 0.8rem; color: var(--text-main, #334155); line-height: 1.45; margin-bottom: 0.5rem; }
.rule-actions-list { padding-left: 1rem; font-size: 0.8rem; color: var(--text-main, #334155); line-height: 1.45; margin-bottom: 0.5rem; }
.rule-tip-box { background: #ffffff; border: 1px solid rgba(0, 0, 0, 0.08); padding: 0.45rem 0.65rem; border-radius: 6px; font-size: 0.75rem; color: var(--text-muted, #64748b); }
.rule-tip-box.caution { color: #b45309; border-color: rgba(234, 179, 8, 0.3); background: rgba(234, 179, 8, 0.06); }

/* Benchmark Table */
.benchmarks-table-card { padding: 1.25rem; }
.table-header-clean { margin-bottom: 1rem; }
.card-title { font-size: 1.1rem; font-weight: 800; color: var(--text-main, #212529); margin: 0 0 0.2rem 0; }
.card-subtitle { font-size: 0.8rem; color: var(--text-muted, #64748b); }
.table-responsive { overflow-x: auto; }
.benchmark-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.benchmark-table th {
  text-align: left;
  padding: 0.65rem 0.85rem;
  background: #f1f5f9;
  color: var(--text-main, #334155);
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 700;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}
.benchmark-table td { padding: 0.75rem 0.85rem; border-bottom: 1px solid rgba(0, 0, 0, 0.06); color: var(--text-main, #334155); }
.badge-pill { padding: 0.15rem 0.5rem; border-radius: 999px; font-size: 0.72rem; font-weight: 700; }
.badge-pill.good { background: rgba(16, 185, 129, 0.15); color: #059669; }
.badge-pill.warning { background: rgba(234, 179, 8, 0.15); color: #b45309; }
.badge-pill.danger { background: rgba(239, 68, 68, 0.15); color: #dc2626; }

/* Comparer Bar Chart */
.chart-container-card { padding: 1.5rem; margin-bottom: 1.5rem; }
.chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.chart-title { font-size: 1.1rem; font-weight: 800; color: var(--text-main, #212529); }
.chart-badge { background: rgba(0, 151, 156, 0.15); color: var(--color-primary, #00979C); font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.55rem; border-radius: 6px; }
.bar-chart-visual {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1.25rem;
  align-items: flex-end;
  min-height: 250px;
  padding: 1.5rem 1rem 0;
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
}
.chart-bar-group { display: flex; flex-direction: column; align-items: center; height: 100%; }
.bar-column-wrapper { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 180px; width: 100%; }
.bar-value-label { font-size: 1.05rem; font-weight: 800; margin-bottom: 0.35rem; }
.bar-pillar { width: 50px; border-radius: 6px 6px 0 0; transition: height 0.4s ease; }
.pillar-teal { background: linear-gradient(180deg, #00C49F 0%, #00979C 100%); }
.pillar-orange { background: linear-gradient(180deg, #E47128 0%, #c95e1c 100%); }
.pillar-green { background: linear-gradient(180deg, #10b981 0%, #059669 100%); }
.pillar-gold { background: linear-gradient(180deg, #facc15 0%, #ca8a04 100%); }
.bar-label-box { margin-top: 0.75rem; text-align: center; }
.bar-name { font-size: 0.85rem; font-weight: 700; color: var(--text-main, #212529); display: block; }
.bar-sub { font-size: 0.7rem; color: var(--text-muted, #64748b); }
.active-sim-group .bar-name { color: #E47128; }

.strategy-explainer-card { display: flex; gap: 1rem; padding: 1.25rem; border-left: 4px solid var(--color-primary, #00979C); }
.explainer-icon { font-size: 1.8rem; }
.explainer-text h3 { font-size: 1.05rem; font-weight: 800; color: var(--text-main, #212529); margin: 0 0 0.35rem 0; }
.explainer-text p { font-size: 0.82rem; color: var(--text-main, #334155); line-height: 1.5; margin: 0 0 0.5rem 0; }
.explainer-list { list-style: none; padding-left: 0; font-size: 0.82rem; line-height: 1.55; color: var(--text-main, #212529); margin: 0; }

/* CRUD History Table */
.history-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 1rem; }
.history-actions { display: flex; align-items: center; gap: 0.65rem; }
.search-filter-input { width: 240px; }
.scenarios-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.scenarios-table th {
  text-align: left;
  padding: 0.65rem 0.85rem;
  background: #f1f5f9;
  color: var(--text-main, #334155);
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 700;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}
.scenarios-table td { padding: 0.75rem 0.85rem; border-bottom: 1px solid rgba(0, 0, 0, 0.06); color: var(--text-main, #334155); }
.selected-row { background: rgba(0, 151, 156, 0.08); }
.sc-name { color: var(--text-main, #212529); font-size: 0.88rem; }
.sc-sub { font-size: 0.7rem; color: var(--text-muted, #64748b); }
.type-pill { font-size: 0.7rem; font-weight: 600; padding: 0.15rem 0.45rem; border-radius: 4px; background: rgba(0, 0, 0, 0.06); color: var(--text-main, #334155); }
.type-pill.cold_traffic { background: rgba(0, 151, 156, 0.15); color: var(--color-primary, #00979C); }
.type-pill.retargeting { background: rgba(168, 85, 247, 0.15); color: #7e22ce; }
.type-pill.advantage_plus { background: rgba(16, 185, 129, 0.15); color: #059669; }
.type-pill.bundle_launch { background: rgba(228, 113, 40, 0.15); color: var(--color-accent, #E47128); }

.roas-pill { padding: 0.15rem 0.45rem; border-radius: 5px; font-size: 0.82rem; }
.roas-high { background: rgba(16, 185, 129, 0.15); color: #059669; }
.roas-mid { background: rgba(234, 179, 8, 0.15); color: #b45309; }
.roas-low { background: rgba(239, 68, 68, 0.15); color: #dc2626; }

.text-teal { color: var(--color-primary, #00979C); }
.text-orange { color: var(--color-accent, #E47128); }
.text-success { color: #059669; }
.text-warning { color: #b45309; }
.text-danger { color: #dc2626; }
.text-yellow { color: #b45309; }
.text-right { text-align: right; }

.action-buttons-group { display: flex; justify-content: flex-end; gap: 0.35rem; }
.action-icon-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.3rem 0.55rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
}
.btn-load { background: rgba(0, 151, 156, 0.15); color: var(--color-primary, #00979C); border-color: rgba(0, 151, 156, 0.3); }
.btn-load:hover { background: rgba(0, 151, 156, 0.25); }
.btn-delete { background: rgba(239, 68, 68, 0.1); color: #dc2626; border-color: rgba(239, 68, 68, 0.2); }
.btn-delete:hover { background: rgba(239, 68, 68, 0.2); }
.empty-state { text-align: center; padding: 2rem !important; color: var(--text-muted, #64748b); }

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-in { animation: fadeIn 0.2s ease forwards; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(3px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

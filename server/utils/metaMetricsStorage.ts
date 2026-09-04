import { useRuntimeConfig } from '#imports'
import { fetchNocoDB } from './nocodb'

export interface MetaCampaignScenario {
  id: string;
  name: string;
  campaignType: 'cold_traffic' | 'retargeting' | 'advantage_plus' | 'lead_messages' | 'bundle_launch';
  targetAudience: string;
  productType: 'single_component' | 'kit_bundle' | 'combo_maker' | 'custom';
  date: string;
  notes?: string;

  // Tree Nodes & Master Formula Inputs
  precioMedio: number;        // Average Unit Price ($)
  cantidadMedia: number;      // Average Units per Order (e.g. 1.0, 1.5, 2.0)
  aov: number;                // AOV = precioMedio * cantidadMedia ($)
  cpm: number;                // Cost per 1,000 Impressions ($)
  ctr: number;                // Click-Through Rate unique / link (%)
  cpc: number;                // CPC = (CPM / 1000) / (CTR / 100) ($)
  cvr: number;                // Conversion Rate checkout / landing (%)
  cpa: number;                // CPA = CPC / (CVR / 100) ($)
  roas: number;               // ROAS = AOV / CPA (x)

  // Additional Meta Ads parameters & Profitability
  frecuencia?: number;        // Ad Frequency (e.g., 1.4, 2.3)
  ctrTodos?: number;          // Total CTR (%)
  margenBrutoPct?: number;    // Gross Margin (%) e.g. 35%
  inversionSimulada?: number; // Simulated Ad Spend ($)
  tasaCierreMensajes?: number;// Lead to Sale Close Rate (%) for WhatsApp campaigns
  diasCampana?: number;       // Campaign running days (for 3-day decision rule)
  
  // Status and Health
  healthStatus?: 'saludable' | 'alerta' | 'critico';
  createdAt?: string;
  updatedAt?: string;
}

export const DEFAULT_SCENARIOS: MetaCampaignScenario[] = [
  {
    id: 'sc-1',
    name: 'Componente Suelto (ESP32-WROOM) - Audiencia Fría',
    campaignType: 'cold_traffic',
    targetAudience: 'Ingenieros & Makers (Intereses: Arduino, IoT, ESP32)',
    productType: 'single_component',
    date: new Date().toISOString().split('T')[0],
    notes: 'Venta de microcontrolador individual sin empaquetar. Margen ajustado por bajo ticket promedio.',
    precioMedio: 25.00,
    cantidadMedia: 1.0,
    aov: 25.00,
    cpm: 3.00,
    ctr: 2.0,
    cpc: 0.15,
    cvr: 3.0,
    cpa: 5.00,
    roas: 5.0,
    frecuencia: 1.6,
    ctrTodos: 2.8,
    margenBrutoPct: 35,
    inversionSimulada: 100,
    diasCampana: 7,
    healthStatus: 'saludable'
  },
  {
    id: 'sc-2',
    name: 'Kit IoT Starter Bundle (ESP32 + Sensores + Protoboard + Cables)',
    campaignType: 'cold_traffic',
    targetAudience: 'Estudiantes de Ingeniería & Makers DIY',
    productType: 'kit_bundle',
    date: new Date().toISOString().split('T')[0],
    notes: 'Estrategia Solution-Based: bundle empaquetado para elevar el AOV a $60, permitiendo pujar con más margen en subasta.',
    precioMedio: 60.00,
    cantidadMedia: 1.0,
    aov: 60.00,
    cpm: 3.00,
    ctr: 2.0,
    cpc: 0.15,
    cvr: 3.0,
    cpa: 5.00,
    roas: 12.0,
    frecuencia: 1.5,
    ctrTodos: 3.1,
    margenBrutoPct: 45,
    inversionSimulada: 200,
    diasCampana: 5,
    healthStatus: 'saludable'
  },
  {
    id: 'sc-3',
    name: 'Kit Robótica Educativa & STEM (Arduino Uno + Motores + Chasis)',
    campaignType: 'advantage_plus',
    targetAudience: 'Padres, Docentes & Makers',
    productType: 'kit_bundle',
    date: new Date().toISOString().split('T')[0],
    notes: 'Solución completa educativa con tutoriales. Alto valor percibido y excelente AOV.',
    precioMedio: 85.00,
    cantidadMedia: 1.0,
    aov: 85.00,
    cpm: 3.50,
    ctr: 2.2,
    cpc: 0.159,
    cvr: 2.8,
    cpa: 5.68,
    roas: 14.96,
    frecuencia: 1.8,
    ctrTodos: 3.4,
    margenBrutoPct: 50,
    inversionSimulada: 300,
    diasCampana: 10,
    healthStatus: 'saludable'
  },
  {
    id: 'sc-4',
    name: 'Kit Domótica WiFi ESP32 (Relés + Sensores DHT22 + App)',
    campaignType: 'cold_traffic',
    targetAudience: 'Técnicos electricistas, ingenieros mecatrónicos & hobistas',
    productType: 'kit_bundle',
    date: new Date().toISOString().split('T')[0],
    notes: 'Kit solución con código base listo. Resuelve el dolor de automatizar iluminación y clima.',
    precioMedio: 70.00,
    cantidadMedia: 1.0,
    aov: 70.00,
    cpm: 3.20,
    ctr: 1.8,
    cpc: 0.178,
    cvr: 2.5,
    cpa: 7.11,
    roas: 9.85,
    frecuencia: 1.9,
    ctrTodos: 2.9,
    margenBrutoPct: 42,
    inversionSimulada: 150,
    diasCampana: 6,
    healthStatus: 'saludable'
  },
  {
    id: 'sc-5',
    name: 'Campaña Retargeting 75% Video (Compradores Tibios)',
    campaignType: 'retargeting',
    targetAudience: 'Visitantes que vieron ≥75% de demos de producto en últimos 30d',
    productType: 'combo_maker',
    date: new Date().toISOString().split('T')[0],
    notes: 'Público que ya conoce el producto. CTR y CVR más altos, CPM ligeramente superior.',
    precioMedio: 45.00,
    cantidadMedia: 1.0,
    aov: 45.00,
    cpm: 4.50,
    ctr: 3.2,
    cpc: 0.141,
    cvr: 4.5,
    cpa: 3.13,
    roas: 14.38,
    frecuencia: 2.6,
    ctrTodos: 4.8,
    margenBrutoPct: 40,
    inversionSimulada: 150,
    diasCampana: 14,
    healthStatus: 'saludable'
  },
  {
    id: 'sc-6',
    name: 'Alerta Saturación: Campaña Antorcha Makers (Fatiga Creativa)',
    campaignType: 'cold_traffic',
    targetAudience: 'Audiencia fría saturada',
    productType: 'single_component',
    date: new Date().toISOString().split('T')[0],
    notes: 'Ejemplo con fatiga: Frecuencia > 2.0 y CTR < 1.0%. Requiere rotación de creativos inmediata.',
    precioMedio: 20.00,
    cantidadMedia: 1.0,
    aov: 20.00,
    cpm: 5.20,
    ctr: 0.8,
    cpc: 0.65,
    cvr: 1.5,
    cpa: 43.33,
    roas: 0.46,
    frecuencia: 2.7,
    ctrTodos: 1.2,
    margenBrutoPct: 30,
    inversionSimulada: 100,
    diasCampana: 8,
    healthStatus: 'critico'
  }
];

// In-memory cache of scenarios
let inMemoryScenarios: MetaCampaignScenario[] = [...DEFAULT_SCENARIOS];

export const calculateMetaMetrics = (inputs: {
  precioMedio: number;
  cantidadMedia: number;
  cpm: number;
  ctr: number;
  cvr: number;
  margenBrutoPct?: number;
  frecuencia?: number;
}) => {
  const precioMedio = Number(inputs.precioMedio) || 0;
  const cantidadMedia = Number(inputs.cantidadMedia) || 1;
  const aov = Number((precioMedio * cantidadMedia).toFixed(2));
  
  const cpm = Number(inputs.cpm) || 0;
  const ctr = Number(inputs.ctr) || 0.001; // avoid / 0
  const cvr = Number(inputs.cvr) || 0.001; // avoid / 0

  // CPC = (CPM / 1000) / (CTR / 100)
  const cpc = ctr > 0 ? Number(((cpm / 1000) / (ctr / 100)).toFixed(4)) : 0;

  // CPA = CPC / (CVR / 100)
  const cpa = cvr > 0 ? Number((cpc / (cvr / 100)).toFixed(2)) : 0;

  // ROAS = AOV / CPA
  const roas = cpa > 0 ? Number((aov / cpa).toFixed(2)) : 0;

  // Health diagnosis based on ArduinoHN technical niche benchmarks
  let healthStatus: 'saludable' | 'alerta' | 'critico' = 'saludable';
  const frecuencia = inputs.frecuencia || 1.0;
  const margenBrutoPct = inputs.margenBrutoPct || 35;
  const margenBrutoDinero = (aov * (margenBrutoPct / 100));

  if (roas < 2.0 || (cpa > margenBrutoDinero && cpa > 0) || (ctr < 0.8 && cpm > 4.0)) {
    healthStatus = 'critico';
  } else if (ctr < 1.0 || cvr < 2.0 || frecuencia > 2.0 || roas < 3.0) {
    healthStatus = 'alerta';
  }

  return {
    aov,
    cpc,
    cpa,
    roas,
    healthStatus
  };
};

export const getAllMetaScenarios = async (): Promise<MetaCampaignScenario[]> => {
  const config = useRuntimeConfig();
  const tableId = (config.public as any).nocodbMetaMetricsTable || 'm_meta_metrics_scenarios';

  try {
    const response: any = await fetchNocoDB(tableId, '?sort=-CreatedAt&limit=100');
    if (response && response.list && response.list.length > 0) {
      return response.list.map((row: any) => ({
        id: String(row.Id || row.id || row.scenario_id),
        name: row.name || row.scenario_name || 'Escenario sin nombre',
        campaignType: row.campaign_type || 'cold_traffic',
        targetAudience: row.target_audience || '',
        productType: row.product_type || 'single_component',
        date: row.date || row.evaluation_date || new Date().toISOString().split('T')[0],
        notes: row.notes || '',
        precioMedio: Number(row.precio_medio) || 0,
        cantidadMedia: Number(row.cantidad_media) || 1,
        aov: Number(row.aov) || 0,
        cpm: Number(row.cpm) || 0,
        ctr: Number(row.ctr) || 0,
        cpc: Number(row.cpc) || 0,
        cvr: Number(row.cvr) || 0,
        cpa: Number(row.cpa) || 0,
        roas: Number(row.roas) || 0,
        frecuencia: Number(row.frecuencia) || 1.0,
        ctrTodos: Number(row.ctr_todos) || 0,
        margenBrutoPct: Number(row.margen_bruto_pct) || 35,
        inversionSimulada: Number(row.inversion_simulada) || 100,
        tasaCierreMensajes: Number(row.tasa_cierre_mensajes) || 5,
        diasCampana: Number(row.dias_campana) || 3,
        healthStatus: row.health_status || 'saludable',
        createdAt: row.CreatedAt || row.created_at,
        updatedAt: row.UpdatedAt || row.updated_at
      }));
    }
  } catch (error) {
    console.warn('Using in-memory Meta scenarios (NocoDB table optional/offline):', (error as any).message || error);
  }

  return inMemoryScenarios;
};

export const saveMetaScenario = async (scenarioData: Partial<MetaCampaignScenario>): Promise<MetaCampaignScenario> => {
  const calculations = calculateMetaMetrics({
    precioMedio: scenarioData.precioMedio ?? 25,
    cantidadMedia: scenarioData.cantidadMedia ?? 1,
    cpm: scenarioData.cpm ?? 3,
    ctr: scenarioData.ctr ?? 2,
    cvr: scenarioData.cvr ?? 3,
    margenBrutoPct: scenarioData.margenBrutoPct ?? 35,
    frecuencia: scenarioData.frecuencia ?? 1.5
  });

  const completeScenario: MetaCampaignScenario = {
    id: scenarioData.id || `sc-${Date.now()}`,
    name: scenarioData.name || 'Nuevo Análisis de Campaña',
    campaignType: scenarioData.campaignType || 'cold_traffic',
    targetAudience: scenarioData.targetAudience || 'Ingenieros & Makers',
    productType: scenarioData.productType || 'kit_bundle',
    date: scenarioData.date || new Date().toISOString().split('T')[0],
    notes: scenarioData.notes || '',
    precioMedio: Number(scenarioData.precioMedio) || 25,
    cantidadMedia: Number(scenarioData.cantidadMedia) || 1,
    aov: calculations.aov,
    cpm: Number(scenarioData.cpm) || 3,
    ctr: Number(scenarioData.ctr) || 2,
    cpc: calculations.cpc,
    cvr: Number(scenarioData.cvr) || 3,
    cpa: calculations.cpa,
    roas: calculations.roas,
    frecuencia: Number(scenarioData.frecuencia) || 1.5,
    ctrTodos: Number(scenarioData.ctrTodos) || 2.5,
    margenBrutoPct: Number(scenarioData.margenBrutoPct) || 35,
    inversionSimulada: Number(scenarioData.inversionSimulada) || 100,
    tasaCierreMensajes: Number(scenarioData.tasaCierreMensajes) || 5,
    diasCampana: Number(scenarioData.diasCampana) || 3,
    healthStatus: calculations.healthStatus,
    updatedAt: new Date().toISOString()
  };

  // Update in-memory cache
  const existingIdx = inMemoryScenarios.findIndex(s => s.id === completeScenario.id);
  if (existingIdx >= 0) {
    inMemoryScenarios[existingIdx] = completeScenario;
  } else {
    inMemoryScenarios.unshift(completeScenario);
  }

  // Attempt NocoDB sync
  const config = useRuntimeConfig();
  const tableId = (config.public as any).nocodbMetaMetricsTable || 'm_meta_metrics_scenarios';

  try {
    const payload = {
      scenario_name: completeScenario.name,
      campaign_type: completeScenario.campaignType,
      target_audience: completeScenario.targetAudience,
      product_type: completeScenario.productType,
      evaluation_date: completeScenario.date,
      notes: completeScenario.notes,
      precio_medio: completeScenario.precioMedio,
      cantidad_media: completeScenario.cantidadMedia,
      aov: completeScenario.aov,
      cpm: completeScenario.cpm,
      ctr: completeScenario.ctr,
      cpc: completeScenario.cpc,
      cvr: completeScenario.cvr,
      cpa: completeScenario.cpa,
      roas: completeScenario.roas,
      frecuencia: completeScenario.frecuencia,
      ctr_todos: completeScenario.ctrTodos,
      margen_bruto_pct: completeScenario.margenBrutoPct,
      inversion_simulada: completeScenario.inversionSimulada,
      tasa_cierre_mensajes: completeScenario.tasaCierreMensajes,
      dias_campana: completeScenario.diasCampana,
      health_status: completeScenario.healthStatus
    };

    if (existingIdx >= 0) {
      await fetchNocoDB(tableId, '', {
        method: 'PATCH',
        body: { Id: completeScenario.id, id: completeScenario.id, ...payload }
      });
    } else {
      const response: any = await fetchNocoDB(tableId, '', {
        method: 'POST',
        body: payload
      });
      if (response && (response.Id || response.id)) {
        completeScenario.id = String(response.Id || response.id);
      }
    }
  } catch (err) {
    console.warn('Saved Meta scenario in local memory (NocoDB sync optional):', (err as any).message || err);
  }

  return completeScenario;
};

export const deleteMetaScenario = async (id: string): Promise<boolean> => {
  inMemoryScenarios = inMemoryScenarios.filter(s => s.id !== id);

  const config = useRuntimeConfig();
  const tableId = (config.public as any).nocodbMetaMetricsTable || 'm_meta_metrics_scenarios';

  try {
    await fetchNocoDB(tableId, '', {
      method: 'DELETE',
      body: { Id: id, id }
    });
  } catch (err) {
    console.warn('Deleted from memory (NocoDB deletion optional):', (err as any).message || err);
  }

  return true;
};

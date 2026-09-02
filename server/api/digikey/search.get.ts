import { getLoyaltyConfig } from '../../utils/loyaltyStorage';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  let rawKeyword = (query.q as string || 'microcontroller').trim();
  const limit = Math.min(Math.max(Number(query.limit) || 24, 1), 50);
  const offset = Math.max(Number(query.offset) || 0, 0);
  const inStockOnly = query.inStockOnly === 'true' || query.inStockOnly === '1';

  const config = useRuntimeConfig();
  const dbConfig = await getLoyaltyConfig().catch(() => null);
  const profitMargin = dbConfig?.digikeyProfitMargin || Number(config.digikeyProfitMargin) || 2.0;

  // Normalización inteligente de términos de búsqueda frecuentes
  let keyword = rawKeyword;
  const kwLower = rawKeyword.toLowerCase();
  if (kwLower === '555' || kwLower === 'ci 555' || kwLower === 'ic 555') {
    keyword = 'NE555';
  } else if (kwLower === 'resistors' || kwLower === 'resistencias' || kwLower === 'resistencia') {
    keyword = 'Resistor';
  } else if (kwLower === 'capacitors' || kwLower === 'condensadores' || kwLower === 'capacitores') {
    keyword = 'Capacitor';
  } else if (kwLower === 'diodes' || kwLower === 'diodos') {
    keyword = 'Diode';
  } else if (kwLower === 'transistors' || kwLower === 'transistores') {
    keyword = 'Transistor';
  } else if (kwLower === 'opamp' || kwLower === 'op-amp' || kwLower === 'amplificador operacional') {
    keyword = 'Operational Amplifier';
  }

  const payload: Record<string, any> = {
    Keywords: keyword,
    Limit: limit,
    Offset: offset
  };

  if (inStockOnly) {
    payload.FilterOptionsRequest = {
      InStock: 'true'
    };
  }

  try {
    const rawData = await fetchDigikeyApi<{
      ProductsCount?: number;
      ExactManufacturerProductsCount?: number;
      Products?: any[];
      FilterOptions?: any;
    }>('/products/v4/search/keyword', {
      method: 'POST',
      body: payload
    });

    const products = (rawData.Products || []).map((p: any) => {
      // 1. Determinar precio base unitario
      let baseUnitPriceUSD = p.UnitPrice || 0;
      if (!baseUnitPriceUSD && p.StandardPricing && p.StandardPricing.length > 0) {
        baseUnitPriceUSD = p.StandardPricing[0].UnitPrice || 0;
      } else if (!baseUnitPriceUSD && p.ProductVariations && p.ProductVariations.length > 0) {
        const v = p.ProductVariations[0];
        if (v.StandardPricing && v.StandardPricing.length > 0) {
          baseUnitPriceUSD = v.StandardPricing[0].UnitPrice || 0;
        }
      }

      const finalPriceUSD = Number((baseUnitPriceUSD * profitMargin).toFixed(2));

      // 2. Mapear escalas de precio
      const rawPriceBreaks = (p.StandardPricing && p.StandardPricing.length > 0)
        ? p.StandardPricing
        : (p.ProductVariations?.[0]?.StandardPricing || []);
      const priceBreaks = rawPriceBreaks.map((pb: any) => ({
        breakQuantity: pb.BreakQuantity,
        unitPriceUSD: Number((pb.UnitPrice * profitMargin).toFixed(2)),
        totalPriceUSD: Number((pb.TotalPrice * profitMargin).toFixed(2))
      }));

      // 3. Normalizar descripción (DigiKey V4 usa objeto p.Description)
      const productDesc = p.Description?.ProductDescription || p.ProductDescription || p.ManufacturerProductNumber;
      const detailedDesc = p.Description?.DetailedDescription || p.DetailedDescription || productDesc;

      // 4. SKU de DigiKey
      const dkSku = p.DigiKeyPartNumber || p.ProductVariations?.[0]?.DigiKeyProductNumber || p.ManufacturerProductNumber;

      // 5. Normalizar foto
      let image = p.PrimaryPhoto || p.PhotoUrl || '';
      if (image && !image.startsWith('http')) {
        image = 'https:' + (image.startsWith('//') ? image : '//' + image);
      }

      // 6. Parámetros técnicos destacados
      const parameters = (p.Parameters || []).map((param: any) => ({
        id: param.ParameterId,
        name: param.ParameterText,
        value: param.ValueText
      }));

      // 7. Cantidad Mínima y Monto Mínimo para elementos que valen centavos
      const rawMinQty = p.MinimumOrderQuantity || p.ProductVariations?.[0]?.MinimumOrderQuantity || 1;
      let minQty = Math.max(1, rawMinQty);
      
      // Si el precio unitario es menor a $0.10 USD (o menor a $0.25 USD) y el empaque permite compra fraccionada,
      // establecemos un lote/pack mínimo para que no se venda una unidad suelta de centavos
      if (finalPriceUSD > 0 && finalPriceUSD < 0.10 && minQty === 1) {
        minQty = 10;
      } else if (finalPriceUSD >= 0.10 && finalPriceUSD < 0.25 && minQty === 1) {
        minQty = 5;
      }

      return {
        id: dkSku || p.ManufacturerProductNumber,
        digiKeyPartNumber: dkSku,
        manufacturerPartNumber: p.ManufacturerProductNumber,
        title: productDesc,
        description: productDesc,
        detailedDescription: detailedDesc,
        manufacturer: p.Manufacturer?.Name || 'Genérico',
        category: p.Category?.Name || 'Semiconductores',
        series: p.Series?.Name || '',
        status: p.ProductStatus?.Status || 'Activo',
        stock: p.QuantityAvailable || 0,
        inStock: (p.QuantityAvailable || 0) > 0,
        minimumOrderQuantity: minQty,
        basePriceUSD: baseUnitPriceUSD,
        priceUSD: finalPriceUSD,
        priceBreaks,
        image: image || '/placeholder-chip.svg',
        datasheetUrl: p.DatasheetUrl || null,
        productUrl: p.ProductUrl || null,
        parameters
      };
    });

    return {
      success: true,
      totalCount: rawData.ProductsCount || products.length,
      limit,
      offset,
      products
    };
  } catch (error: any) {
    console.error('Error en /api/digikey/search:', error);
    return {
      success: false,
      totalCount: 0,
      limit,
      offset,
      products: [],
      error: error?.message || 'Error al buscar en el catálogo'
    };
  }
});

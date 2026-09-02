import { getLoyaltyConfig } from '../../../utils/loyaltyStorage';

export default defineEventHandler(async (event) => {
  const partNumber = getRouterParam(event, 'partNumber');

  if (!partNumber) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Número de parte requerido'
    });
  }

  const config = useRuntimeConfig();
  const dbConfig = await getLoyaltyConfig().catch(() => null);
  const profitMargin = dbConfig?.digikeyProfitMargin || Number(config.digikeyProfitMargin) || 2.0;

  try {
    const raw = await fetchDigikeyApi<any>(
      `/products/v4/search/${encodeURIComponent(partNumber)}/productdetails`,
      { method: 'GET' }
    );

    const p = raw.Product || raw;

    // 0. Seleccionar la mejor variación al detalle (Cut Tape / Bulk / Unitario)
    const bestVar = selectBestRetailVariation(p);

    let baseUnitPriceUSD = p.UnitPrice || 0;
    if (bestVar?.StandardPricing && bestVar.StandardPricing.length > 0) {
      baseUnitPriceUSD = bestVar.StandardPricing[0].UnitPrice || 0;
    } else if (!baseUnitPriceUSD && p.StandardPricing && p.StandardPricing.length > 0) {
      baseUnitPriceUSD = p.StandardPricing[0].UnitPrice || 0;
    }

    const finalPriceUSD = Number((baseUnitPriceUSD * profitMargin).toFixed(2));

    const rawPriceBreaks = (bestVar?.StandardPricing && bestVar.StandardPricing.length > 0)
      ? bestVar.StandardPricing
      : (p.StandardPricing && p.StandardPricing.length > 0)
        ? p.StandardPricing
        : (p.ProductVariations?.[0]?.StandardPricing || []);

    const priceBreaks = rawPriceBreaks.map((pb: any) => ({
      breakQuantity: pb.BreakQuantity,
      unitPriceUSD: Number((pb.UnitPrice * profitMargin).toFixed(2)),
      totalPriceUSD: Number((pb.TotalPrice * profitMargin).toFixed(2))
    }));

    const productDesc = p.Description?.ProductDescription || p.ProductDescription || p.ManufacturerProductNumber;
    const detailedDesc = p.Description?.DetailedDescription || p.DetailedDescription || productDesc;
    const dkSku = bestVar?.DigiKeyProductNumber || p.DigiKeyPartNumber || p.ManufacturerProductNumber;

    let image = p.PrimaryPhoto || p.PhotoUrl || '';
    if (image && !image.startsWith('http')) {
      image = 'https:' + (image.startsWith('//') ? image : '//' + image);
    }

    const parameters = (p.Parameters || []).map((param: any) => ({
      id: param.ParameterId,
      name: param.ParameterText,
      value: param.ValueText
    }));

    const rawMinQty = bestVar?.MinimumOrderQuantity || p.MinimumOrderQuantity || 1;
    let minQty = Math.max(1, rawMinQty);
    if (finalPriceUSD > 0 && finalPriceUSD < 0.10 && minQty === 1) {
      minQty = 10;
    } else if (finalPriceUSD >= 0.10 && finalPriceUSD < 0.25 && minQty === 1) {
      minQty = 5;
    }

    const pkgName = bestVar?.PackageType?.Name || p.Packaging?.Name || p.ProductVariations?.[0]?.PackageType?.Name || 'Estándar';

    return {
      success: true,
      product: {
        id: dkSku || p.ManufacturerProductNumber,
        digiKeyPartNumber: dkSku,
        manufacturerPartNumber: p.ManufacturerProductNumber,
        title: productDesc,
        description: productDesc,
        detailedDescription: detailedDesc,
        manufacturer: p.Manufacturer?.Name || 'Genérico',
        category: p.Category?.Name || 'Semiconductores',
        family: p.Family?.Name || '',
        series: p.Series?.Name || '',
        status: p.ProductStatus?.Status || 'Activo',
        stock: bestVar?.QuantityAvailableforPackageType || p.QuantityAvailable || 0,
        inStock: (bestVar?.QuantityAvailableforPackageType || p.QuantityAvailable || 0) > 0,
        leadTimeWeeks: p.ManufacturerLeadWeeks || null,
        minimumOrderQuantity: minQty,
        basePriceUSD: baseUnitPriceUSD,
        priceUSD: finalPriceUSD,
        priceBreaks,
        image: image || '/placeholder-chip.svg',
        datasheetUrl: p.DatasheetUrl || null,
        productUrl: p.ProductUrl || null,
        parameters,
        packaging: pkgName,
        rohsStatus: p.RohsStatus || p.Classifications?.RohsStatus || 'Cumple con RoHS'
      }
    };
  } catch (error: any) {
    console.error(`Error en /api/digikey/part/${partNumber}:`, error);
    throw createError({
      statusCode: error?.statusCode || 404,
      statusMessage: error?.statusMessage || `No se encontró el componente "${partNumber}" en el catálogo`
    });
  }
});

/**
 * Determina la imagen adecuada o un placeholder temático de alta calidad
 * según el tipo de componente electrónico.
 */
export function getComponentPlaceholder(product?: { 
  category?: string; 
  title?: string; 
  description?: string; 
  manufacturerPartNumber?: string;
  image?: string;
}): string {
  const text = `${product?.category || ''} ${product?.title || ''} ${product?.description || ''} ${product?.manufacturerPartNumber || ''}`.toLowerCase();

  if (text.includes('resistor') || text.includes('resistencia') || text.includes('potentiometer') || text.includes('potenciómetro')) {
    return '/placeholders/resistor.svg';
  }
  if (text.includes('transistor') || text.includes('mosfet') || text.includes('igbt') || text.includes('fet') || text.includes('triac')) {
    return '/placeholders/transistor.svg';
  }
  if (text.includes('capacitor') || text.includes('condensador')) {
    return '/placeholders/capacitor.svg';
  }
  if (text.includes('diode') || text.includes('diodo') || text.includes('rectifier') || text.includes('rectificador') || text.includes('zener') || text.includes('schottky')) {
    return '/placeholders/diode.svg';
  }
  if (text.includes('sensor') || text.includes('transducer') || text.includes('transductor') || text.includes('detector')) {
    return '/placeholders/sensor.svg';
  }

  // Por defecto: chip/MCU de alta resolución
  return '/placeholder-chip.svg';
}

/**
 * Retorna la URL de imagen o su placeholder temático si no tiene o falla
 */
export function getComponentImage(product?: { 
  image?: string; 
  category?: string; 
  title?: string; 
  description?: string; 
  manufacturerPartNumber?: string;
}): string {
  if (product?.image && product.image.startsWith('http')) {
    return product.image;
  }
  return getComponentPlaceholder(product);
}

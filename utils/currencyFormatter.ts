export function formatCurrency(value: number, currencyCode: string = 'HNL'): string {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0.00';
  }
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  } catch (e) {
    // Fallback if currency code is invalid
    return 'L. ' + new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }
}

export function formatUSD(valueInLempiras: number, exchangeRate: number): string {
  if (typeof valueInLempiras !== 'number' || isNaN(valueInLempiras) || !exchangeRate || exchangeRate <= 0) {
    return '$ 0.00';
  }
  
  const usdValue = valueInLempiras / exchangeRate;
  
  return '$ ' + new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(usdValue);
}

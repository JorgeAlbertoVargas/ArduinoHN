export function formatCurrency(value: number): string {
  if (typeof value !== 'number' || isNaN(value)) {
    return 'L. 0.00';
  }
  
  return 'L. ' + new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
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

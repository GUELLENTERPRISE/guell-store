
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback for unsupported currencies/locales
    return `$${amount.toFixed(2)}`;
  }
};

export const formatPrice = (price: number, locale?: string): string => {
  return formatCurrency(price, 'USD', locale);
};

export const getCurrencySymbol = (currency: string = 'USD'): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).formatToParts(0).find(part => part.type === 'currency')?.value || '$';
  } catch {
    return '$';
  }
};

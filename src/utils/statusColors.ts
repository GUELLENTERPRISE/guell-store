export const PAYMENT_TYPE_COLORS: Record<string, string> = {
  card: 'bg-orange-50 text-orange-700 border border-orange-200',
  paypal: 'bg-orange-50 text-orange-700 border border-orange-200',
  applepay: 'bg-background dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700',
  googlepay: 'bg-background dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700',
  default: 'bg-background dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700',
};

export const ADDRESS_TYPE_COLORS: Record<string, string> = {
  home: 'bg-orange-50 text-orange-700',
  work: 'bg-muted dark:bg-gray-800 text-gray-700 dark:text-gray-200',
  other: 'bg-muted dark:bg-gray-800 text-gray-700 dark:text-gray-200',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-muted dark:bg-gray-800 text-gray-700 dark:text-gray-200',
  confirmed: 'bg-orange-50 text-orange-700',
  preparing: 'bg-orange-100 text-orange-800',
  ready: 'bg-orange-100 text-orange-800',
  delivering: 'bg-orange-200 text-orange-900',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-50 text-red-700',
  delivered: 'bg-green-100 text-green-800',
};

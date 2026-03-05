export const formatCurrency = (value, currency = 'KES') => {
  if (isNaN(value)) return 'N/A';

  return new Intl.NumberFormat('en-KES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

}

export function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-KE', options);
}
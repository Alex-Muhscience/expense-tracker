export const formatCurrencyInput = (value) => {
  if (!value) return '';

  // Remove all non-digit characters except decimal point
  const cleaned = value.replace(/[^\d.]/g, '');

  // Ensure only one decimal point
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    return `${parts[0]}.${parts[1]}`;
  }

  return cleaned;
};

export const validateAmount = (value) => {
  if (!value) return 'Amount is required';

  const numValue = parseFloat(value);
  if (isNaN(numValue)) return 'Please enter a valid number';
  if (numValue <= 0) return 'Amount must be greater than zero';
  if (numValue > 1000000) return 'Amount is too large';

  return '';
};

// Add to helpers.js
export const formatDateWithTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
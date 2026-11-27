export const formatRupiah = (amount?: number): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'Rp 0';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const parseSalaryString = (salaryStr?: string): number => {
  if (!salaryStr) return 0;
  // Remove non-digit characters
  const cleaned = salaryStr.replace(/[^\d]/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
};

export const formatDisplayDate = (dateStr?: string): string => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
};

export const formatDisplayDateTime = (dateTimeStr?: string): string => {
  if (!dateTimeStr) return '-';
  const d = new Date(dateTimeStr);
  if (isNaN(d.getTime())) return dateTimeStr;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
};

export const formatCurrency = (value: number, currency: string = 'KRW', locale: string = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

export const formatDate = (dateStr: string, locale: string = 'en-GB') => {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

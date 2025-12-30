export const formatCurrency = (value: number, currency: string = 'KRW', locale: string = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

export const formatDate = (dateStr: string, mode: string | null = 'default') => {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  const weekDays = ['일', '월', '화', '수', '목', '금', '토']
  const dayOfWeek = weekDays[date.getDay()]

  if (mode === 'ko') {
    return `${month}월 ${day}일 ${dayOfWeek}요일`
  } else if (mode === 'short') {
    //25.10.10
    return `${String(year).slice(2)}.${month}.${day}`
  }
  return `${year}.${month}.${day}`
}

export const formatTime = (timeStr: string | null | undefined) => {
  if (!timeStr) return ''

  const [hourStr, minuteStr] = timeStr.split(':')
  const hour = parseInt(hourStr, 10)
  const minute = minuteStr ? minuteStr.padStart(2, '0') : '00'

  const period = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour

  return `${period} ${hour12}:${minute}`
}

// 날짜 + 시간 함께 포맷팅
export const formatDateTime = (dateStr: string, timeStr?: string | null) => {
  const formattedDate = formatDate(dateStr)
  if (!timeStr) return formattedDate

  const formattedTime = formatTime(timeStr)
  return `${formattedDate}    ${formattedTime}`
}

// ✅ 로컬 시간대로 오늘 날짜 계산
export const getTodayString = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

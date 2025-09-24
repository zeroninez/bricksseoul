'use client'

import { usePathname, useRouter } from '@/i18n/routing'
import classNames from 'classnames'
import { useLocale } from 'next-intl'

interface LocaleDropdownProps {
  className?: string
}
export const LocaleDropdown = ({ className }: LocaleDropdownProps) => {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const locale = e.target.value
    router.push({ pathname }, { locale })
  }

  return (
    <select value={locale} onChange={handleChange} className={classNames('border rounded p-1', className)}>
      <option value='en'>English</option>
      <option value='ko'>한국어</option>
    </select>
  )
}

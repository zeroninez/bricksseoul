'use client'

import { usePathname, useRouter } from '@/i18n/routing'
import classNames from 'classnames'
import { useLocale, useTranslations } from 'next-intl'
import { Input } from './Input'

interface LocaleDropdownProps {
  className?: string
}
export const LocaleDropdown = ({ className }: LocaleDropdownProps) => {
  const t = useTranslations('LoginPage')
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const locale = e.target.value
    router.push({ pathname }, { locale })
  }

  return (
    <Input
      type='select'
      value={locale}
      setValue={
        (value: string) => {
          handleChange({ target: { value } } as React.ChangeEvent<HTMLSelectElement>)
        } /* to satisfy the Input component's setValue prop */
      }
      options={[{ label: t('step2.languageSelect.options.en'), value: 'en' }]}
    />
  )
}

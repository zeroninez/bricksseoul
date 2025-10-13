// src/components/AccessPage.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useUserTypeStore } from '@/stores'
import { Logo, Screen, LocaleDropdown, Input, Button } from '.'
import { FaRegKeyboard } from 'react-icons/fa6'

import { useTranslations } from 'next-intl'
import classNames from 'classnames'
import { motion } from 'motion/react'

export const AccessPage = () => {
  const t = useTranslations('LoginPage')

  const [step, setStep] = useState(0)
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, validateAccessCode } = useAuth()
  const { userType, setUserType } = useUserTypeStore()
  const [language, setLanguage] = useState('en')

  const getClientIP = async (): Promise<string | null> => {
    try {
      const res = await fetch('https://api.ipify.org?format=json')
      const data = await res.json()
      return data.ip
    } catch (err) {
      console.error('Failed to fetch IP address:', err)
      return null
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return

    setIsLoading(true)
    setError('')
    const accessCodeData = await validateAccessCode(code.trim())
    if (!accessCodeData) {
      setError(t('step1.input.error'))
      setIsLoading(false)
      return
    }
    setStep(1)
    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    // const location = await ipify({ useIPv6: false })

    e.preventDefault()
    if (!code.trim()) return

    setIsLoading(true)
    setError('')

    const ip = await getClientIP()
    const success = await login(code.trim(), ip, userType!)

    if (!success) {
      setError('*Invalid invitation code. Please try again.')
    }

    setIsLoading(false)
  }

  return (
    <div
      style={{
        backgroundImage: "url('/img/intro.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      className='fixed z-10 w-screen inset-0 flex flex-col items-center justify-between'
    >
      <div className='absolute inset-0 bg-black/30 z-0' />

      <section className='w-full h-1/2 flex flex-col justify-between items-center z-10 px-6 py-6'>
        <div className='w-full flex flex-col justify-start items-start gap-1 text-white'>
          <Logo className='text-lg' />
          <div className='text-base font-light leading-none'>Place to relax</div>
        </div>

        <div className='w-full flex flex-col justify-start items-start gap-2 text-white'>
          <div className='text-xl font-bold leading-10'>{step === 0 ? t('step1.title') : t('step2.title')}</div>
          <div className='text-base leading-tight'>{step === 0 ? t('step1.description') : t('step2.description')}</div>
        </div>
      </section>
      <motion.section
        style={{
          backgroundColor: step === 0 ? 'transparent' : 'white',
        }}
        className={classNames('w-full h-1/2 flex z-10 px-6 py-6')}
      >
        {step === 0 ? (
          <form onSubmit={handleVerify} className='w-full h-full flex flex-col justify-between items-center'>
            <Input
              label='Code'
              type='text'
              id='accessCode'
              value={code}
              setValue={(v) => {
                setCode(v)
                if (error) setError('') // 값 변경 시 에러 지우기
              }}
              disabled={isLoading}
              placeholder={t('step1.input.placeholder')}
              error={error}
              required
              labelClassName='text-white'
              onFocus
              action={{
                icon: <FaRegKeyboard />,
              }}
            />
            <Button type='submit' disabled={isLoading || !code.trim()}>
              {isLoading ? t('step1.button.loading') : t('step1.button.default')}
            </Button>
          </form>
        ) : (
          <div className='w-full h-full flex flex-col'>
            <div className='w-full h-full text-zinc-800 flex flex-col gap-2 justify-start items-start'>
              <span className='text-base font-medium'>{t('step2.typeSelect.label')}</span>
              <div className='w-full flex flex-row gap-4 justify-between items-center'>
                {['personal', 'business'].map((key, i) => (
                  <button
                    key={i}
                    type='button'
                    className={classNames(
                      'w-full h-fit rounded-2xl pl-4 pr-3 py-2.5 flex flex-row justify-between items-start transition-all duration-300',
                      userType === key
                        ? 'border-2 border-primary bg-transparent'
                        : 'border-2 border-transparent bg-zinc-100',
                    )}
                    onClick={() => setUserType(key as 'personal' | 'business')}
                  >
                    <div className='w-full h-fit flex flex-col justify-center items-start'>
                      <span
                        className={classNames(
                          'font-medium transition-all duration-300',
                          userType === key ? 'text-primary' : 'text-zinc-800',
                        )}
                      >
                        {t(`step2.typeSelect.${key}.label`)}
                      </span>
                      <span className='text-zinc-400'>{t(`step2.typeSelect.${key}.description`)}</span>
                    </div>
                    <div className='w-fit h-full flex items-center justify-center'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className={classNames(
                          'w-5 h-5 transition-all duration-300',
                          userType === key ? 'text-primary' : 'text-zinc-300',
                        )}
                        viewBox='0 0 18 19'
                        fill='currentColor'
                      >
                        <path
                          fillRule='evenodd'
                          clipRule='evenodd'
                          d='M8.99609 18.5C10.178 18.5 11.3483 18.2672 12.4402 17.8149C13.5322 17.3626 14.5243 16.6997 15.3601 15.864C16.1958 15.0282 16.8587 14.0361 17.311 12.9442C17.7633 11.8522 17.9961 10.6819 17.9961 9.5C17.9961 8.3181 17.7633 7.14778 17.311 6.05585C16.8587 4.96392 16.1958 3.97177 15.3601 3.13604C14.5243 2.30031 13.5322 1.63738 12.4402 1.18508C11.3483 0.732792 10.178 0.5 8.99609 0.5C6.60915 0.5 4.31996 1.44821 2.63213 3.13604C0.944305 4.82387 -0.00390625 7.11305 -0.00390625 9.5C-0.00390625 11.8869 0.944305 14.1761 2.63213 15.864C4.31996 17.5518 6.60915 18.5 8.99609 18.5ZM8.76409 13.14L13.7641 7.14L12.2281 5.86L7.92809 11.019L5.70309 8.793L4.28909 10.207L7.28909 13.207L8.06309 13.981L8.76409 13.14Z'
                        />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className='w-full h-full text-zinc-800 flex flex-col gap-2 justify-start items-start'>
              <span className='text-base font-medium'>{t('step2.languageSelect.label')}</span>
              <LocaleDropdown />
            </div>
            <Button onClick={handleSubmit} preset='primary'>
              {isLoading ? t('step2.button.loading') : t('step2.button.default')}
            </Button>
          </div>
        )}
      </motion.section>
    </div>
  )
}

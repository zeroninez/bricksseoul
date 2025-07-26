// src/contexts/AuthContext.tsx
'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, AccessCode } from '@/lib/supabase'

interface AuthContextType {
  isAuthenticated: boolean
  accessCode: AccessCode | null
  login: (code: string, user_ip: string | null) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [accessCode, setAccessCode] = useState<AccessCode | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 페이지 로드시 로컬스토리지에서 인증 상태 확인
  useEffect(() => {
    const storedCode = localStorage.getItem('accessCode')
    const storedCodeData = localStorage.getItem('accessCodeData')

    if (storedCode && storedCodeData) {
      try {
        const parsedData = JSON.parse(storedCodeData)
        setAccessCode(parsedData)
        setIsAuthenticated(true)
      } catch (error) {
        // 데이터가 유효하지 않으면 로그아웃
        logout()
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (code: string, user_ip: string | null): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('access_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single()

      if (error || !data) {
        return false
      }

      // access_logs에 기록 추가
      await supabase.from('access_logs').insert({
        access_code_id: data.id,
        user_agent: navigator.userAgent,
        ip_address: user_ip,
      })

      // 로컬스토리지에 저장
      localStorage.setItem('accessCode', code.toUpperCase())
      localStorage.setItem('accessCodeData', JSON.stringify(data))

      setAccessCode(data)
      setIsAuthenticated(true)
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('accessCode')
    localStorage.removeItem('accessCodeData')
    setAccessCode(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        accessCode,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

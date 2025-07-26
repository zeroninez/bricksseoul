// src/contexts/AdminAuthContext.tsx
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AdminAuthContextType {
  isAuthenticated: boolean
  login: (password: string) => boolean
  logout: () => void
  isLoading: boolean
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

// 환경변수에서 관리자 비밀번호 가져오기 (fallback 포함)
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'

interface AdminAuthProviderProps {
  children: ReactNode
}

export const AdminAuthProvider = ({ children }: AdminAuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 페이지 로드 시 로컬 스토리지에서 인증 상태 확인
    const checkAuthStatus = () => {
      try {
        const authData = localStorage.getItem('admin_auth')
        if (authData) {
          const { timestamp, isAuth } = JSON.parse(authData)
          const now = Date.now()
          const hourInMs = 60 * 60 * 1000 // 1시간

          // 1시간 이내라면 자동 로그인
          if (now - timestamp < hourInMs && isAuth) {
            setIsAuthenticated(true)
          } else {
            // 시간이 지났으면 로컬 스토리지 클리어
            localStorage.removeItem('admin_auth')
          }
        }
      } catch (error) {
        console.error('Auth check error:', error)
        localStorage.removeItem('admin_auth')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)

      // 로컬 스토리지에 인증 정보 저장 (1시간 유효)
      const authData = {
        timestamp: Date.now(),
        isAuth: true,
      }
      localStorage.setItem('admin_auth', JSON.stringify(authData))

      return true
    }
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('admin_auth')
  }

  return (
    <AdminAuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}

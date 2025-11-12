// components/DeletePropertyButton.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components'
import classNames from 'classnames'

interface DeletePropertyButtonProps {
  propertyId: string
  redirectTo?: string // 삭제 후 이동할 경로 (예: '/properties')
  className?: string
}

export const DeletePropertyButton = ({
  propertyId,
  redirectTo = '/properties',
  className,
}: DeletePropertyButtonProps) => {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!propertyId) return

    const ok = confirm('이 숙소를 정말 삭제할까요? 삭제 후에는 되돌릴 수 없어요.')
    if (!ok) return

    try {
      setLoading(true)

      const res = await fetch(`/api/properties/delete?id=${encodeURIComponent(propertyId)}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? '삭제 요청에 실패했어요.')
      }

      alert('숙소가 삭제되었습니다.')
      router.push(redirectTo)
      router.refresh()
    } catch (err: any) {
      console.error(err)
      alert(err?.message ?? '삭제 중 오류가 발생했어요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type='button'
      onClick={handleDelete}
      disabled={loading}
      className={classNames('', className, loading && 'opacity-50 cursor-not-allowed')}
    >
      {loading ? '삭제 중…' : '숙소 삭제'}
    </button>
  )
}

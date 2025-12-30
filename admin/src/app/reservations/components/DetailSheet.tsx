// admin/src/components/DetailSheet.tsx
'use client'

import { Sheet } from 'react-modal-sheet'
import React, { useState, useMemo } from 'react'
import type { Reservation } from '@/types/reservation'
import { formatDateTime } from '@/utils'
import { useReservationUpdate } from '@/hooks/useReservation'
import classNames from 'classnames'

interface DetailSheetProps {
  reservation: Reservation | null
  onClose: () => void
  onUpdate?: () => void
}

export const DetailSheet = ({ reservation, onClose, onUpdate }: DetailSheetProps) => {
  const [isUpdating, setIsUpdating] = useState(false)
  const { mutate: updateReservation } = useReservationUpdate()

  // ✅ 체크인 날짜 비교 로직
  const checkInStatus = useMemo(() => {
    if (!reservation) return null

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const checkInDate = new Date(reservation.check_in_date)
    checkInDate.setHours(0, 0, 0, 0)

    const diffTime = checkInDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return {
      isPast: diffDays < 0,
      isToday: diffDays === 0,
      isFuture: diffDays > 0,
      daysUntilCheckIn: diffDays,
    }
  }, [reservation])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('복사되었습니다.')
  }

  // ✅ 예약 확정 핸들러
  const handleConfirm = () => {
    if (!reservation || !checkInStatus) return

    // ✅ 체크인 날짜가 지난 요청은 확정 불가
    if (checkInStatus.isPast) {
      alert('체크인 날짜가 이미 지난 예약은 확정할 수 없습니다.\n취소 처리해 주세요.')
      return
    }

    if (!confirm('예약을 확정하시겠습니까?')) return

    setIsUpdating(true)
    updateReservation(
      {
        id: reservation.id,
        status: 'confirmed',
      },
      {
        onSuccess: () => {
          alert('예약이 확정되었습니다.')
          onUpdate?.()
          onClose()
        },
        onError: (error) => {
          alert(error.message || '예약 확정에 실패했습니다.')
        },
        onSettled: () => {
          setIsUpdating(false)
        },
      },
    )
  }

  // ✅ 예약 취소 핸들러
  const handleCancel = () => {
    if (!reservation || !checkInStatus) return

    // ✅ requested 상태에서 체크인이 지난 경우
    if (reservation.status === 'requested' && checkInStatus.isPast) {
      if (!confirm('체크인 날짜가 지난 예약입니다.\n이 예약을 취소 처리하시겠습니까?')) {
        return
      }
    }
    // confirmed 상태에서 체크인이 지난 경우
    else if (reservation.status === 'confirmed' && checkInStatus.isPast) {
      alert('체크인 날짜가 이미 지난 예약은 취소할 수 없습니다.')
      return
    }
    // confirmed 상태에서 체크인이 오늘인 경우
    else if (reservation.status === 'confirmed' && checkInStatus.isToday) {
      if (
        !confirm(
          '오늘이 체크인 날짜입니다.\n아직 체크인하지 않은 경우에만 취소가 가능합니다.\n정말로 취소하시겠습니까?',
        )
      ) {
        return
      }
    }
    // 일반 취소 확인
    else if (!confirm('예약을 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return
    }

    setIsUpdating(true)
    updateReservation(
      {
        id: reservation.id,
        status: 'cancelled',
      },
      {
        onSuccess: () => {
          alert('예약이 취소되었습니다.')
          onUpdate?.()
          onClose()
        },
        onError: (error) => {
          alert(error.message || '예약 취소에 실패했습니다.')
        },
        onSettled: () => {
          setIsUpdating(false)
        },
      },
    )
  }

  // ✅ 상태별 버튼 표시 로직
  const renderActionButtons = () => {
    if (!reservation || !checkInStatus) return null

    switch (reservation.status) {
      case 'requested':
        // ✅ 체크인이 지난 요청: 확정 불가, 취소만 가능
        if (checkInStatus.isPast) {
          return (
            <div className='w-full space-y-2'>
              <div className='w-full px-4 py-2 bg-orange-50 text-orange-400 text-center rounded-md text-xs'>
                ⚠️ 체크인 날짜가 지난 예약입니다. 취소 처리해 주세요.
              </div>
              <button
                onClick={handleCancel}
                disabled={isUpdating}
                className={classNames(
                  'w-full px-6 h-12 pointer-events-auto bg-[#EFECEC] border border-[#CFC7C7] text-[#2E2320] rounded-md active:scale-95 transition-all',
                  isUpdating && 'opacity-50 cursor-not-allowed',
                )}
              >
                {isUpdating ? '처리 중...' : '만료된 예약 취소하기'}
              </button>
            </div>
          )
        }

        // ✅ 일반적인 요청 상태
        return (
          <>
            <button
              onClick={handleCancel}
              disabled={isUpdating}
              className={classNames(
                'w-fit flex-shrink-0 px-6 h-12 pointer-events-auto bg-[#EFECEC] border border-[#CFC7C7] text-[#2E2320] rounded-md active:scale-95 transition-all',
                isUpdating && 'opacity-50 cursor-not-allowed',
              )}
            >
              {isUpdating ? '처리 중...' : '예약 취소'}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isUpdating}
              className={classNames(
                'w-full px-6 h-12 pointer-events-auto bg-[#3C2F2F] text-white rounded-md active:scale-95 transition-all',
                isUpdating && 'opacity-50 cursor-not-allowed',
              )}
            >
              {isUpdating ? '처리 중...' : '예약 확정하기'}
            </button>
          </>
        )

      case 'confirmed':
        // ✅ 체크인이 지난 경우 버튼 비활성화
        if (checkInStatus.isPast) {
          return (
            <div className='w-full px-6 py-3 bg-gray-100 text-gray-500 text-center rounded-md text-sm'>
              체크인 날짜가 지나 취소할 수 없습니다
            </div>
          )
        }

        // ✅ 체크인이 오늘이거나 미래인 경우 취소 가능
        return (
          <button
            onClick={handleCancel}
            disabled={isUpdating}
            className={classNames(
              'w-full px-6 h-12 pointer-events-auto bg-[#3C2F2F] text-white rounded-md active:scale-95 transition-all',
              isUpdating && 'opacity-50 cursor-not-allowed',
            )}
          >
            {isUpdating ? '처리 중...' : '예약 취소하기'}
            {checkInStatus.isToday && (
              <span className='block text-xs opacity-80 mt-0.5'>⚠️ 오늘이 체크인 날짜입니다</span>
            )}
          </button>
        )

      case 'cancelled':
        return (
          <div className='w-full px-6 py-3 bg-gray-100 text-gray-500 text-center rounded-md'>취소된 예약입니다</div>
        )

      default:
        return null
    }
  }

  return (
    <Sheet className='max-w-md mx-auto' isOpen={!!reservation} onClose={onClose}>
      <Sheet.Container
        style={{
          left: '16px',
          right: '16px',
          top: '5dvh',
          width: 'calc(100% - 32px)',
          height: 'auto',
          maxHeight: '90dvh',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        <Sheet.Header>
          <div className='w-full h-fit p-5 inline-flex items-center justify-between'>
            {/* 상태 뱃지 */}
            <div className='flex items-center gap-2 flex-wrap'>
              {reservation && (
                <>
                  <span
                    className={classNames(
                      'px-2 py-1 rounded-md text-xs font-medium',
                      reservation.status === 'requested' && 'bg-orange-100 text-orange-700',
                      reservation.status === 'confirmed' && 'bg-green-100 text-green-700',
                      reservation.status === 'cancelled' && 'bg-red-100 text-red-700',
                    )}
                  >
                    {reservation.status === 'requested' && '예약요청'}
                    {reservation.status === 'confirmed' && '예약확정'}
                    {reservation.status === 'cancelled' && '예약취소'}
                  </span>

                  {/* ✅ 예약 요청 만료 뱃지 */}
                  {reservation.status === 'requested' && checkInStatus?.isPast && (
                    <span className='px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700'>기간 만료</span>
                  )}

                  {/* ✅ 확정된 예약 체크인 상태 뱃지 */}
                  {reservation.status === 'confirmed' && checkInStatus && (
                    <>
                      {checkInStatus.isPast && (
                        <span className='px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700'>
                          투숙 완료
                        </span>
                      )}
                      {checkInStatus.isToday && (
                        <span className='px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700'>
                          오늘 체크인
                        </span>
                      )}
                      {checkInStatus.isFuture && checkInStatus.daysUntilCheckIn <= 3 && (
                        <span className='px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-700'>
                          D-{checkInStatus.daysUntilCheckIn}
                        </span>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
            <button
              onClick={onClose}
              className='w-fit h-fit text-gray-500 active:scale-90 active:opacity-70 transition-all'
            >
              <svg xmlns='http://www.w3.org/2000/svg' className='w-6 h-6' viewBox='0 0 24 24' fill='none'>
                <path
                  d='M7 7L17 17M7 17L17 7'
                  stroke='black'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </button>
          </div>
        </Sheet.Header>
        <Sheet.Content className='relative'>
          {reservation ? (
            <div className='px-5 space-y-6 pb-32'>
              {/* 예약 코드 */}
              <LabelItem label='예약 코드'>
                <div className='bg-[#F5F4F4] text-black px-5 py-3 text-sm font-mono relative'>
                  {reservation.reservation_code}
                  <button
                    onClick={() => copyToClipboard(reservation.reservation_code)}
                    className='absolute top-1/2 -translate-y-1/2 right-4 z-10 text-sm opacity-50 active:opacity-80 transition-all'
                  >
                    복사
                  </button>
                </div>
              </LabelItem>

              <LabelItem label='예약 공간'>
                <div className='bg-[#F5F4F4] text-black px-5 py-3 text-sm'>{reservation.property.name}</div>
                <div className='w-full h-px bg-stone-200' />
                <div className='bg-[#F5F4F4] text-stone-500 px-5 pt-3 pb-0.5 text-xs'>
                  {reservation.property.address.address1}
                </div>
                <div className='bg-[#F5F4F4] text-stone-500 px-5 pt-0.5 pb-3 text-xs'>
                  {reservation.property.address.address2}
                </div>
              </LabelItem>

              <LabelItem label='예약자 정보'>
                <div className='bg-[#F5F4F4] text-black px-5 py-3 text-sm relative'>
                  {reservation.email}
                  <button
                    onClick={() => copyToClipboard(reservation.email)}
                    className='absolute top-1/2 -translate-y-1/2 right-4 z-10 text-sm opacity-50 active:opacity-80 transition-all'
                  >
                    복사
                  </button>
                </div>
                <div className='w-full h-px bg-stone-200' />
                <div className='bg-[#F5F4F4] text-black px-5 py-3 text-sm relative'>
                  인원
                  <span className='absolute top-1/2 -translate-y-1/2 right-4 text-end z-10 text-sm'>
                    {reservation.guest_count}명
                  </span>
                </div>
              </LabelItem>

              <LabelItem label='입/퇴실 시간'>
                <div className='bg-[#F5F4F4] text-black px-5 py-3 text-sm relative flex justify-between items-center'>
                  <span>체크인</span>
                  <span>{formatDateTime(reservation.check_in_date, reservation.property.check_in_time)}</span>
                </div>
                <div className='w-full h-px bg-stone-200' />
                <div className='bg-[#F5F4F4] text-black px-5 py-3 text-sm relative flex justify-between items-center'>
                  <span>체크아웃</span>
                  <span>{formatDateTime(reservation.check_out_date, reservation.property.check_out_time)}</span>
                </div>
              </LabelItem>

              <LabelItem label='추가 요청사항'>
                <div className='bg-[#F5F4F4] text-black px-5 py-3 text-sm relative'>
                  {reservation.special_requests || '없음'}
                </div>
              </LabelItem>

              <LabelItem label='옵션'>
                <div className='bg-[#F5F4F4] text-black px-5 py-3 text-sm relative'>
                  {reservation.options && reservation.options.length > 0 ? (
                    reservation.options.map((option: any) => (
                      <div key={option.id} className='flex justify-between items-center'>
                        <span>{option.name}</span>
                        <span>₩{option.price.toLocaleString()}</span>
                      </div>
                    ))
                  ) : (
                    <span className='text-stone-500'>선택한 옵션이 없습니다.</span>
                  )}
                </div>
              </LabelItem>

              <LabelItem label='결제금액'>
                <div className='bg-[#F5F4F4] text-black px-5 py-3 text-sm relative'>
                  ₩{reservation.total_price.toLocaleString()}
                </div>
              </LabelItem>

              {/* 확정/취소 날짜 표시 */}
              {reservation.confirmed_at && (
                <LabelItem label='확정 일시'>
                  <div className='bg-green-50 text-green-700 px-5 py-3 text-sm relative'>
                    {new Date(reservation.confirmed_at).toLocaleString('ko-KR')}
                  </div>
                </LabelItem>
              )}

              {reservation.cancelled_at && (
                <LabelItem label='취소 일시'>
                  <div className='bg-red-50 text-red-700 px-5 py-3 text-sm relative'>
                    {new Date(reservation.cancelled_at).toLocaleString('ko-KR')}
                  </div>
                </LabelItem>
              )}

              {/* 액션 버튼 */}
              <div className='w-full px-5 pb-5 pt-24 pointer-events-none absolute bottom-0 bg-gradient-to-t from-white via-white/90 to-transparent inset-x-0 h-fit flex flex-row gap-2.5'>
                {renderActionButtons()}
              </div>
            </div>
          ) : (
            <div className='p-5 py-10 text-black flex flex-col justify-center items-center gap-4'>
              <p>예약 정보를 불러오는 중...</p>
            </div>
          )}
        </Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop />
    </Sheet>
  )
}

const LabelItem = ({ label, children }: { label: string; children: React.ReactNode }) => {
  return (
    <div className='flex flex-col gap-2'>
      <span className='text-sm text-black px-0.5'>{label}</span>
      <div className='overflow-hidden rounded-md w-full h-fit'>{children}</div>
    </div>
  )
}

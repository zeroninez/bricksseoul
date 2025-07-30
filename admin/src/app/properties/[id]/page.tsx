'use client'

// admin/src/app/properties/[id]/page.tsx
import { useState, useEffect, use } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Property, loadProperty, updateProperty } from '@/lib/supabase'
import { Breadcrumbs } from '@/components'
import { TbEye, TbEdit, TbCheck, TbX } from 'react-icons/tb'

export default function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const [property, setProperty] = useState<Property | null>(null)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  // React.use()를 사용해서 params Promise를 unwrap
  const resolvedParams = use(params)
  const propertyId = parseInt(resolvedParams.id, 10)

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const data = await loadProperty(propertyId)
        setProperty(data)
        setEditingProperty(data)
      } catch (err) {
        setError('숙소 정보를 불러오는 데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchProperty()
  }, [propertyId])

  const handleSave = async () => {
    if (!editingProperty?.title?.trim() || !editingProperty?.location?.trim()) {
      setError('제목과 위치는 필수 입력 항목입니다.')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const updates = {
        title: editingProperty.title.trim(),
        location: editingProperty.location.trim(),
        description: editingProperty.description?.trim() || null,
        content: editingProperty.content?.trim() || null,
        featured_image_url: editingProperty.featured_image_url?.trim() || null,
        is_published: editingProperty.is_published,
        sort_order: editingProperty.sort_order,
      }

      const updatedProperty = await updateProperty(propertyId, updates)
      setProperty(updatedProperty)
      setEditingProperty(updatedProperty)
      setEditMode(false)
      setIsPreviewMode(false)
      setSuccess('Property가 성공적으로 업데이트되었습니다.')

      // 성공 메시지를 3초 후에 제거
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Property 저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditingProperty(property)
    setEditMode(false)
    setIsPreviewMode(false)
    setError(null)
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full'></div>
      </div>
    )
  }

  if (error && !property) {
    return (
      <div className='p-6'>
        <div className='p-4 bg-red-50 border border-red-200 rounded-lg text-red-700'>{error}</div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className='p-6'>
        <div className='text-center py-12'>
          <p className='text-gray-500 text-lg'>Property를 찾을 수 없습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* 헤더 */}
      <section className='w-full bg-white border-b border-gray-200'>
        <Breadcrumbs />
        <div className='w-full flex flex-row items-center justify-between p-6'>
          <div>
            <h1 className='text-xl font-medium'>Property 상세</h1>
            <p className='text-sm text-gray-600 mt-1'>{property.title}</p>
          </div>
          <div className='flex gap-2'>
            {editMode ? (
              <>
                <button
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  className='px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2'
                >
                  <TbEye className='w-4 h-4' />
                  {isPreviewMode ? '편집' : '미리보기'}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className='px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50'
                >
                  <TbCheck className='w-4 h-4' />
                  {saving ? '저장 중...' : '저장'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className='px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors flex items-center gap-2'
                >
                  <TbX className='w-4 h-4' />
                  취소
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className='px-3 py-2 bg-black text-white rounded-lg hover:bg-black/90 transition-colors flex items-center gap-2'
              >
                <TbEdit className='w-4 h-4' />
                편집
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 알림 메시지 */}
      <div className='px-6'>
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className='p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4'
            >
              {error}
              <button onClick={() => setError(null)} className='ml-2 text-red-500 hover:text-red-700'>
                ✕
              </button>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className='p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 mb-4'
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 메인 컨텐츠 */}
      <div className='px-6 pb-6'>
        {editMode ? (
          // 편집 모드
          <div className='border border-gray-200 rounded-lg bg-gray-50 p-6 space-y-6'>
            {!isPreviewMode ? (
              // 편집 폼
              <div className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>제목 *</label>
                    <input
                      type='text'
                      value={editingProperty?.title || ''}
                      onChange={(e) => setEditingProperty((prev) => (prev ? { ...prev, title: e.target.value } : null))}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>위치 *</label>
                    <input
                      type='text'
                      value={editingProperty?.location || ''}
                      onChange={(e) =>
                        setEditingProperty((prev) => (prev ? { ...prev, location: e.target.value } : null))
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>대표 이미지 URL</label>
                    <input
                      type='text'
                      value={editingProperty?.featured_image_url || ''}
                      onChange={(e) =>
                        setEditingProperty((prev) => (prev ? { ...prev, featured_image_url: e.target.value } : null))
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>정렬 순서</label>
                    <input
                      type='number'
                      value={editingProperty?.sort_order || 0}
                      onChange={(e) =>
                        setEditingProperty((prev) =>
                          prev ? { ...prev, sort_order: parseInt(e.target.value) || 0 } : null,
                        )
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>간단 설명</label>
                  <textarea
                    rows={3}
                    value={editingProperty?.description || ''}
                    onChange={(e) =>
                      setEditingProperty((prev) => (prev ? { ...prev, description: e.target.value } : null))
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>상세 컨텐츠 (HTML)</label>
                  <textarea
                    rows={15}
                    value={editingProperty?.content || ''}
                    onChange={(e) => setEditingProperty((prev) => (prev ? { ...prev, content: e.target.value } : null))}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent font-mono text-sm'
                    placeholder='<div>
  <h2>숙소 소개</h2>
  <p>여기에 HTML로 상세 내용을 작성하세요.</p>
  <img src="image_url" alt="설명" />
  <ul>
    <li>특징 1</li>
    <li>특징 2</li>
  </ul>
</div>'
                  />
                </div>

                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='is_published'
                    checked={editingProperty?.is_published || false}
                    onChange={(e) =>
                      setEditingProperty((prev) => (prev ? { ...prev, is_published: e.target.checked } : null))
                    }
                    className='mr-2'
                  />
                  <label htmlFor='is_published' className='text-sm font-medium text-gray-700'>
                    게시 상태 (체크하면 클라이언트에서 표시됨)
                  </label>
                </div>
              </div>
            ) : (
              // 미리보기 모드
              <div className='border border-gray-300 rounded-lg p-6 bg-white'>
                <h2 className='text-2xl font-bold mb-2'>{editingProperty?.title}</h2>
                <p className='text-gray-600 mb-4'>📍 {editingProperty?.location}</p>

                {editingProperty?.featured_image_url && (
                  <div className='w-full h-64 md:h-80 mb-6 rounded-lg overflow-hidden'>
                    <img
                      src={editingProperty.featured_image_url}
                      alt={editingProperty.title}
                      className='w-full h-full object-cover'
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}

                {editingProperty?.description && (
                  <div className='mb-6'>
                    <p className='text-lg text-gray-700 leading-relaxed'>{editingProperty.description}</p>
                  </div>
                )}

                {editingProperty?.content && (
                  <div
                    className='prose prose-lg max-w-none'
                    dangerouslySetInnerHTML={{ __html: editingProperty.content }}
                  />
                )}

                <div className='mt-6 pt-4 border-t border-gray-200'>
                  <div className='flex items-center justify-between text-sm text-gray-500'>
                    <span>게시 상태: {editingProperty?.is_published ? '공개' : '비공개'}</span>
                    <span>정렬 순서: {editingProperty?.sort_order}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          // 보기 모드
          <div className='border border-gray-200 rounded-lg bg-white p-6'>
            <div className='flex items-center justify-between mb-6'>
              <div>
                <h2 className='text-2xl font-bold mb-2'>{property.title}</h2>
                <p className='text-gray-600'>📍 {property.location}</p>
              </div>
              <div className='text-right text-sm text-gray-500'>
                <div
                  className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${
                    property.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {property.is_published ? '게시됨' : '비공개'}
                </div>
                <p className='mt-1'>정렬 순서: {property.sort_order}</p>
                <p>생성: {new Date(property.created_at).toLocaleDateString('ko-KR')}</p>
                <p>수정: {new Date(property.updated_at).toLocaleDateString('ko-KR')}</p>
              </div>
            </div>

            {property.featured_image_url && (
              <div className='w-full h-64 md:h-80 mb-6 rounded-lg overflow-hidden'>
                <img
                  src={property.featured_image_url}
                  alt={property.title}
                  className='w-full h-full object-cover'
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            )}

            {property.description && (
              <div className='mb-6'>
                <h3 className='text-lg font-semibold mb-2'>설명</h3>
                <p className='text-gray-700 leading-relaxed'>{property.description}</p>
              </div>
            )}

            {property.content && (
              <div>
                <h3 className='text-lg font-semibold mb-4'>상세 내용</h3>
                <div className='prose prose-lg max-w-none' dangerouslySetInnerHTML={{ __html: property.content }} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

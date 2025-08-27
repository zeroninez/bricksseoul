'use client'

import { useState, useEffect, use } from 'react'
import { getPropertyBySlug, updateProperty } from '@/lib/supabase'
import { Breadcrumbs } from '@/components'
import { TbEye, TbEdit, TbCheck, TbX } from 'react-icons/tb'

export default function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const [property, setProperty] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [draftProperty, setDraftProperty] = useState<any | null>(null)
  const [isSaving, setIsSaving] = useState(false) // 저장 상태 추가

  const resolvedParams = use(params)
  const propertySlug = resolvedParams.slug

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const data = await getPropertyBySlug(propertySlug)
        setProperty(data)
        setDraftProperty(data)
      } catch (err) {
        setError('숙소 정보를 불러오는 데 실패했습니다.')
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProperty()
  }, [propertySlug])

  if (loading) return <p className='text-gray-500'>로딩 중...</p>
  if (error || !property) return <p className='text-red-500'>Property not found</p>

  const resetDraft = () => {
    setDraftProperty({ ...property })
    setIsEditing(false)
    setError(null)
  }

  const saveDraft = async () => {
    if (isSaving) return // 중복 저장 방지

    try {
      setIsSaving(true)
      setError(null)

      console.log('저장 시작 - draftProperty:', draftProperty)

      // 이미지 데이터 검증 및 정리
      const filteredImages = draftProperty.images
        .filter((img: any) => img.src && img.src.trim() !== '')
        .map((img: any, index: number) => ({
          id: img.id || null, // null이면 새 이미지로 처리
          src: img.src.trim(),
          name: img.name ? img.name.trim() : `Image ${index + 1}`,
          sort_order: img.sort_order !== undefined ? img.sort_order : index,
          property_id: property.id, // 추가
        }))

      console.log('필터링된 이미지:', filteredImages)

      const filteredFeatures = draftProperty.features.filter(
        (f: any) => f.icon && f.icon.trim() !== '' && f.name && f.name.trim() !== '',
      )

      // 기본 property 정보 업데이트 (detail 제외)
      const propertyUpdate = {
        name: draftProperty.name,
        address: draftProperty.address,
        description: draftProperty.description,
        latitude: draftProperty.latitude,
        longitude: draftProperty.longitude,
        features: filteredFeatures,
        payment_link: draftProperty.payment_link,
      }

      // detail 정보 별도 처리 - null 체크 추가
      let detailUpdate = null
      if (draftProperty.detail) {
        const filteredAmenities = (draftProperty.detail.amenities || []).filter(
          (a: any) => a.icon && a.icon.trim() !== '' && a.name && a.name.trim() !== '',
        )

        detailUpdate = {
          description_blocks: draftProperty.detail.description_blocks || '',
          nearby_info: draftProperty.detail.nearby_info || '',
          amenities: filteredAmenities,
          // property_id는 API 함수에서 자동으로 추가됨
        }
      }

      console.log('Property 업데이트 데이터:', propertyUpdate)
      console.log('Detail 업데이트 데이터:', detailUpdate)
      console.log('이미지 업데이트 데이터:', filteredImages)

      // updateProperty 호출 - detailUpdate가 있을 때만 전달
      await updateProperty({
        propertyId: property.id,
        property: propertyUpdate,
        ...(detailUpdate && { detail: detailUpdate }), // detailUpdate가 truthy일 때만 포함
        images: filteredImages,
      })

      console.log('저장 완료')

      // 성공 시 상태 업데이트
      const updatedProperty = {
        ...draftProperty,
        images: filteredImages,
        detail: detailUpdate || draftProperty.detail, // detailUpdate가 null이면 기존 detail 유지
      }

      setProperty(updatedProperty)
      setDraftProperty(updatedProperty)
      setIsEditing(false)
    } catch (err) {
      console.error('저장 오류:', err)
      setError(`숙소 정보를 저장하는 데 실패했습니다: ${err instanceof Error ? err.message : '알 수 없는 오류'}`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <div className='w-full sticky top-0 flex flex-row border-b border-gray-200 items-center justify-between'>
        <button
          disabled={!isEditing}
          onClick={() => setIsEditing(false)}
          className='disabled:opacity-50 disabled:cursor-not-allowed flex-1 text-center flex justify-center items-center gap-2 px-4 py-2 text-gray-500 transition-colors'
        >
          Preview
        </button>
        <button
          disabled={isEditing || isSaving}
          onClick={() => setIsEditing(true)}
          className='disabled:opacity-50 disabled:cursor-not-allowed flex-1 text-center flex justify-center items-center gap-2 px-4 py-2 text-blue-500 transition-all'
        >
          Edit
        </button>
        <button
          onClick={resetDraft}
          disabled={isSaving}
          className='flex items-center gap-2 px-4 py-2 text-red-500 flex-1 text-center justify-center transition-colors disabled:opacity-50'
        >
          Reset
        </button>
        <button
          onClick={saveDraft}
          disabled={!isEditing || isSaving}
          className='flex items-center gap-2 px-4 py-2 text-green-500 flex-1 text-center justify-center transition-colors disabled:opacity-50'
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* 에러 메시지 표시 */}
      {error && (
        <div className='mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm'>{error}</div>
      )}

      <section className='max-w-4xl mx-auto px-4 py-6'>
        {/* --- Image Section --- */}
        {isEditing ? (
          <div className='w-full flex flex-col gap-4 mb-4'>
            {draftProperty.images.map((image: { id: number; src: string; name: string }, index: number) => (
              <div key={image.id || `new-${index}`} className='relative border border-gray-200 rounded-lg p-4'>
                {image.src ? (
                  <img src={image.src} alt={image.name || 'Property Image'} className='w-full h-auto shadow-md mb-2' />
                ) : (
                  <div className='w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400 mb-2'>
                    No Image
                  </div>
                )}
                <button
                  onClick={() =>
                    setDraftProperty({
                      ...draftProperty,
                      images: draftProperty.images.filter((_: any, i: number) => i !== index),
                    })
                  }
                  className='absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors'
                >
                  <TbX />
                </button>

                <div className='space-y-2'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>이미지 URL</label>
                    <input
                      type='text'
                      value={image.src}
                      onChange={(e) =>
                        setDraftProperty({
                          ...draftProperty,
                          images: draftProperty.images.map((img: any, i: number) =>
                            i === index ? { ...img, src: e.target.value } : img,
                          ),
                        })
                      }
                      className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                      placeholder='이미지 URL을 입력하세요'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>이미지 이름</label>
                    <input
                      type='text'
                      value={image.name}
                      onChange={(e) =>
                        setDraftProperty({
                          ...draftProperty,
                          images: draftProperty.images.map((img: any, i: number) =>
                            i === index ? { ...img, name: e.target.value } : img,
                          ),
                        })
                      }
                      className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                      placeholder='이미지 이름을 입력하세요'
                    />
                  </div>

                  <div className='text-xs text-gray-500'>
                    {image.id ? `기존 이미지 (ID: ${image.id})` : '새 이미지'}
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() => {
                const newId = Date.now() // 임시 ID로 현재 시간 사용
                setDraftProperty({
                  ...draftProperty,
                  images: [
                    ...draftProperty.images,
                    {
                      id: null, // 새 이미지는 ID를 null로 설정
                      src: '',
                      name: '',
                      sort_order: draftProperty.images.length,
                      property_id: property.id,
                    },
                  ],
                })
              }}
              className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'
            >
              + Add Image
            </button>
          </div>
        ) : (
          <div className='w-full flex flex-row overflow-x-scroll snap-x gap-4 mb-4'>
            {draftProperty.images.map((image: { id: number; src: string; name: string }) => (
              <img
                key={image.id}
                src={image.src}
                alt={image.name || 'Property Image'}
                className='w-[90%] h-auto shadow-md snap-start'
              />
            ))}
          </div>
        )}

        {/* 나머지 컴포넌트는 동일... */}
        <div className='w-full h-fit relative mb-4'>
          {isEditing ? (
            <input
              required
              type='text'
              className='w-full text-2xl font-bold border-b border-gray-300 focus:border-black'
              value={draftProperty.name}
              onChange={(e) => setDraftProperty({ ...draftProperty, name: e.target.value })}
            />
          ) : (
            <h1 className='w-full text-2xl font-bold'>{draftProperty.name}</h1>
          )}
        </div>
        <div className='w-full h-fit relative mb-4'>
          {isEditing ? (
            <input
              required
              type='text'
              className='w-full border-b border-gray-300 focus:border-black'
              value={draftProperty.address}
              onChange={(e) => setDraftProperty({ ...draftProperty, address: e.target.value })}
            />
          ) : (
            <p className='w-full text-gray-700'>{property.address}</p>
          )}
        </div>
        <div className='w-full h-fit relative mb-4'>
          {isEditing ? (
            <textarea
              required
              className='w-full h-24 p-2 border border-gray-300 focus:border-black'
              value={draftProperty.description}
              onChange={(e) => setDraftProperty({ ...draftProperty, description: e.target.value })}
            />
          ) : (
            <p className='w-full text-gray-700'>{draftProperty.description}</p>
          )}
        </div>

        {/* Features Section */}
        <div className='flex flex-row items-center gap-2 mt-4 flex-wrap'>
          {isEditing
            ? draftProperty.features.map((feature: any, index: number) => (
                <div
                  key={index}
                  className='px-1 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm flex flex-row gap-1 w-fit items-center relative'
                >
                  <input
                    type='text'
                    value={feature.icon}
                    onChange={(e) =>
                      setDraftProperty({
                        ...draftProperty,
                        features: draftProperty.features.map((f: any, i: number) =>
                          i === index ? { ...f, icon: e.target.value } : f,
                        ),
                      })
                    }
                    className='w-8 h-8 bg-black/10 rounded-lg p-1 text-center'
                  />
                  <input
                    type='text'
                    value={feature.name}
                    onChange={(e) =>
                      setDraftProperty({
                        ...draftProperty,
                        features: draftProperty.features.map((f: any, i: number) =>
                          i === index ? { ...f, name: e.target.value } : f,
                        ),
                      })
                    }
                    className='w-fit h-8 min-w-8 bg-black/10 rounded-lg py-1 px-2'
                  />
                  <button
                    onClick={() =>
                      setDraftProperty({
                        ...draftProperty,
                        features: draftProperty.features.filter((_: any, i: number) => i !== index),
                      })
                    }
                    className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors'
                  >
                    <TbX />
                  </button>
                </div>
              ))
            : property.features.map((feature: any, index: number) => (
                <span key={index} className='px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm'>
                  {feature.icon} {feature.name}
                </span>
              ))}
        </div>
        {isEditing && (
          <button
            onClick={() =>
              setDraftProperty({
                ...draftProperty,
                features: [...draftProperty.features, { icon: '', name: '' }],
              })
            }
            className='mt-2 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm'
          >
            + Add Feature
          </button>
        )}

        {/* Details Section은 동일... */}
        <h2 className='text-xl font-semibold mt-6'>Details</h2>
        <div className='mt-4'>
          {property.detail ? (
            <>
              {isEditing ? (
                <textarea
                  className='w-full h-24 p-2 border border-gray-300 focus:border-black'
                  value={draftProperty.detail.description_blocks}
                  onChange={(e) =>
                    setDraftProperty({
                      ...draftProperty,
                      detail: { ...draftProperty.detail, description_blocks: e.target.value },
                    })
                  }
                />
              ) : (
                <p className='text-gray-700'>{property.detail.description_blocks}</p>
              )}
              {isEditing ? (
                <textarea
                  className='w-full h-24 p-2 border border-gray-300 focus:border-black mt-4'
                  value={draftProperty.detail.nearby_info}
                  onChange={(e) =>
                    setDraftProperty({
                      ...draftProperty,
                      detail: { ...draftProperty.detail, nearby_info: e.target.value },
                    })
                  }
                />
              ) : (
                <p className='text-gray-700 mt-4'>{property.detail.nearby_info}</p>
              )}
              <div className='mt-2 flex flex-wrap gap-2'>
                {isEditing
                  ? draftProperty.detail.amenities.map((amenity: any, index: number) => (
                      <div
                        key={index}
                        className='bg-gray-100 text-gray-700 rounded-lg text-sm flex flex-row gap-1 items-center relative px-2 py-1'
                      >
                        <input
                          type='text'
                          value={amenity.icon}
                          onChange={(e) =>
                            setDraftProperty({
                              ...draftProperty,
                              detail: {
                                ...draftProperty.detail,
                                amenities: draftProperty.detail.amenities.map((a: any, i: number) =>
                                  i === index ? { ...a, icon: e.target.value } : a,
                                ),
                              },
                            })
                          }
                          className='w-8 h-8 bg-black/10 rounded-lg p-1 text-center'
                        />
                        <input
                          type='text'
                          value={amenity.name}
                          onChange={(e) =>
                            setDraftProperty({
                              ...draftProperty,
                              detail: {
                                ...draftProperty.detail,
                                amenities: draftProperty.detail.amenities.map((a: any, i: number) =>
                                  i === index ? { ...a, name: e.target.value } : a,
                                ),
                              },
                            })
                          }
                          className='h-8 bg-black/10 rounded-lg py-1 px-2'
                        />
                        <button
                          onClick={() =>
                            setDraftProperty({
                              ...draftProperty,
                              detail: {
                                ...draftProperty.detail,
                                amenities: draftProperty.detail.amenities.filter((_: any, i: number) => i !== index),
                              },
                            })
                          }
                          className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors'
                        >
                          <TbX />
                        </button>
                      </div>
                    ))
                  : property.detail.amenities.map((amenity: any) => (
                      <span
                        key={amenity.name}
                        className='inline-block bg-gray-100 text-gray-700 rounded-full px-3 py-1 mr-2 mb-2 text-sm'
                      >
                        {amenity.icon} {amenity.name}
                      </span>
                    ))}
              </div>
              {isEditing && (
                <button
                  onClick={() =>
                    setDraftProperty({
                      ...draftProperty,
                      detail: {
                        ...draftProperty.detail,
                        amenities: [...draftProperty.detail.amenities, { icon: '', name: '' }],
                      },
                    })
                  }
                  className='mt-2 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm'
                >
                  + Add Amenity
                </button>
              )}
            </>
          ) : (
            <p className='text-gray-500'>No details available for this property.</p>
          )}
        </div>
      </section>
    </>
  )
}

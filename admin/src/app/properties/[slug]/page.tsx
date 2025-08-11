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
  }

  const saveDraft = async () => {
    try {
      const filteredImages = draftProperty.images.filter((img: any) => img.src && img.src.trim() !== '')
      const filteredFeatures = draftProperty.features.filter(
        (f: any) => f.icon && f.icon.trim() !== '' && f.name && f.name.trim() !== '',
      )
      const filteredAmenities = draftProperty.detail.amenities.filter(
        (a: any) => a.icon && a.icon.trim() !== '' && a.name && a.name.trim() !== '',
      )

      await updateProperty({
        propertyId: property.id,
        property: {
          name: draftProperty.name,
          address: draftProperty.address,
          description: draftProperty.description,
          latitude: draftProperty.latitude,
          longitude: draftProperty.longitude,
          features: filteredFeatures,
          payment_link: draftProperty.payment_link,
        },
        images: filteredImages.map((img: any) => ({
          id: img.id,
          src: img.src,
          name: img.name,
          sort_order: img.sort_order,
        })),
        // detail: {
        //   description_blocks: draftProperty.detail.description_blocks,
        //   nearby_info: draftProperty.detail.nearby_info,
        //   amenities: filteredAmenities,
        // },
      })

      setProperty({ ...draftProperty, images: filteredImages })
      setDraftProperty({ ...draftProperty, images: filteredImages })
      setIsEditing(false)
    } catch (err) {
      console.error('Error saving property:', err)
      setError('숙소 정보를 저장하는 데 실패했습니다.')
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
          disabled={isEditing}
          onClick={() => setIsEditing(true)}
          className='disabled:opacity-50 disabled:cursor-not-allowed flex-1 text-center flex justify-center items-center gap-2 px-4 py-2 text-blue-500 transition-all'
        >
          Edit
        </button>
        <button
          onClick={resetDraft}
          className='flex items-center gap-2 px-4 py-2 text-red-500 flex-1 text-center justify-center transition-colors'
        >
          Reset
        </button>
        <button
          onClick={saveDraft}
          disabled={!isEditing}
          className='flex items-center gap-2 px-4 py-2 text-green-500 flex-1 text-center justify-center transition-colors'
        >
          Save
        </button>
      </div>
      <section className='max-w-4xl mx-auto px-4 py-6'>
        {/* --- Image Section --- */}
        {isEditing ? (
          <div className='w-full flex flex-col gap-4 mb-4'>
            {draftProperty.images.map((image: { id: number; src: string; name: string }) => (
              <div key={image.id} className='relative'>
                {image.src ? (
                  <img src={image.src} alt={image.name || 'Property Image'} className='w-full h-auto shadow-md' />
                ) : (
                  <div className='w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400'>No Image</div>
                )}
                <button
                  onClick={() =>
                    setDraftProperty({
                      ...draftProperty,
                      images: draftProperty.images.filter((img: any) => img.id !== image.id),
                    })
                  }
                  className='absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors'
                >
                  <TbX />
                </button>
                <input
                  type='text'
                  value={image.src}
                  onChange={(e) =>
                    setDraftProperty({
                      ...draftProperty,
                      images: draftProperty.images.map((img: any) =>
                        img.id === image.id ? { ...img, src: e.target.value } : img,
                      ),
                    })
                  }
                  className='w-full mt-2 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
                <input
                  type='text'
                  value={image.name}
                  onChange={(e) =>
                    setDraftProperty({
                      ...draftProperty,
                      images: draftProperty.images.map((img: any) =>
                        img.id === image.id ? { ...img, name: e.target.value } : img,
                      ),
                    })
                  }
                  className='w-full mt-2 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
            ))}
            <button
              onClick={() => {
                const newId =
                  draftProperty.images.length > 0
                    ? Math.max(...draftProperty.images.map((img: any) => img.id || 0)) + 1
                    : 1
                setDraftProperty({
                  ...draftProperty,
                  images: [
                    ...draftProperty.images,
                    { id: newId, src: '', name: '', sort_order: draftProperty.images.length },
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

        {/* --- Features Section --- */}
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

        <h2 className='text-xl font-semibold mt-6'>Details</h2>
        <div className='mt-4'>
          {property.detail ? (
            <>
              <h3 className='text-lg font-medium'>{property.detail.description_blocks}</h3>
              <p className='text-gray-600'>{property.detail.nearby_info}</p>
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

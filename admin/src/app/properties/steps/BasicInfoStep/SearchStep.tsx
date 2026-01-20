'use client'

import React, { useEffect, useRef, useState } from 'react'
import Script from 'next/script'

interface SearchStepProps {
  onLocationSelect: (data: { korAddr: string; engAddr: string; lat: number; lng: number; embedUrl: string }) => void
  selectedAddress: string | null
  isMapLoaded: boolean
  setIsMapLoaded: (loaded: boolean) => void
}

type PlaceResult = {
  name: string
  address: string
  lat: number
  lng: number
  placeId: string
}

declare global {
  interface Window {
    google: any
  }
}

export const SearchStep = ({ onLocationSelect, selectedAddress, isMapLoaded, setIsMapLoaded }: SearchStepProps) => {
  const [step, setStep] = useState<'search' | 'map'>('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number; address: string } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const placesServiceRef = useRef<any>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

  // Places Service 초기화
  const initializePlacesService = () => {
    if (!window.google?.maps?.places) {
      console.error('❌ Google Maps Places library not loaded')
      return false
    }

    if (!placesServiceRef.current) {
      if (googleMapRef.current) {
        placesServiceRef.current = new window.google.maps.places.PlacesService(googleMapRef.current)
      } else {
        const dummyDiv = document.createElement('div')
        placesServiceRef.current = new window.google.maps.places.PlacesService(dummyDiv)
      }
      console.log('✅ Places Service 초기화 완료')
    }
    return true
  }

  // Places API로 한글 검색
  const searchPlaces = (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    if (!initializePlacesService()) {
      setSearchError('검색 서비스를 초기화하는 중 오류가 발생했어요')
      return
    }

    setIsSearching(true)
    setSearchError(null)

    const request = {
      query: query,
      language: 'ko',
      region: 'kr',
    }

    placesServiceRef.current.textSearch(request, (results: any[], status: any) => {
      setIsSearching(false)

      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        const placeResults: PlaceResult[] = results.slice(0, 10).map((place: any) => ({
          name: place.name || '',
          address: place.formatted_address || '',
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          placeId: place.place_id || '',
        }))

        setSearchResults(placeResults)

        if (placeResults.length === 0) {
          setSearchError('검색 결과가 없어요')
        }
      } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        setSearchResults([])
        setSearchError('검색 결과가 없어요')
      } else {
        setSearchResults([])
        setSearchError('검색 중 오류가 발생했어요')
        console.error('Places API error:', status)
      }
    })
  }

  // 검색 디바운스
  useEffect(() => {
    if (!isMapLoaded) return

    if (!searchQuery.trim()) {
      setSearchResults([])
      setSearchError(null)
      setIsSearching(false)
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      searchPlaces(searchQuery)
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchQuery, isMapLoaded])

  // 지도 초기화
  const initializeMap = (lat: number, lng: number) => {
    if (!mapRef.current || !window.google) return

    const position = { lat, lng }

    if (googleMapRef.current) {
      googleMapRef.current.setCenter(position)
      googleMapRef.current.setZoom(16)

      if (markerRef.current) {
        markerRef.current.setMap(null)
      }

      markerRef.current = new window.google.maps.Marker({
        position,
        map: googleMapRef.current,
        draggable: true,
      })

      markerRef.current.addListener('dragend', (e: any) => {
        const newLat = e.latLng.lat()
        const newLng = e.latLng.lng()

        setCurrentLocation({
          lat: newLat,
          lng: newLng,
          address: currentLocation?.address || '',
        })
      })

      return
    }

    const mapOptions = {
      center: position,
      zoom: 16,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: false,
    }

    googleMapRef.current = new window.google.maps.Map(mapRef.current, mapOptions)

    markerRef.current = new window.google.maps.Marker({
      position,
      map: googleMapRef.current,
      draggable: true,
    })

    markerRef.current.addListener('dragend', (e: any) => {
      const newLat = e.latLng.lat()
      const newLng = e.latLng.lng()

      setCurrentLocation({
        lat: newLat,
        lng: newLng,
        address: currentLocation?.address || '',
      })
    })

    initializePlacesService()
  }

  // 검색 결과 선택
  const handleSelectPlace = (place: PlaceResult) => {
    console.log('✅ 선택한 장소:', place)

    setSelectedPlace(place)
    setCurrentLocation({
      lat: place.lat,
      lng: place.lng,
      address: place.address,
    })

    setSearchResults([])
    setStep('map')

    if (isMapLoaded) {
      setTimeout(() => {
        initializeMap(place.lat, place.lng)
      }, 100)
    }
  }

  // 위치 확인 완료 → 영문 주소 자동 변환 및 완료
  const handleConfirmLocation = async () => {
    if (!currentLocation || !selectedPlace) return

    setIsProcessing(true)

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${currentLocation.lat},${currentLocation.lng}&key=${GOOGLE_MAPS_API_KEY}&language=en`,
      )
      const data = await response.json()

      if (data.status === 'OK' && data.results.length > 0) {
        let bestAddress = data.results[0].formatted_address

        const accurateResult = data.results.find(
          (result: any) => result.types.includes('street_address') || result.types.includes('route'),
        )

        if (accurateResult) {
          bestAddress = accurateResult.formatted_address
        }

        // 언어 파라미터 없이 기본 URL만 저장
        const baseEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=place_id:${selectedPlace.placeId}&zoom=16`

        onLocationSelect({
          korAddr: currentLocation.address,
          engAddr: bestAddress,
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          embedUrl: baseEmbedUrl, // 기본 URL만 저장
        })
      } else {
        alert('영문 주소를 찾을 수 없어요. 다시 시도해주세요.')
        setIsProcessing(false)
      }
    } catch (error) {
      console.error('영문 주소 변환 에러:', error)
      alert('영문 주소 변환 중 오류가 발생했어요.')
      setIsProcessing(false)
    }
  }

  // 다시 검색하기
  const handleBackToSearch = () => {
    setStep('search')
    setSelectedPlace(null)
    setCurrentLocation(null)
    setSearchQuery('')
    if (markerRef.current) {
      markerRef.current.setMap(null)
    }
  }

  return (
    <>
      {/* Google Maps Script */}
      {GOOGLE_MAPS_API_KEY && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&loading=async&language=ko&region=KR`}
          strategy='afterInteractive'
          onLoad={() => {
            console.log('✅ Google Maps 스크립트 로드 완료')
            setIsMapLoaded(true)
          }}
          onError={(e) => {
            console.error('❌ Google Maps 로드 에러:', e)
            setSearchError('지도를 불러오는 중 오류가 발생했어요')
          }}
        />
      )}

      <div className='w-full h-full flex flex-col'>
        {/* Step 1: 검색 */}
        {step === 'search' && (
          <>
            <div className='w-full h-fit flex flex-col gap-6 px-5 pt-4 pb-5'>
              <div className='text-xl font-bold'>
                숙박 장소의
                <br />
                위치를 검색해주세요
              </div>
              <div className='text-sm font-medium text-stone-500'>장소명이나 주소를 검색해주세요</div>

              {/* 검색창 */}
              <div className='w-full h-fit flex flex-col gap-3'>
                <div className='w-full relative h-12 bg-stone-100 pl-3 pr-4 rounded-md focus-within:bg-stone-200 transition-all flex items-center'>
                  <SearchIcon />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='w-full bg-transparent outline-none'
                    placeholder='장소명 또는 주소 입력 (예: 강남역, 명동 호텔)'
                    disabled={!isMapLoaded}
                  />
                </div>

                {/* 로딩 */}
                {!isMapLoaded && <div className='text-sm pl-1 text-stone-500'>지도 로딩 중...</div>}
                {isSearching && isMapLoaded && <div className='text-sm pl-1 text-stone-500'>검색 중…</div>}

                {/* 에러 */}
                {searchError && !isSearching && <div className='text-sm pl-1 text-red-500'>{searchError}</div>}
              </div>

              {/* 검색 결과 리스트 */}
              {searchResults.length > 0 && (
                <div className='w-full h-fit flex flex-col gap-3'>
                  {searchResults.map((place, idx) => (
                    <div
                      key={`${place.placeId}-${idx}`}
                      onClick={() => handleSelectPlace(place)}
                      className='h-fit w-full cursor-pointer active:opacity-50 active:translate-y-0.5 transition-all flex flex-col gap-1 p-3 bg-stone-50 rounded-lg hover:bg-stone-100'
                    >
                      <div className='font-medium'>{place.name}</div>
                      <div className='text-sm text-stone-500'>{place.address}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Step 2: 지도에서 위치 확인 */}
        {step === 'map' && (
          <>
            <div className='w-full h-fit flex flex-col gap-4 px-5 pt-4 pb-4 border-b border-stone-200'>
              <div className='flex items-center justify-between'>
                <div className='text-xl font-bold'>위치를 확인해주세요</div>
                <button
                  onClick={handleBackToSearch}
                  className='text-sm text-stone-500 hover:text-stone-700 active:opacity-50 transition-all'
                >
                  다시 검색
                </button>
              </div>
              {selectedPlace && (
                <div className='flex flex-col gap-1'>
                  <div className='text-sm font-medium'>{selectedPlace.name}</div>
                  <div className='text-xs text-stone-600'>{selectedPlace.address}</div>
                </div>
              )}
            </div>

            {/* 지도 */}
            <div className='flex-1 w-full relative'>
              {!GOOGLE_MAPS_API_KEY ? (
                <div className='w-full h-full bg-red-100 flex items-center justify-center p-5'>
                  <div className='text-center'>
                    <p className='text-red-600 font-semibold mb-2'>Google Maps API 키가 없어요</p>
                    <p className='text-red-500 text-sm'>.env.local에 NEXT_PUBLIC_GOOGLE_MAPS_API_KEY를 추가해주세요</p>
                  </div>
                </div>
              ) : !isMapLoaded ? (
                <div className='w-full h-full bg-stone-200 flex items-center justify-center'>
                  <span className='text-stone-500'>지도 로딩 중...</span>
                </div>
              ) : (
                <div ref={mapRef} className='w-full h-full' />
              )}
            </div>

            {/* 하단 버튼 */}
            <div className='w-full px-5 py-4 bg-white border-t border-stone-200'>
              <div className='flex flex-col gap-3'>
                <p className='text-xs text-stone-600'>💡 마커를 드래그해서 정확한 위치를 조정할 수 있어요</p>
                <button
                  onClick={handleConfirmLocation}
                  disabled={isProcessing || !currentLocation}
                  className='w-full h-12 bg-black text-white rounded-lg font-medium hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {isProcessing ? '처리 중...' : '이 위치로 선택'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

// 검색 아이콘
const SearchIcon = () => (
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 14 14' className='text-black/50 mr-2 w-4 flex-shrink-0'>
    <path
      d='M10.6873 9.74467L13.5427 12.5993L12.5993 13.5427L9.74467 10.6873C8.68249 11.5388 7.36133 12.0019 6 12C2.688 12 0 9.312 0 6C0 2.688 2.688 0 6 0C9.312 0 12 2.688 12 6C12.0019 7.36133 11.5388 8.68249 10.6873 9.74467ZM9.35 9.25C10.1959 8.37981 10.6684 7.21358 10.6667 6C10.6667 3.422 8.578 1.33333 6 1.33333C3.422 1.33333 1.33333 3.422 1.33333 6C1.33333 8.578 3.422 10.6667 6 10.6667C7.21358 10.6684 8.37981 10.1959 9.25 9.35L9.35 9.25Z'
      fill='currentColor'
    />
  </svg>
)

export type AmenityCode = string
export type AmenityItem = { code: string; label: string }

export type PropertyImage = {
  category?: string | null // null 허용
  url: string
  sort_order?: number
  is_primary?: boolean
}

export type PropertyGetResponse = {
  id: string
  name: string
  description?: string | null
  check_in?: string | null
  check_out?: string | null
  price_per_night: number
  currency: string
  created_at: string
  updated_at: string
  is_visible: boolean // ✅ DB 컬럼 추가했으니까 여기서도 필수로 가져오기

  images: { url: string; sort_order?: number; is_primary?: boolean; category?: string | null }[]
  rules: string[]
  amenities: AmenityItem[]
  address?: {
    iframe_src?: string | null
    address1?: string | null
    address2?: string | null
    guide?: string | null
  }
  space_info?: {
    available_people?: number | null
    living_rooms?: number
    bedrooms?: number
    bathrooms?: number
  }
}

export type PropertyCreatePayload = {
  name: string
  description?: string
  check_in?: string
  check_out?: string
  price_per_night: number
  currency?: string
  address?: PropertyGetResponse['address']
  space_info?: PropertyGetResponse['space_info']
  rules?: string[]
  amenities?: AmenityCode[]
  images?: PropertyImage[]
  is_visible?: boolean // ✅ 생성 시 true/false 지정 (안 보내면 DB default true)
}

export type PropertyUpdatePayload = Partial<Omit<PropertyCreatePayload, 'name' | 'price_per_night'>> & {
  id: string
  name?: string
  price_per_night?: number
  // rules/amenities/images:
  //  - undefined: 변경 없음
  //  - []: 해당 목록을 비우기(치환)
}

export type PropertyListItem = {
  id: string
  name: string
  price_per_night: number
  currency: string
  created_at: string
  thumbnail: string | null
  images: { url: string }[]
  address1: string | null
  address2: string | null
  is_visible: boolean // ✅ 리스트 카드에도 비노출 뱃지 띄울 수 있도록 추가
}

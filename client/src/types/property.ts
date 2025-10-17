export type AmenityCode = string
export type AmenityItem = { code: string; label: string }

export type PropertyImage = {
  category: string
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
  images: { url: string; sort_order?: number; is_primary?: boolean; category?: string }[]
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
}

export type PropertyUpdatePayload = Partial<Omit<PropertyCreatePayload, 'name' | 'price_per_night'>> & {
  id: string
  name?: string
  price_per_night?: number
}

export type PropertyListItem = {
  id: string
  name: string
  price_per_night: number
  currency: string
  created_at: string
  thumbnail: string | null
  images: { url: string }[]
  location: string | null
}

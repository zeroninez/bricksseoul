import { z } from 'zod'

const timeHHMM = z
  .string()
  .regex(/^\d{2}:\d{2}$/)
  .optional()
  .nullable()

export const imageSchema = z.object({
  category: z.string().optional().nullable(),
  url: z.string().url(),
  sort_order: z.number().int().optional().nullable(),
  is_primary: z.boolean().optional().nullable(),
})

export const addressSchema = z.object({
  iframe_src: z.string().url().optional().nullable(),
  address1: z.string().optional().nullable(),
  address2: z.string().optional().nullable(),
  guide: z.string().optional().nullable(),
})

export const spaceSchema = z.object({
  available_people: z.number().int().min(0).optional().nullable(),
  living_rooms: z.number().int().min(0).optional().nullable(),
  bedrooms: z.number().int().min(0).optional().nullable(),
  bathrooms: z.number().int().min(0).optional().nullable(),
})

export const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  check_in: timeHHMM,
  check_out: timeHHMM,
  price_per_night: z.number().min(0),
  currency: z.string().min(1).optional(),
  address: addressSchema.optional().nullable(),
  space_info: spaceSchema.optional().nullable(),
  rules: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(imageSchema).optional(),
})

export const updateSchema = createSchema.partial().extend({
  id: z.string().uuid(),
})

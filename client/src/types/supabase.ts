export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      access_codes: {
        Row: {
          code: string
          created_at: string | null
          id: number
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      access_logs: {
        Row: {
          access_code_id: number | null
          accessed_at: string | null
          id: number
          ip_address: unknown
          user_agent: string | null
          user_type: string | null
        }
        Insert: {
          access_code_id?: number | null
          accessed_at?: string | null
          id?: number
          ip_address?: unknown
          user_agent?: string | null
          user_type?: string | null
        }
        Update: {
          access_code_id?: number | null
          accessed_at?: string | null
          id?: number
          ip_address?: unknown
          user_agent?: string | null
          user_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "access_logs_access_code_id_fkey"
            columns: ["access_code_id"]
            isOneToOne: false
            referencedRelation: "access_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          setting_key: string
          setting_value: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          setting_key: string
          setting_value: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          setting_key?: string
          setting_value?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      amenities: {
        Row: {
          code: string
          label: string
        }
        Insert: {
          code: string
          label: string
        }
        Update: {
          code?: string
          label?: string
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          created_at: string
          email: string
          id: string
          password_hash: string | null
          reservation_code: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          password_hash?: string | null
          reservation_code?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          password_hash?: string | null
          reservation_code?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      inquiry_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          inquiry_id: string
          sender_name: string | null
          sender_type: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          inquiry_id: string
          sender_name?: string | null
          sender_type: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          inquiry_id?: string
          sender_name?: string | null
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiry_messages_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          check_in: string | null
          check_out: string | null
          created_at: string
          currency: string
          description: string | null
          id: string
          is_visible: boolean
          name: string
          price_per_night: number
          updated_at: string
        }
        Insert: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_visible?: boolean
          name: string
          price_per_night: number
          updated_at?: string
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_visible?: boolean
          name?: string
          price_per_night?: number
          updated_at?: string
        }
        Relationships: []
      }
      property_address: {
        Row: {
          address1: string | null
          address2: string | null
          guide: string | null
          iframe_src: string | null
          property_id: string
        }
        Insert: {
          address1?: string | null
          address2?: string | null
          guide?: string | null
          iframe_src?: string | null
          property_id: string
        }
        Update: {
          address1?: string | null
          address2?: string | null
          guide?: string | null
          iframe_src?: string | null
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_address_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: true
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_amenities: {
        Row: {
          amenity_code: string
          property_id: string
        }
        Insert: {
          amenity_code: string
          property_id: string
        }
        Update: {
          amenity_code?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_amenities_amenity_code_fkey"
            columns: ["amenity_code"]
            isOneToOne: false
            referencedRelation: "amenities"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "property_amenities_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_images: {
        Row: {
          category: string
          id: string
          is_primary: boolean
          property_id: string
          sort_order: number
          url: string
        }
        Insert: {
          category: string
          id?: string
          is_primary?: boolean
          property_id: string
          sort_order?: number
          url: string
        }
        Update: {
          category?: string
          id?: string
          is_primary?: boolean
          property_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_rules: {
        Row: {
          id: string
          property_id: string
          rule_text: string
        }
        Insert: {
          id?: string
          property_id: string
          rule_text: string
        }
        Update: {
          id?: string
          property_id?: string
          rule_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_rules_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_space: {
        Row: {
          available_people: number | null
          bathrooms: number
          bedrooms: number
          living_rooms: number
          property_id: string
        }
        Insert: {
          available_people?: number | null
          bathrooms?: number
          bedrooms?: number
          living_rooms?: number
          property_id: string
        }
        Update: {
          available_people?: number | null
          bathrooms?: number
          bedrooms?: number
          living_rooms?: number
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_space_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: true
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          cancelled_at: string | null
          check_in_date: string
          check_out_date: string
          confirmed_at: string | null
          created_at: string | null
          email: string
          guest_count: number
          id: string
          invoice: string | null
          options: Json | null
          property_id: string
          reservation_code: string
          special_requests: string | null
          status: string
          total_price: number
          updated_at: string | null
        }
        Insert: {
          cancelled_at?: string | null
          check_in_date: string
          check_out_date: string
          confirmed_at?: string | null
          created_at?: string | null
          email: string
          guest_count: number
          id?: string
          invoice?: string | null
          options?: Json | null
          property_id: string
          reservation_code?: string
          special_requests?: string | null
          status?: string
          total_price: number
          updated_at?: string | null
        }
        Update: {
          cancelled_at?: string | null
          check_in_date?: string
          check_out_date?: string
          confirmed_at?: string | null
          created_at?: string | null
          email?: string
          guest_count?: number
          id?: string
          invoice?: string | null
          options?: Json | null
          property_id?: string
          reservation_code?: string
          special_requests?: string | null
          status?: string
          total_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      fn_property_create:
        | {
            Args: {
              p_address?: Json
              p_amenities?: string[]
              p_check_in: string
              p_check_out: string
              p_currency?: string
              p_description: string
              p_images?: Json
              p_name: string
              p_price_per_night: number
              p_rules?: string[]
              p_space?: Json
            }
            Returns: string
          }
        | {
            Args: {
              p_address?: Json
              p_amenities?: string[]
              p_check_in: string
              p_check_out: string
              p_currency?: string
              p_description: string
              p_images?: Json
              p_is_visible?: boolean
              p_name: string
              p_price_per_night: number
              p_rules?: string[]
              p_space?: Json
            }
            Returns: string
          }
      fn_property_delete: { Args: { p_id: string }; Returns: undefined }
      fn_property_get: { Args: { p_id: string }; Returns: Json }
      fn_property_update:
        | {
            Args: {
              p_address?: Json
              p_amenities?: string[]
              p_check_in?: string
              p_check_out?: string
              p_currency?: string
              p_description?: string
              p_id: string
              p_images?: Json
              p_name?: string
              p_price_per_night?: number
              p_rules?: string[]
              p_space?: Json
            }
            Returns: undefined
          }
        | {
            Args: {
              p_address?: Json
              p_amenities?: string[]
              p_check_in?: string
              p_check_out?: string
              p_currency?: string
              p_description?: string
              p_id: string
              p_images?: Json
              p_is_visible?: boolean
              p_name?: string
              p_price_per_night?: number
              p_rules?: string[]
              p_space?: Json
            }
            Returns: undefined
          }
      generate_reservation_code: { Args: never; Returns: string }
      get_unique_reservation_code: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

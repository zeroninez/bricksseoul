export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
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
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          access_code_id?: number | null
          accessed_at?: string | null
          id?: number
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          access_code_id?: number | null
          accessed_at?: string | null
          id?: number
          ip_address?: string | null
          user_agent?: string | null
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
      property: {
        Row: {
          address: string | null
          created_at: string | null
          description: string | null
          features: Json | null
          id: number
          latitude: number | null
          longitude: number | null
          name: string
          payment_link: string | null
          slug: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: number
          latitude?: number | null
          longitude?: number | null
          name: string
          payment_link?: string | null
          slug?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: number
          latitude?: number | null
          longitude?: number | null
          name?: string
          payment_link?: string | null
          slug?: string | null
        }
        Relationships: []
      }
      property_detail: {
        Row: {
          amenities: Json | null
          description_blocks: Json | null
          nearby_info: string | null
          property_id: number
        }
        Insert: {
          amenities?: Json | null
          description_blocks?: Json | null
          nearby_info?: string | null
          property_id: number
        }
        Update: {
          amenities?: Json | null
          description_blocks?: Json | null
          nearby_info?: string | null
          property_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "property_detail_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: true
            referencedRelation: "property"
            referencedColumns: ["id"]
          },
        ]
      }
      property_image: {
        Row: {
          id: number
          name: string | null
          property_id: number | null
          sort_order: number | null
          src: string | null
        }
        Insert: {
          id?: number
          name?: string | null
          property_id?: number | null
          sort_order?: number | null
          src?: string | null
        }
        Update: {
          id?: number
          name?: string | null
          property_id?: number | null
          sort_order?: number | null
          src?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_image_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property"
            referencedColumns: ["id"]
          },
        ]
      }
      property_reservation: {
        Row: {
          end_date: string | null
          id: number
          property_id: number | null
          requested_at: string | null
          requester_email: string | null
          start_date: string | null
          status: string | null
        }
        Insert: {
          end_date?: string | null
          id?: number
          property_id?: number | null
          requested_at?: string | null
          requester_email?: string | null
          start_date?: string | null
          status?: string | null
        }
        Update: {
          end_date?: string | null
          id?: number
          property_id?: number | null
          requested_at?: string | null
          requester_email?: string | null
          start_date?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_reservation_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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

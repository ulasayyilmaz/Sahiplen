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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      dog_photos: {
        Row: {
          created_at: string
          dog_id: string
          id: string
          sort_order: number
          url: string
        }
        Insert: {
          created_at?: string
          dog_id: string
          id?: string
          sort_order?: number
          url: string
        }
        Update: {
          created_at?: string
          dog_id?: string
          id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "dog_photos_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
        ]
      }
      dogs: {
        Row: {
          capture_district: string | null
          color: string | null
          created_at: string
          description: string | null
          energy_level: number | null
          estimated_birth_date: string
          good_with_cats: boolean | null
          good_with_dogs: boolean | null
          good_with_kids: boolean | null
          health_notes: string | null
          id: string
          last_verified_at: string
          microchip_number: string | null
          name: string
          neutered: boolean
          sex: Database["public"]["Enums"]["dog_sex"]
          shelter_id: string
          size: Database["public"]["Enums"]["dog_size"]
          status: Database["public"]["Enums"]["dog_status"]
          status_changed_at: string
          updated_at: string
          vaccinated: boolean
        }
        Insert: {
          capture_district?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          energy_level?: number | null
          estimated_birth_date: string
          good_with_cats?: boolean | null
          good_with_dogs?: boolean | null
          good_with_kids?: boolean | null
          health_notes?: string | null
          id?: string
          last_verified_at?: string
          microchip_number?: string | null
          name: string
          neutered?: boolean
          sex?: Database["public"]["Enums"]["dog_sex"]
          shelter_id: string
          size: Database["public"]["Enums"]["dog_size"]
          status?: Database["public"]["Enums"]["dog_status"]
          status_changed_at?: string
          updated_at?: string
          vaccinated?: boolean
        }
        Update: {
          capture_district?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          energy_level?: number | null
          estimated_birth_date?: string
          good_with_cats?: boolean | null
          good_with_dogs?: boolean | null
          good_with_kids?: boolean | null
          health_notes?: string | null
          id?: string
          last_verified_at?: string
          microchip_number?: string | null
          name?: string
          neutered?: boolean
          sex?: Database["public"]["Enums"]["dog_sex"]
          shelter_id?: string
          size?: Database["public"]["Enums"]["dog_size"]
          status?: Database["public"]["Enums"]["dog_status"]
          status_changed_at?: string
          updated_at?: string
          vaccinated?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "dogs_shelter_id_fkey"
            columns: ["shelter_id"]
            isOneToOne: false
            referencedRelation: "shelters"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          approved: boolean
          created_at: string
          full_name: string
          phone: string | null
          role: Database["public"]["Enums"]["staff_role"]
          shelter_id: string | null
          user_id: string
        }
        Insert: {
          approved?: boolean
          created_at?: string
          full_name: string
          phone?: string | null
          role?: Database["public"]["Enums"]["staff_role"]
          shelter_id?: string | null
          user_id: string
        }
        Update: {
          approved?: boolean
          created_at?: string
          full_name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["staff_role"]
          shelter_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_shelter_id_fkey"
            columns: ["shelter_id"]
            isOneToOne: false
            referencedRelation: "shelters"
            referencedColumns: ["id"]
          },
        ]
      }
      shelters: {
        Row: {
          address: string | null
          city: string
          created_at: string
          district: string
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          visiting_hours: string | null
        }
        Insert: {
          address?: string | null
          city: string
          created_at?: string
          district: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          visiting_hours?: string | null
        }
        Update: {
          address?: string | null
          city?: string
          created_at?: string
          district?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          visiting_hours?: string | null
        }
        Relationships: []
      }
      status_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          dog_id: string
          id: string
          new_status: Database["public"]["Enums"]["dog_status"]
          old_status: Database["public"]["Enums"]["dog_status"] | null
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          dog_id: string
          id?: string
          new_status: Database["public"]["Enums"]["dog_status"]
          old_status?: Database["public"]["Enums"]["dog_status"] | null
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          dog_id?: string
          id?: string
          new_status?: Database["public"]["Enums"]["dog_status"]
          old_status?: Database["public"]["Enums"]["dog_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "status_history_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_reject_staff: { Args: { target_user: string }; Returns: undefined }
      admin_set_staff: {
        Args: {
          set_approved: boolean
          set_shelter_id: string
          target_user: string
        }
        Returns: undefined
      }
    }
    Enums: {
      dog_sex: "male" | "female" | "unknown"
      dog_size: "small" | "medium" | "large"
      dog_status:
        | "available"
        | "reserved"
        | "adopted"
        | "deceased"
        | "transferred"
      staff_role: "staff" | "shelter_admin" | "platform_admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      dog_sex: ["male", "female", "unknown"],
      dog_size: ["small", "medium", "large"],
      dog_status: [
        "available",
        "reserved",
        "adopted",
        "deceased",
        "transferred",
      ],
      staff_role: ["staff", "shelter_admin", "platform_admin"],
    },
  },
} as const

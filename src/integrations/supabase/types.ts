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
      crop_journal: {
        Row: {
          activity_date: string
          activity_type: string
          cost: number | null
          created_at: string
          crop_name: string
          farmer_id: string
          id: string
          notes: string | null
          quantity: string | null
          weather_conditions: string | null
        }
        Insert: {
          activity_date: string
          activity_type: string
          cost?: number | null
          created_at?: string
          crop_name: string
          farmer_id: string
          id?: string
          notes?: string | null
          quantity?: string | null
          weather_conditions?: string | null
        }
        Update: {
          activity_date?: string
          activity_type?: string
          cost?: number | null
          created_at?: string
          crop_name?: string
          farmer_id?: string
          id?: string
          notes?: string | null
          quantity?: string | null
          weather_conditions?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crop_journal_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
        ]
      }
      crops: {
        Row: {
          created_at: string
          growth_days: number | null
          id: string
          name: string
          scientific_name: string | null
          typical_season: string | null
          water_requirements: string | null
        }
        Insert: {
          created_at?: string
          growth_days?: number | null
          id?: string
          name: string
          scientific_name?: string | null
          typical_season?: string | null
          water_requirements?: string | null
        }
        Update: {
          created_at?: string
          growth_days?: number | null
          id?: string
          name?: string
          scientific_name?: string | null
          typical_season?: string | null
          water_requirements?: string | null
        }
        Relationships: []
      }
      farmers: {
        Row: {
          created_at: string
          district: string | null
          farm_size_acres: number | null
          gps_latitude: number | null
          gps_longitude: number | null
          id: string
          name: string
          phone_number: string
          preferred_language:
            | Database["public"]["Enums"]["indian_language"]
            | null
          primary_crops: string[] | null
          role: Database["public"]["Enums"]["farmer_role"] | null
          sms_enabled: boolean | null
          state: string | null
          updated_at: string
          user_id: string
          village: string | null
        }
        Insert: {
          created_at?: string
          district?: string | null
          farm_size_acres?: number | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          id?: string
          name: string
          phone_number: string
          preferred_language?:
            | Database["public"]["Enums"]["indian_language"]
            | null
          primary_crops?: string[] | null
          role?: Database["public"]["Enums"]["farmer_role"] | null
          sms_enabled?: boolean | null
          state?: string | null
          updated_at?: string
          user_id: string
          village?: string | null
        }
        Update: {
          created_at?: string
          district?: string | null
          farm_size_acres?: number | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          id?: string
          name?: string
          phone_number?: string
          preferred_language?:
            | Database["public"]["Enums"]["indian_language"]
            | null
          primary_crops?: string[] | null
          role?: Database["public"]["Enums"]["farmer_role"] | null
          sms_enabled?: boolean | null
          state?: string | null
          updated_at?: string
          user_id?: string
          village?: string | null
        }
        Relationships: []
      }
      market_prices: {
        Row: {
          created_at: string
          crop_name: string
          district: string
          id: string
          market_name: string
          max_price: number | null
          min_price: number | null
          modal_price: number | null
          price_date: string
          price_trend: string | null
          state: string
        }
        Insert: {
          created_at?: string
          crop_name: string
          district: string
          id?: string
          market_name: string
          max_price?: number | null
          min_price?: number | null
          modal_price?: number | null
          price_date: string
          price_trend?: string | null
          state: string
        }
        Update: {
          created_at?: string
          crop_name?: string
          district?: string
          id?: string
          market_name?: string
          max_price?: number | null
          min_price?: number | null
          modal_price?: number | null
          price_date?: string
          price_trend?: string | null
          state?: string
        }
        Relationships: []
      }
      pest_disease_reports: {
        Row: {
          created_at: string
          crop_affected: string
          description: string | null
          farmer_id: string
          id: string
          image_url: string | null
          is_verified: boolean | null
          latitude: number | null
          longitude: number | null
          pest_disease_name: string | null
          severity: string
          treatment_used: string | null
        }
        Insert: {
          created_at?: string
          crop_affected: string
          description?: string | null
          farmer_id: string
          id?: string
          image_url?: string | null
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          pest_disease_name?: string | null
          severity: string
          treatment_used?: string | null
        }
        Update: {
          created_at?: string
          crop_affected?: string
          description?: string | null
          farmer_id?: string
          id?: string
          image_url?: string | null
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          pest_disease_name?: string | null
          severity?: string
          treatment_used?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pest_disease_reports_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
        ]
      }
      satellite_data: {
        Row: {
          analysis_result: Json | null
          capture_date: string
          created_at: string
          farmer_id: string
          health_status: string | null
          id: string
          latitude: number
          longitude: number
          ndvi_value: number | null
          recommendations: string | null
        }
        Insert: {
          analysis_result?: Json | null
          capture_date: string
          created_at?: string
          farmer_id: string
          health_status?: string | null
          id?: string
          latitude: number
          longitude: number
          ndvi_value?: number | null
          recommendations?: string | null
        }
        Update: {
          analysis_result?: Json | null
          capture_date?: string
          created_at?: string
          farmer_id?: string
          health_status?: string | null
          id?: string
          latitude?: number
          longitude?: number
          ndvi_value?: number | null
          recommendations?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "satellite_data_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
        ]
      }
      soil_analysis: {
        Row: {
          analysis_result: Json | null
          created_at: string
          farmer_id: string
          id: string
          image_url: string | null
          nitrogen_level: string | null
          organic_matter: number | null
          ph_level: number | null
          phosphorus_level: string | null
          potassium_level: string | null
          recommendations: string | null
        }
        Insert: {
          analysis_result?: Json | null
          created_at?: string
          farmer_id: string
          id?: string
          image_url?: string | null
          nitrogen_level?: string | null
          organic_matter?: number | null
          ph_level?: number | null
          phosphorus_level?: string | null
          potassium_level?: string | null
          recommendations?: string | null
        }
        Update: {
          analysis_result?: Json | null
          created_at?: string
          farmer_id?: string
          id?: string
          image_url?: string | null
          nitrogen_level?: string | null
          organic_matter?: number | null
          ph_level?: number | null
          phosphorus_level?: string | null
          potassium_level?: string | null
          recommendations?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "soil_analysis_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_interactions: {
        Row: {
          created_at: string
          farmer_id: string
          id: string
          input_language: Database["public"]["Enums"]["indian_language"]
          interaction_type: string | null
          original_text: string | null
          response_language: Database["public"]["Enums"]["indian_language"]
          response_text: string | null
          translated_text: string | null
        }
        Insert: {
          created_at?: string
          farmer_id: string
          id?: string
          input_language: Database["public"]["Enums"]["indian_language"]
          interaction_type?: string | null
          original_text?: string | null
          response_language: Database["public"]["Enums"]["indian_language"]
          response_text?: string | null
          translated_text?: string | null
        }
        Update: {
          created_at?: string
          farmer_id?: string
          id?: string
          input_language?: Database["public"]["Enums"]["indian_language"]
          interaction_type?: string | null
          original_text?: string | null
          response_language?: Database["public"]["Enums"]["indian_language"]
          response_text?: string | null
          translated_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_interactions_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
        ]
      }
      weather_alerts: {
        Row: {
          alert_type: Database["public"]["Enums"]["alert_type"]
          created_at: string
          description: string
          district: string
          end_date: string | null
          id: string
          is_active: boolean | null
          severity: string
          start_date: string
          state: string
          title: string
        }
        Insert: {
          alert_type: Database["public"]["Enums"]["alert_type"]
          created_at?: string
          description: string
          district: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          severity: string
          start_date: string
          state: string
          title: string
        }
        Update: {
          alert_type?: Database["public"]["Enums"]["alert_type"]
          created_at?: string
          description?: string
          district?: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          severity?: string
          start_date?: string
          state?: string
          title?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      alert_type: "weather" | "pest" | "disease" | "market" | "harvest"
      farmer_role: "farmer" | "admin" | "expert"
      indian_language:
        | "english"
        | "hindi"
        | "kannada"
        | "tamil"
        | "telugu"
        | "marathi"
        | "gujarati"
        | "bengali"
        | "punjabi"
        | "malayalam"
        | "odia"
        | "assamese"
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
    Enums: {
      alert_type: ["weather", "pest", "disease", "market", "harvest"],
      farmer_role: ["farmer", "admin", "expert"],
      indian_language: [
        "english",
        "hindi",
        "kannada",
        "tamil",
        "telugu",
        "marathi",
        "gujarati",
        "bengali",
        "punjabi",
        "malayalam",
        "odia",
        "assamese",
      ],
    },
  },
} as const

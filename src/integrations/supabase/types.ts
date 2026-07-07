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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          pinned: boolean
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pinned?: boolean
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pinned?: boolean
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          image_url: string | null
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          image_url?: string | null
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          calories: number | null
          created_at: string
          description: string | null
          id: string
          ingredients: Json
          meal_type: string
          name: string
          nutrition: Json | null
          plan_date: string
          steps: Json
          user_id: string
        }
        Insert: {
          calories?: number | null
          created_at?: string
          description?: string | null
          id?: string
          ingredients?: Json
          meal_type: string
          name: string
          nutrition?: Json | null
          plan_date?: string
          steps?: Json
          user_id: string
        }
        Update: {
          calories?: number | null
          created_at?: string
          description?: string | null
          id?: string
          ingredients?: Json
          meal_type?: string
          name?: string
          nutrition?: Json | null
          plan_date?: string
          steps?: Json
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          ai_updates: boolean
          new_features: boolean
          product_news: boolean
          scan_completed: boolean
          security_alerts: boolean
          updated_at: string
          user_id: string
          weekly_tips: boolean
        }
        Insert: {
          ai_updates?: boolean
          new_features?: boolean
          product_news?: boolean
          scan_completed?: boolean
          security_alerts?: boolean
          updated_at?: string
          user_id: string
          weekly_tips?: boolean
        }
        Update: {
          ai_updates?: boolean
          new_features?: boolean
          product_news?: boolean
          scan_completed?: boolean
          security_alerts?: boolean
          updated_at?: string
          user_id?: string
          weekly_tips?: boolean
        }
        Relationships: []
      }
      points_ledger: {
        Row: {
          action: string
          amount: number
          created_at: string
          dedupe_key: string | null
          id: string
          user_id: string
        }
        Insert: {
          action: string
          amount: number
          created_at?: string
          dedupe_key?: string | null
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          amount?: number
          created_at?: string
          dedupe_key?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          achievements: Json
          ai_interests: string[]
          ai_points: number
          avatar_url: string | null
          country: string | null
          created_at: string
          diet_preference: string | null
          dietary_goal: string | null
          display_name: string | null
          id: string
          language: string | null
          theme: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          achievements?: Json
          ai_interests?: string[]
          ai_points?: number
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          diet_preference?: string | null
          dietary_goal?: string | null
          display_name?: string | null
          id: string
          language?: string | null
          theme?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          achievements?: Json
          ai_interests?: string[]
          ai_points?: number
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          diet_preference?: string | null
          dietary_goal?: string | null
          display_name?: string | null
          id?: string
          language?: string | null
          theme?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      scans: {
        Row: {
          ai_result: Json
          category: string
          confidence: number | null
          created_at: string
          id: string
          image_path: string | null
          is_favorite: boolean
          safety: string | null
          scan_type: string
          thumbnail_url: string | null
          title: string
          user_id: string
        }
        Insert: {
          ai_result?: Json
          category?: string
          confidence?: number | null
          created_at?: string
          id?: string
          image_path?: string | null
          is_favorite?: boolean
          safety?: string | null
          scan_type?: string
          thumbnail_url?: string | null
          title: string
          user_id: string
        }
        Update: {
          ai_result?: Json
          category?: string
          confidence?: number | null
          created_at?: string
          id?: string
          image_path?: string | null
          is_favorite?: boolean
          safety?: string | null
          scan_type?: string
          thumbnail_url?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          subject: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          subject: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          ai_model: string
          created_at: string
          creativity: number
          default_behavior: string
          language: string
          response_length: string
          theme: string
          tone: string
          updated_at: string
          user_id: string
          voice: string
          writing_style: string
        }
        Insert: {
          ai_model?: string
          created_at?: string
          creativity?: number
          default_behavior?: string
          language?: string
          response_length?: string
          theme?: string
          tone?: string
          updated_at?: string
          user_id: string
          voice?: string
          writing_style?: string
        }
        Update: {
          ai_model?: string
          created_at?: string
          creativity?: number
          default_behavior?: string
          language?: string
          response_length?: string
          theme?: string
          tone?: string
          updated_at?: string
          user_id?: string
          voice?: string
          writing_style?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_points: {
        Args: { _action: string; _dedupe_key?: string; _user_id: string }
        Returns: number
      }
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

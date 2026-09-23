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
      isl_gloss_mappings: {
        Row: {
          category: string
          created_at: string
          english_word: string | null
          hindi_word: string | null
          id: string
          isl_gloss: string
          priority: number
          sign_video_id: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          english_word?: string | null
          hindi_word?: string | null
          id?: string
          isl_gloss: string
          priority?: number
          sign_video_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          english_word?: string | null
          hindi_word?: string | null
          id?: string
          isl_gloss?: string
          priority?: number
          sign_video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "isl_gloss_mappings_sign_video_id_fkey"
            columns: ["sign_video_id"]
            isOneToOne: false
            referencedRelation: "sign_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      model_versions: {
        Row: {
          accuracy: number | null
          created_at: string
          file_path: string | null
          id: string
          is_active: boolean
          model_type: string
          name: string
          notes: string | null
          status: string
          version: string
        }
        Insert: {
          accuracy?: number | null
          created_at?: string
          file_path?: string | null
          id?: string
          is_active?: boolean
          model_type?: string
          name: string
          notes?: string | null
          status?: string
          version: string
        }
        Update: {
          accuracy?: number | null
          created_at?: string
          file_path?: string | null
          id?: string
          is_active?: boolean
          model_type?: string
          name?: string
          notes?: string | null
          status?: string
          version?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string | null
          preferred_language: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          preferred_language?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          preferred_language?: string
        }
        Relationships: []
      }
      recognition_classes: {
        Row: {
          class_index: number
          created_at: string
          english: string
          gloss: string
          hindi: string | null
          id: string
          is_active: boolean
        }
        Insert: {
          class_index: number
          created_at?: string
          english: string
          gloss: string
          hindi?: string | null
          id?: string
          is_active?: boolean
        }
        Update: {
          class_index?: number
          created_at?: string
          english?: string
          gloss?: string
          hindi?: string | null
          id?: string
          is_active?: boolean
        }
        Relationships: []
      }
      recognition_history: {
        Row: {
          confidence: number
          created_at: string
          english_text: string | null
          hindi_text: string | null
          id: string
          model_mode: string
          recognized_gloss: string
          user_id: string
        }
        Insert: {
          confidence?: number
          created_at?: string
          english_text?: string | null
          hindi_text?: string | null
          id?: string
          model_mode?: string
          recognized_gloss: string
          user_id: string
        }
        Update: {
          confidence?: number
          created_at?: string
          english_text?: string | null
          hindi_text?: string | null
          id?: string
          model_mode?: string
          recognized_gloss?: string
          user_id?: string
        }
        Relationships: []
      }
      sign_videos: {
        Row: {
          category: string
          created_at: string
          description: string | null
          duration: number | null
          english: string
          gloss: string
          hindi: string | null
          id: string
          is_active: boolean
          keywords: string[]
          thumbnail_url: string | null
          video_url: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          duration?: number | null
          english: string
          gloss: string
          hindi?: string | null
          id?: string
          is_active?: boolean
          keywords?: string[]
          thumbnail_url?: string | null
          video_url?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          duration?: number | null
          english?: string
          gloss?: string
          hindi?: string | null
          id?: string
          is_active?: boolean
          keywords?: string[]
          thumbnail_url?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      translation_history: {
        Row: {
          created_at: string
          gloss_sequence: string[]
          id: string
          input_type: string
          is_announcement: boolean
          normalized_text: string | null
          original_text: string
          source_language: string
          user_id: string
        }
        Insert: {
          created_at?: string
          gloss_sequence?: string[]
          id?: string
          input_type?: string
          is_announcement?: boolean
          normalized_text?: string | null
          original_text: string
          source_language?: string
          user_id: string
        }
        Update: {
          created_at?: string
          gloss_sequence?: string[]
          id?: string
          input_type?: string
          is_announcement?: boolean
          normalized_text?: string | null
          original_text?: string
          source_language?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "admin"
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
      app_role: ["user", "admin"],
    },
  },
} as const

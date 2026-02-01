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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_feedback: {
        Row: {
          created_at: string
          edits_made: Json | null
          feedback_text: string | null
          feedback_type: string | null
          generation_id: string | null
          id: string
          rating: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          edits_made?: Json | null
          feedback_text?: string | null
          feedback_type?: string | null
          generation_id?: string | null
          id?: string
          rating?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          edits_made?: Json | null
          feedback_text?: string | null
          feedback_type?: string | null
          generation_id?: string | null
          id?: string
          rating?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_feedback_generation_id_fkey"
            columns: ["generation_id"]
            isOneToOne: false
            referencedRelation: "ai_generations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_generations: {
        Row: {
          asset_type: string
          color_palette: Json | null
          created_at: string
          cultural_context: string | null
          generation_time_ms: number | null
          id: string
          location: string | null
          project_id: string | null
          prompt_used: string
          render_engine: string | null
          result_image_url: string | null
          style_description: string | null
          user_id: string
        }
        Insert: {
          asset_type: string
          color_palette?: Json | null
          created_at?: string
          cultural_context?: string | null
          generation_time_ms?: number | null
          id?: string
          location?: string | null
          project_id?: string | null
          prompt_used: string
          render_engine?: string | null
          result_image_url?: string | null
          style_description?: string | null
          user_id: string
        }
        Update: {
          asset_type?: string
          color_palette?: Json | null
          created_at?: string
          cultural_context?: string | null
          generation_time_ms?: number | null
          id?: string
          location?: string | null
          project_id?: string | null
          prompt_used?: string
          render_engine?: string | null
          result_image_url?: string | null
          style_description?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_generations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_knowledge: {
        Row: {
          category: string | null
          confidence_score: number | null
          created_at: string
          id: string
          key: string
          knowledge_type: string
          success_rate: number | null
          updated_at: string
          usage_count: number | null
          user_id: string | null
          value: Json
        }
        Insert: {
          category?: string | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          key: string
          knowledge_type: string
          success_rate?: number | null
          updated_at?: string
          usage_count?: number | null
          user_id?: string | null
          value: Json
        }
        Update: {
          category?: string | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          key?: string
          knowledge_type?: string
          success_rate?: number | null
          updated_at?: string
          usage_count?: number | null
          user_id?: string | null
          value?: Json
        }
        Relationships: []
      }
      brand_styles: {
        Row: {
          accent_color: string | null
          accent_font: string | null
          body_font: string | null
          brand_id: string
          brand_voice: string[] | null
          color_palette: Json | null
          created_at: string | null
          cultural_context: string | null
          custom_prompts: Json | null
          heading_font: string | null
          icon_style: string | null
          id: string
          imagery_style: string | null
          industry: string | null
          mood_keywords: string[] | null
          pattern_style: string | null
          preferred_render_engine: string | null
          primary_color: string | null
          print_color_mode: string | null
          secondary_color: string | null
          target_audience: string | null
          tone_keywords: string[] | null
          typography_scale: Json | null
          updated_at: string | null
          writing_style: string | null
        }
        Insert: {
          accent_color?: string | null
          accent_font?: string | null
          body_font?: string | null
          brand_id: string
          brand_voice?: string[] | null
          color_palette?: Json | null
          created_at?: string | null
          cultural_context?: string | null
          custom_prompts?: Json | null
          heading_font?: string | null
          icon_style?: string | null
          id?: string
          imagery_style?: string | null
          industry?: string | null
          mood_keywords?: string[] | null
          pattern_style?: string | null
          preferred_render_engine?: string | null
          primary_color?: string | null
          print_color_mode?: string | null
          secondary_color?: string | null
          target_audience?: string | null
          tone_keywords?: string[] | null
          typography_scale?: Json | null
          updated_at?: string | null
          writing_style?: string | null
        }
        Update: {
          accent_color?: string | null
          accent_font?: string | null
          body_font?: string | null
          brand_id?: string
          brand_voice?: string[] | null
          color_palette?: Json | null
          created_at?: string | null
          cultural_context?: string | null
          custom_prompts?: Json | null
          heading_font?: string | null
          icon_style?: string | null
          id?: string
          imagery_style?: string | null
          industry?: string | null
          mood_keywords?: string[] | null
          pattern_style?: string | null
          preferred_render_engine?: string | null
          primary_color?: string | null
          print_color_mode?: string | null
          secondary_color?: string | null
          target_audience?: string | null
          tone_keywords?: string[] | null
          typography_scale?: Json | null
          updated_at?: string | null
          writing_style?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_styles_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          logo_monochrome_url: string | null
          logo_reversed_url: string | null
          logo_url: string | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          logo_monochrome_url?: string | null
          logo_reversed_url?: string | null
          logo_url?: string | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          logo_monochrome_url?: string | null
          logo_reversed_url?: string | null
          logo_url?: string | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      print_templates: {
        Row: {
          asset_type: string | null
          bleed_inches: number | null
          color_mode: string | null
          created_at: string
          description: string | null
          file_path: string
          has_die_lines: boolean | null
          has_fold_lines: boolean | null
          has_perforation: boolean | null
          height_inches: number | null
          id: string
          is_favorite: boolean | null
          name: string
          project_id: string | null
          resolution_dpi: number | null
          safe_zone_inches: number | null
          source_vendor: string | null
          specs: Json
          thumbnail_url: string | null
          updated_at: string
          user_id: string
          width_inches: number | null
        }
        Insert: {
          asset_type?: string | null
          bleed_inches?: number | null
          color_mode?: string | null
          created_at?: string
          description?: string | null
          file_path: string
          has_die_lines?: boolean | null
          has_fold_lines?: boolean | null
          has_perforation?: boolean | null
          height_inches?: number | null
          id?: string
          is_favorite?: boolean | null
          name: string
          project_id?: string | null
          resolution_dpi?: number | null
          safe_zone_inches?: number | null
          source_vendor?: string | null
          specs?: Json
          thumbnail_url?: string | null
          updated_at?: string
          user_id: string
          width_inches?: number | null
        }
        Update: {
          asset_type?: string | null
          bleed_inches?: number | null
          color_mode?: string | null
          created_at?: string
          description?: string | null
          file_path?: string
          has_die_lines?: boolean | null
          has_fold_lines?: boolean | null
          has_perforation?: boolean | null
          height_inches?: number | null
          id?: string
          is_favorite?: boolean | null
          name?: string
          project_id?: string | null
          resolution_dpi?: number | null
          safe_zone_inches?: number | null
          source_vendor?: string | null
          specs?: Json
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string
          width_inches?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "print_templates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_assets: {
        Row: {
          asset_type: string
          content: string | null
          created_at: string
          folder_id: string | null
          id: string
          is_favorite: boolean | null
          metadata: Json | null
          project_id: string
          title: string
          updated_at: string
        }
        Insert: {
          asset_type: string
          content?: string | null
          created_at?: string
          folder_id?: string | null
          id?: string
          is_favorite?: boolean | null
          metadata?: Json | null
          project_id: string
          title: string
          updated_at?: string
        }
        Update: {
          asset_type?: string
          content?: string | null
          created_at?: string
          folder_id?: string | null
          id?: string
          is_favorite?: boolean | null
          metadata?: Json | null
          project_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_assets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          color_palette: Json | null
          created_at: string
          description: string | null
          event_details: Json
          folders: Json | null
          generated_assets: Json | null
          id: string
          is_favorite: boolean | null
          logos: Json | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color_palette?: Json | null
          created_at?: string
          description?: string | null
          event_details?: Json
          folders?: Json | null
          generated_assets?: Json | null
          id?: string
          is_favorite?: boolean | null
          logos?: Json | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color_palette?: Json | null
          created_at?: string
          description?: string | null
          event_details?: Json
          folders?: Json | null
          generated_assets?: Json | null
          id?: string
          is_favorite?: boolean | null
          logos?: Json | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prompt_templates: {
        Row: {
          asset_type: string
          created_at: string
          created_by: string | null
          id: string
          is_system: boolean | null
          prompt_template: string
          success_rate: number | null
          template_name: string
          updated_at: string
          usage_count: number | null
          variables: Json | null
        }
        Insert: {
          asset_type: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_system?: boolean | null
          prompt_template: string
          success_rate?: number | null
          template_name: string
          updated_at?: string
          usage_count?: number | null
          variables?: Json | null
        }
        Update: {
          asset_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_system?: boolean | null
          prompt_template?: string
          success_rate?: number | null
          template_name?: string
          updated_at?: string
          usage_count?: number | null
          variables?: Json | null
        }
        Relationships: []
      }
      render_engines: {
        Row: {
          api_key_encrypted: string | null
          config: Json | null
          created_at: string
          display_name: string
          id: string
          is_active: boolean | null
          is_default: boolean | null
          provider: string
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key_encrypted?: string | null
          config?: Json | null
          created_at?: string
          display_name: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          provider: string
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key_encrypted?: string | null
          config?: Json | null
          created_at?: string
          display_name?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          provider?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      studio_configs: {
        Row: {
          auto_generate: boolean | null
          created_at: string | null
          default_brand_id: string | null
          default_export_format: string | null
          default_resolution: number | null
          generation_quality: string | null
          id: string
          include_bleed: boolean | null
          include_crop_marks: boolean | null
          layout_preference: string | null
          preferred_model: string | null
          show_advanced_options: boolean | null
          studio_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_generate?: boolean | null
          created_at?: string | null
          default_brand_id?: string | null
          default_export_format?: string | null
          default_resolution?: number | null
          generation_quality?: string | null
          id?: string
          include_bleed?: boolean | null
          include_crop_marks?: boolean | null
          layout_preference?: string | null
          preferred_model?: string | null
          show_advanced_options?: boolean | null
          studio_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_generate?: boolean | null
          created_at?: string | null
          default_brand_id?: string | null
          default_export_format?: string | null
          default_resolution?: number | null
          generation_quality?: string | null
          id?: string
          include_bleed?: boolean | null
          include_crop_marks?: boolean | null
          layout_preference?: string | null
          preferred_model?: string | null
          show_advanced_options?: boolean | null
          studio_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "studio_configs_default_brand_id_fkey"
            columns: ["default_brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      studio_templates: {
        Row: {
          asset_type: string
          base_prompt: string | null
          bleed_inches: number | null
          category: string | null
          color_mode: string | null
          created_at: string | null
          description: string | null
          height_inches: number | null
          height_px: number | null
          id: string
          is_digital_optimized: boolean | null
          is_featured: boolean | null
          is_print_ready: boolean | null
          is_system: boolean | null
          output_formats: string[] | null
          prompt_variables: string[] | null
          resolution_dpi: number | null
          safe_zone_inches: number | null
          sort_order: number | null
          studio_type: string
          style_modifiers: string[] | null
          tags: string[] | null
          template_name: string
          thumbnail_url: string | null
          updated_at: string | null
          width_inches: number | null
          width_px: number | null
        }
        Insert: {
          asset_type: string
          base_prompt?: string | null
          bleed_inches?: number | null
          category?: string | null
          color_mode?: string | null
          created_at?: string | null
          description?: string | null
          height_inches?: number | null
          height_px?: number | null
          id?: string
          is_digital_optimized?: boolean | null
          is_featured?: boolean | null
          is_print_ready?: boolean | null
          is_system?: boolean | null
          output_formats?: string[] | null
          prompt_variables?: string[] | null
          resolution_dpi?: number | null
          safe_zone_inches?: number | null
          sort_order?: number | null
          studio_type: string
          style_modifiers?: string[] | null
          tags?: string[] | null
          template_name: string
          thumbnail_url?: string | null
          updated_at?: string | null
          width_inches?: number | null
          width_px?: number | null
        }
        Update: {
          asset_type?: string
          base_prompt?: string | null
          bleed_inches?: number | null
          category?: string | null
          color_mode?: string | null
          created_at?: string | null
          description?: string | null
          height_inches?: number | null
          height_px?: number | null
          id?: string
          is_digital_optimized?: boolean | null
          is_featured?: boolean | null
          is_print_ready?: boolean | null
          is_system?: boolean | null
          output_formats?: string[] | null
          prompt_variables?: string[] | null
          resolution_dpi?: number | null
          safe_zone_inches?: number | null
          sort_order?: number | null
          studio_type?: string
          style_modifiers?: string[] | null
          tags?: string[] | null
          template_name?: string
          thumbnail_url?: string | null
          updated_at?: string | null
          width_inches?: number | null
          width_px?: number | null
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

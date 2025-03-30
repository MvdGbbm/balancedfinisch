export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      breathing_patterns: {
        Row: {
          created_at: string
          cycles: number
          description: string | null
          exhale: number
          exhale_url: string | null
          hold1: number
          hold1_url: string | null
          hold2: number
          hold2_url: string | null
          id: string
          inhale: number
          inhale_url: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cycles?: number
          description?: string | null
          exhale: number
          exhale_url?: string | null
          hold1?: number
          hold1_url?: string | null
          hold2?: number
          hold2_url?: string | null
          id?: string
          inhale: number
          inhale_url?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cycles?: number
          description?: string | null
          exhale?: number
          exhale_url?: string | null
          hold1?: number
          hold1_url?: string | null
          hold2?: number
          hold2_url?: string | null
          id?: string
          inhale?: number
          inhale_url?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      music_items: {
        Row: {
          artist: string
          audio_url: string
          category: string | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          duration: number | null
          id: string
          tags: string[] | null
          title: string
          updated_at: string | null
          waveform_data: Json | null
        }
        Insert: {
          artist: string
          audio_url: string
          category?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          waveform_data?: Json | null
        }
        Update: {
          artist?: string
          audio_url?: string
          category?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          waveform_data?: Json | null
        }
        Relationships: []
      }
      playlist_items: {
        Row: {
          created_at: string | null
          id: string
          music_item_id: string
          playlist_id: string
          position: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          music_item_id: string
          playlist_id: string
          position: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          music_item_id?: string
          playlist_id?: string
          position?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "playlist_items_music_item_id_fkey"
            columns: ["music_item_id"]
            isOneToOne: false
            referencedRelation: "music_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_items_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
        ]
      }
      playlists: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      radio_streams: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          position: number | null
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          position?: number | null
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          position?: number | null
          title?: string
          updated_at?: string
          url?: string
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

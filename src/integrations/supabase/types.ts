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
      insignias: {
        Row: {
          codigo: string
          descripcion: string
          icono: string
          id: string
          nombre: string
        }
        Insert: {
          codigo: string
          descripcion?: string
          icono?: string
          id?: string
          nombre: string
        }
        Update: {
          codigo?: string
          descripcion?: string
          icono?: string
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      preguntas: {
        Row: {
          enunciado: string
          id: string
          opciones: Json
          orden: number
          prueba_id: string
          puntos: number
          respuesta_correcta: Json
          tipo: Database["public"]["Enums"]["pregunta_tipo"]
        }
        Insert: {
          enunciado: string
          id?: string
          opciones?: Json
          orden?: number
          prueba_id: string
          puntos?: number
          respuesta_correcta: Json
          tipo: Database["public"]["Enums"]["pregunta_tipo"]
        }
        Update: {
          enunciado?: string
          id?: string
          opciones?: Json
          orden?: number
          prueba_id?: string
          puntos?: number
          respuesta_correcta?: Json
          tipo?: Database["public"]["Enums"]["pregunta_tipo"]
        }
        Relationships: [
          {
            foreignKeyName: "preguntas_prueba_id_fkey"
            columns: ["prueba_id"]
            isOneToOne: false
            referencedRelation: "pruebas"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          monedas: number
          nivel: number
          nombre: string
          xp: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          monedas?: number
          nivel?: number
          nombre?: string
          xp?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          monedas?: number
          nivel?: number
          nombre?: string
          xp?: number
        }
        Relationships: []
      }
      pruebas: {
        Row: {
          created_at: string
          descripcion: string
          dificultad: Database["public"]["Enums"]["dificultad"]
          id: string
          monedas_reward: number
          tema_id: string
          tiempo_estimado: number
          titulo: string
          xp_reward: number
        }
        Insert: {
          created_at?: string
          descripcion?: string
          dificultad?: Database["public"]["Enums"]["dificultad"]
          id?: string
          monedas_reward?: number
          tema_id: string
          tiempo_estimado?: number
          titulo: string
          xp_reward?: number
        }
        Update: {
          created_at?: string
          descripcion?: string
          dificultad?: Database["public"]["Enums"]["dificultad"]
          id?: string
          monedas_reward?: number
          tema_id?: string
          tiempo_estimado?: number
          titulo?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "pruebas_tema_id_fkey"
            columns: ["tema_id"]
            isOneToOne: false
            referencedRelation: "temas"
            referencedColumns: ["id"]
          },
        ]
      }
      resultados: {
        Row: {
          aciertos: number
          completed_at: string
          id: string
          monedas_ganadas: number
          prueba_id: string
          puntuacion: number
          tiempo_seg: number
          total: number
          user_id: string
          xp_ganado: number
        }
        Insert: {
          aciertos?: number
          completed_at?: string
          id?: string
          monedas_ganadas?: number
          prueba_id: string
          puntuacion?: number
          tiempo_seg?: number
          total?: number
          user_id: string
          xp_ganado?: number
        }
        Update: {
          aciertos?: number
          completed_at?: string
          id?: string
          monedas_ganadas?: number
          prueba_id?: string
          puntuacion?: number
          tiempo_seg?: number
          total?: number
          user_id?: string
          xp_ganado?: number
        }
        Relationships: [
          {
            foreignKeyName: "resultados_prueba_id_fkey"
            columns: ["prueba_id"]
            isOneToOne: false
            referencedRelation: "pruebas"
            referencedColumns: ["id"]
          },
        ]
      }
      temas: {
        Row: {
          created_at: string
          descripcion: string
          id: string
          imagen_url: string | null
          orden: number
          periodo: string
          titulo: string
        }
        Insert: {
          created_at?: string
          descripcion?: string
          id?: string
          imagen_url?: string | null
          orden?: number
          periodo?: string
          titulo: string
        }
        Update: {
          created_at?: string
          descripcion?: string
          id?: string
          imagen_url?: string | null
          orden?: number
          periodo?: string
          titulo?: string
        }
        Relationships: []
      }
      user_insignias: {
        Row: {
          id: string
          insignia_id: string
          obtained_at: string
          user_id: string
        }
        Insert: {
          id?: string
          insignia_id: string
          obtained_at?: string
          user_id: string
        }
        Update: {
          id?: string
          insignia_id?: string
          obtained_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_insignias_insignia_id_fkey"
            columns: ["insignia_id"]
            isOneToOne: false
            referencedRelation: "insignias"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      app_role: "alumno" | "profesor"
      dificultad: "facil" | "medio" | "dificil"
      pregunta_tipo: "test" | "vf" | "orden"
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
      app_role: ["alumno", "profesor"],
      dificultad: ["facil", "medio", "dificil"],
      pregunta_tipo: ["test", "vf", "orden"],
    },
  },
} as const

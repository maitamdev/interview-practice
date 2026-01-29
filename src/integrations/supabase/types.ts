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
      ai_coach_recommendations: {
        Row: {
          created_at: string
          description: string
          id: string
          is_completed: boolean
          priority: number
          recommendation_type: string
          related_skill: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          is_completed?: boolean
          priority?: number
          recommendation_type: string
          related_skill?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_completed?: boolean
          priority?: number
          recommendation_type?: string
          related_skill?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          code: string
          created_at: string
          description: string
          description_vi: string
          icon: string
          id: string
          name: string
          name_vi: string
          requirement_type: string
          requirement_value: number
          xp_reward: number
        }
        Insert: {
          code: string
          created_at?: string
          description: string
          description_vi: string
          icon: string
          id?: string
          name: string
          name_vi: string
          requirement_type: string
          requirement_value: number
          xp_reward?: number
        }
        Update: {
          code?: string
          created_at?: string
          description?: string
          description_vi?: string
          icon?: string
          id?: string
          name?: string
          name_vi?: string
          requirement_type?: string
          requirement_value?: number
          xp_reward?: number
        }
        Relationships: []
      }
      daily_challenges: {
        Row: {
          challenge_date: string
          challenge_type: string
          created_at: string
          description: string
          description_vi: string
          id: string
          target_value: number
          title: string
          title_vi: string
          xp_reward: number
        }
        Insert: {
          challenge_date: string
          challenge_type: string
          created_at?: string
          description: string
          description_vi: string
          id?: string
          target_value: number
          title: string
          title_vi: string
          xp_reward?: number
        }
        Update: {
          challenge_date?: string
          challenge_type?: string
          created_at?: string
          description?: string
          description_vi?: string
          id?: string
          target_value?: number
          title?: string
          title_vi?: string
          xp_reward?: number
        }
        Relationships: []
      }
      interview_answers: {
        Row: {
          answer_text: string
          audio_url: string | null
          created_at: string
          feedback: Json | null
          id: string
          improved_answer: string | null
          question_index: number
          question_text: string
          scores: Json | null
          session_id: string
          time_taken_seconds: number | null
          transcript: string | null
        }
        Insert: {
          answer_text: string
          audio_url?: string | null
          created_at?: string
          feedback?: Json | null
          id?: string
          improved_answer?: string | null
          question_index: number
          question_text: string
          scores?: Json | null
          session_id: string
          time_taken_seconds?: number | null
          transcript?: string | null
        }
        Update: {
          answer_text?: string
          audio_url?: string | null
          created_at?: string
          feedback?: Json | null
          id?: string
          improved_answer?: string | null
          question_index?: number
          question_text?: string
          scores?: Json | null
          session_id?: string
          time_taken_seconds?: number | null
          transcript?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interview_answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          question_index: number | null
          role: Database["public"]["Enums"]["message_role"]
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          question_index?: number | null
          role: Database["public"]["Enums"]["message_role"]
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          question_index?: number | null
          role?: Database["public"]["Enums"]["message_role"]
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_sessions: {
        Row: {
          created_at: string
          current_question_index: number | null
          difficulty_score: number | null
          ended_at: string | null
          focus_tags: string[] | null
          id: string
          jd_text: string | null
          language: Database["public"]["Enums"]["interview_language"]
          level: Database["public"]["Enums"]["interview_level"]
          mode: Database["public"]["Enums"]["interview_mode"]
          role: Database["public"]["Enums"]["interview_role"]
          started_at: string | null
          status: Database["public"]["Enums"]["session_status"]
          total_questions: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          current_question_index?: number | null
          difficulty_score?: number | null
          ended_at?: string | null
          focus_tags?: string[] | null
          id?: string
          jd_text?: string | null
          language?: Database["public"]["Enums"]["interview_language"]
          level: Database["public"]["Enums"]["interview_level"]
          mode?: Database["public"]["Enums"]["interview_mode"]
          role: Database["public"]["Enums"]["interview_role"]
          started_at?: string | null
          status?: Database["public"]["Enums"]["session_status"]
          total_questions?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          current_question_index?: number | null
          difficulty_score?: number | null
          ended_at?: string | null
          focus_tags?: string[] | null
          id?: string
          jd_text?: string | null
          language?: Database["public"]["Enums"]["interview_language"]
          level?: Database["public"]["Enums"]["interview_level"]
          mode?: Database["public"]["Enums"]["interview_mode"]
          role?: Database["public"]["Enums"]["interview_role"]
          started_at?: string | null
          status?: Database["public"]["Enums"]["session_status"]
          total_questions?: number | null
          user_id?: string
        }
        Relationships: []
      }
      learning_resources: {
        Row: {
          created_at: string
          description: string
          difficulty: string
          id: string
          resource_type: string
          skill: string
          title: string
          url: string | null
        }
        Insert: {
          created_at?: string
          description: string
          difficulty: string
          id?: string
          resource_type: string
          skill: string
          title: string
          url?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          difficulty?: string
          id?: string
          resource_type?: string
          skill?: string
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          name: string | null
          preferred_language:
            | Database["public"]["Enums"]["interview_language"]
            | null
          target_level: Database["public"]["Enums"]["interview_level"] | null
          target_role: Database["public"]["Enums"]["interview_role"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string | null
          preferred_language?:
            | Database["public"]["Enums"]["interview_language"]
            | null
          target_level?: Database["public"]["Enums"]["interview_level"] | null
          target_role?: Database["public"]["Enums"]["interview_role"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string | null
          preferred_language?:
            | Database["public"]["Enums"]["interview_language"]
            | null
          target_level?: Database["public"]["Enums"]["interview_level"] | null
          target_role?: Database["public"]["Enums"]["interview_role"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      session_summaries: {
        Row: {
          created_at: string
          id: string
          improvement_plan: Json | null
          overall_score: number | null
          session_id: string
          skill_breakdown: Json | null
          strengths: string[] | null
          weaknesses: string[] | null
        }
        Insert: {
          created_at?: string
          id?: string
          improvement_plan?: Json | null
          overall_score?: number | null
          session_id: string
          skill_breakdown?: Json | null
          strengths?: string[] | null
          weaknesses?: string[] | null
        }
        Update: {
          created_at?: string
          id?: string
          improvement_plan?: Json | null
          overall_score?: number | null
          session_id?: string
          skill_breakdown?: Json | null
          strengths?: string[] | null
          weaknesses?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "session_summaries_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_challenge_completions: {
        Row: {
          challenge_id: string
          completed_at: string
          id: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string
          id?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenge_completions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_gamification: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_activity_date: string | null
          level: number
          longest_streak: number
          total_interviews: number
          total_questions_answered: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          level?: number
          longest_streak?: number
          total_interviews?: number
          total_questions_answered?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          level?: number
          longest_streak?: number
          total_interviews?: number
          total_questions_answered?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      learning_progress: {
        Row: {
          id: string
          user_id: string
          path_type: string
          module_id: string
          status: string
          progress: number
          started_at: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          path_type: string
          module_id: string
          status?: string
          progress?: number
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          path_type?: string
          module_id?: string
          status?: string
          progress?: number
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      question_bank: {
        Row: {
          id: string
          company: string
          company_logo: string | null
          role: string
          level: string
          category: string
          question: string
          tags: string[]
          difficulty: number
          times_asked: number
          avg_score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          company: string
          company_logo?: string | null
          role: string
          level: string
          category: string
          question: string
          tags?: string[]
          difficulty?: number
          times_asked?: number
          avg_score?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          company?: string
          company_logo?: string | null
          role?: string
          level?: string
          category?: string
          question?: string
          tags?: string[]
          difficulty?: number
          times_asked?: number
          avg_score?: number | null
          created_at?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          id: string
          role: string
          skill: string
          title: string
          title_vi: string
          description: string
          description_vi: string
          difficulty: string
          duration_hours: number
          thumbnail_url: string | null
          is_free: boolean
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          role: string
          skill: string
          title: string
          title_vi: string
          description: string
          description_vi: string
          difficulty?: string
          duration_hours?: number
          thumbnail_url?: string | null
          is_free?: boolean
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          role?: string
          skill?: string
          title?: string
          title_vi?: string
          description?: string
          description_vi?: string
          difficulty?: string
          duration_hours?: number
          thumbnail_url?: string | null
          is_free?: boolean
          order_index?: number
          created_at?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          id: string
          course_id: string
          title: string
          title_vi: string
          content: string
          content_vi: string
          video_url: string | null
          duration_minutes: number
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          title_vi: string
          content: string
          content_vi: string
          video_url?: string | null
          duration_minutes?: number
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          title_vi?: string
          content?: string
          content_vi?: string
          video_url?: string | null
          duration_minutes?: number
          order_index?: number
          created_at?: string
        }
        Relationships: []
      }
      user_course_progress: {
        Row: {
          id: string
          user_id: string
          course_id: string
          current_lesson_id: string | null
          progress_percent: number
          started_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          current_lesson_id?: string | null
          progress_percent?: number
          started_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          current_lesson_id?: string | null
          progress_percent?: number
          started_at?: string
          completed_at?: string | null
        }
        Relationships: []
      }
      user_lesson_completion: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          completed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          completed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          completed_at?: string
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
      interview_language: "vi" | "en"
      interview_level: "intern" | "junior" | "mid" | "senior"
      interview_mode: "behavioral" | "technical" | "mixed"
      interview_role:
        | "frontend"
        | "backend"
        | "fullstack"
        | "data"
        | "qa"
        | "ba"
        | "devops"
        | "mobile"
      message_role: "interviewer" | "candidate" | "system"
      session_status: "setup" | "in_progress" | "completed" | "abandoned"
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
      interview_language: ["vi", "en"],
      interview_level: ["intern", "junior", "mid", "senior"],
      interview_mode: ["behavioral", "technical", "mixed"],
      interview_role: [
        "frontend",
        "backend",
        "fullstack",
        "data",
        "qa",
        "ba",
        "devops",
        "mobile",
      ],
      message_role: ["interviewer", "candidate", "system"],
      session_status: ["setup", "in_progress", "completed", "abandoned"],
    },
  },
} as const

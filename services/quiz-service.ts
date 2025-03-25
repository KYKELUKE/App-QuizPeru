import { supabase } from "@/lib/supabase";
import type { QuizResult } from "@/types/database.types";

export const quizService = {
  // Guardar el resultado de un quiz
  async saveQuizResult(
    result: Omit<QuizResult, "id" | "created_at">
  ): Promise<QuizResult> {
    const { data, error } = await supabase
      .from("quiz_results")
      .insert(result)
      .select()
      .single();

    if (error) {
      console.error("Error saving quiz result:", error);
      throw error;
    }

    return data;
  },

  // Obtener el historial de resultados de un usuario
  async getUserResults(userId: string): Promise<QuizResult[]> {
    const { data, error } = await supabase
      .from("quiz_results")
      .select("*, themes(title)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user results:", error);
      throw error;
    }

    return data || [];
  },

  // Obtener estadísticas de un usuario
  async getUserStats(userId: string): Promise<{
    quizzes_taken: number;
    correct_answers: number;
    total_questions: number;
    average_score: number;
  }> {
    const { data, error } = await supabase.rpc("get_user_stats", {
      user_id: userId,
    });

    if (error) {
      console.error("Error fetching user stats:", error);
      throw error;
    }

    return (
      data || {
        quizzes_taken: 0,
        correct_answers: 0,
        total_questions: 0,
        average_score: 0,
      }
    );
  },
};

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
    // Obtener todos los resultados del usuario
    const { data, error } = await supabase
      .from("quiz_results")
      .select("score, total_questions")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching user stats:", error);
      throw error;
    }

    // Calcular estadísticas
    const results = data || [];
    const quizzesTaken = results.length;
    const correctAnswers = results.reduce(
      (sum, result) => sum + result.score,
      0
    );
    const totalQuestions = results.reduce(
      (sum, result) => sum + result.total_questions,
      0
    );
    const averageScore =
      totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    return {
      quizzes_taken: quizzesTaken,
      correct_answers: correctAnswers,
      total_questions: totalQuestions,
      average_score: Math.round(averageScore),
    };
  },

  // Obtener los mejores resultados para un tema específico
  async getTopScoresForTheme(
    themeId: string,
    limit = 10
  ): Promise<QuizResult[]> {
    const { data, error } = await supabase
      .from("quiz_results")
      .select("*, profiles(username)")
      .eq("theme_id", themeId)
      .order("score", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching top scores:", error);
      throw error;
    }

    return data || [];
  },
};

import { supabase } from "@/lib/supabase";
import type { Question } from "@/types/database.types";
import { themeService } from "./theme-service";

export const questionService = {
  // Obtener todas las preguntas de un tema
  async getQuestionsByTheme(themeId: string): Promise<Question[]> {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("theme_id", themeId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching questions:", error);
      throw error;
    }

    return data || [];
  },

  // Obtener una pregunta específica por ID
  async getQuestionById(questionId: string): Promise<Question | null> {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("id", questionId)
      .single();

    if (error) {
      console.error("Error fetching question:", error);
      throw error;
    }

    return data;
  },

  // Crear una nueva pregunta
  async createQuestion(
    question: Omit<Question, "id" | "created_at">
  ): Promise<Question> {
    // Iniciar una transacción
    const { data, error } = await supabase
      .from("questions")
      .insert(question)
      .select()
      .single();

    if (error) {
      console.error("Error creating question:", error);
      throw error;
    }

    // Incrementar el contador de preguntas del tema
    await themeService.incrementQuestionCount(question.theme_id);

    return data;
  },

  // Actualizar una pregunta existente
  async updateQuestion(
    questionId: string,
    question: Partial<Question>
  ): Promise<Question> {
    const { data, error } = await supabase
      .from("questions")
      .update(question)
      .eq("id", questionId)
      .select()
      .single();

    if (error) {
      console.error("Error updating question:", error);
      throw error;
    }

    return data;
  },

  // Eliminar una pregunta
  async deleteQuestion(questionId: string, themeId: string): Promise<void> {
    const { error } = await supabase
      .from("questions")
      .delete()
      .eq("id", questionId);

    if (error) {
      console.error("Error deleting question:", error);
      throw error;
    }

    // Decrementar el contador de preguntas del tema
    await themeService.decrementQuestionCount(themeId);
  },

  // Crear múltiples preguntas a la vez
  async createMultipleQuestions(
    questions: Omit<Question, "id" | "created_at">[]
  ): Promise<Question[]> {
    if (questions.length === 0) return [];

    const { data, error } = await supabase
      .from("questions")
      .insert(questions)
      .select();

    if (error) {
      console.error("Error creating multiple questions:", error);
      throw error;
    }

    // Incrementar el contador de preguntas del tema
    const themeId = questions[0].theme_id;

    // Actualizar el contador con el número exacto de preguntas añadidas
    const { error: updateError } = await supabase
      .from("themes")
      .update({
        questions_count: supabase.rpc("get_questions_count", {
          theme_id: themeId,
        }),
      })
      .eq("id", themeId);

    if (updateError) {
      console.error("Error updating question count:", updateError);
    }

    return data || [];
  },
};

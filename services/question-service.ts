import { supabase } from "@/lib/supabase";
import type { Question } from "@/types/database.types";

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
    try {
      await supabase.rpc("increment_question_count", {
        theme_id: question.theme_id,
      });
    } catch (e) {
      console.error("Error incrementing question count:", e);
      // No lanzamos el error aquí para no interrumpir el flujo principal
    }

    return data;
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
    try {
      const themeId = questions[0].theme_id;
      await supabase.rpc("increment_question_count_by", {
        theme_id: themeId,
        count: questions.length,
      });
    } catch (e) {
      console.error("Error incrementing question count:", e);
      // No lanzamos el error aquí para no interrumpir el flujo principal
    }

    return data || [];
  },

  // Actualizar una pregunta existente
  async updateQuestion(
    questionId: string,
    updates: Partial<Question>
  ): Promise<Question> {
    const { data, error } = await supabase
      .from("questions")
      .update(updates)
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
  async deleteQuestion(questionId: string): Promise<void> {
    // Primero obtenemos la pregunta para saber a qué tema pertenece
    const question = await this.getQuestionById(questionId);

    if (!question) {
      throw new Error("Question not found");
    }

    const { error } = await supabase
      .from("questions")
      .delete()
      .eq("id", questionId);

    if (error) {
      console.error("Error deleting question:", error);
      throw error;
    }

    // Decrementar el contador de preguntas del tema
    try {
      await supabase.rpc("decrement_question_count", {
        theme_id: question.theme_id,
      });
    } catch (e) {
      console.error("Error decrementing question count:", e);
      // No lanzamos el error aquí para no interrumpir el flujo principal
    }
  },
};

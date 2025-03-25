import { supabase } from "@/lib/supabase";
import type { QuizTheme } from "@/types/database.types";

export const themeService = {
  // Obtener todos los temas (públicos o del usuario actual)
  async getThemes(userId: string): Promise<QuizTheme[]> {
    const { data, error } = await supabase
      .from("themes")
      .select("*")
      .or(`is_public.eq.true,created_by.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching themes:", error);
      throw error;
    }

    return data || [];
  },

  // Obtener temas creados por el usuario actual
  async getUserThemes(userId: string): Promise<QuizTheme[]> {
    const { data, error } = await supabase
      .from("themes")
      .select("*")
      .eq("created_by", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user themes:", error);
      throw error;
    }

    return data || [];
  },

  // Obtener un tema específico por ID
  async getThemeById(themeId: string): Promise<QuizTheme | null> {
    const { data, error } = await supabase
      .from("themes")
      .select("*")
      .eq("id", themeId)
      .single();

    if (error) {
      console.error("Error fetching theme:", error);
      throw error;
    }

    return data;
  },

  // Crear un nuevo tema
  async createTheme(
    theme: Omit<QuizTheme, "id" | "created_at" | "questions_count">
  ): Promise<QuizTheme> {
    const { data, error } = await supabase
      .from("themes")
      .insert({
        ...theme,
        questions_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating theme:", error);
      throw error;
    }

    return data;
  },

  // Actualizar un tema existente
  async updateTheme(
    themeId: string,
    theme: Partial<QuizTheme>
  ): Promise<QuizTheme> {
    const { data, error } = await supabase
      .from("themes")
      .update(theme)
      .eq("id", themeId)
      .select()
      .single();

    if (error) {
      console.error("Error updating theme:", error);
      throw error;
    }

    return data;
  },

  // Eliminar un tema
  async deleteTheme(themeId: string): Promise<void> {
    const { error } = await supabase.from("themes").delete().eq("id", themeId);

    if (error) {
      console.error("Error deleting theme:", error);
      throw error;
    }
  },

  // Incrementar el contador de preguntas de un tema
  async incrementQuestionCount(themeId: string): Promise<void> {
    const { error } = await supabase.rpc("increment_question_count", {
      theme_id: themeId,
    });

    if (error) {
      console.error("Error incrementing question count:", error);
      throw error;
    }
  },

  // Decrementar el contador de preguntas de un tema
  async decrementQuestionCount(themeId: string): Promise<void> {
    const { error } = await supabase.rpc("decrement_question_count", {
      theme_id: themeId,
    });

    if (error) {
      console.error("Error decrementing question count:", error);
      throw error;
    }
  },
};

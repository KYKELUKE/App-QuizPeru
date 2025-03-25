"use client";

import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/context/auth-context";
import { themeService } from "@/services/theme-service";
import { questionService } from "@/services/question-service";
import type { QuizTheme } from "@/types/database.types";
import { useFocusEffect } from "@react-navigation/native";

export default function CreateScreen() {
  const { user } = useAuth();
  const [userThemes, setUserThemes] = useState<QuizTheme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar temas del usuario al iniciar
  useEffect(() => {
    if (user) {
      loadUserThemes();
    }
  }, [user]);

  // Recargar temas cuando la pantalla vuelve a estar en foco
  useFocusEffect(
    useCallback(() => {
      if (user) {
        console.log("Screen focused, reloading themes...");
        loadUserThemes();
      }
      return () => {
        // Cleanup function (optional)
      };
    }, [user])
  );

  // Función para cargar los temas creados por el usuario
  const loadUserThemes = async () => {
    try {
      setIsLoading(true);
      if (!user?.email) {
        setUserThemes([]);
        return;
      }

      const themes = await themeService.getUserThemes(user.email);
      setUserThemes(themes);
    } catch (error) {
      console.error("Error loading themes:", error);
      Alert.alert("Error", "No se pudieron cargar tus temas");
    } finally {
      setIsLoading(false);
    }
    // Devolver una promesa resuelta para poder encadenar .finally()
    return Promise.resolve();
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadUserThemes().finally(() => setRefreshing(false));
  }, [user]);

  // Función para crear un nuevo tema
  const createNewTheme = () => {
    router.push("/create-theme");
  };

  // Función para editar un tema existente
  const editTheme = (themeId: string) => {
    router.push({
      pathname: "/create-theme",
      params: { themeId },
    });
  };

  // Función para crear preguntas para un tema
  const createQuestions = (themeId: string) => {
    router.push({
      pathname: "/create-question",
      params: { themeId },
    });
  };

  // Función para ver las preguntas de un tema
  const viewQuestions = (themeId: string) => {
    router.push({
      pathname: "/theme-questions",
      params: { themeId },
    });
  };

  // Función para jugar un quiz
  const playQuiz = async (themeId: string) => {
    try {
      // Verificar si el tema tiene preguntas
      const questions = await questionService.getQuestionsByTheme(themeId);

      if (questions.length === 0) {
        Alert.alert(
          "No hay preguntas",
          "Este tema no tiene preguntas. Añade algunas preguntas antes de jugar.",
          [
            {
              text: "Añadir preguntas",
              onPress: () => createQuestions(themeId),
            },
            {
              text: "Cancelar",
              style: "cancel",
            },
          ]
        );
        return;
      }

      // Si hay preguntas, navegar a la pantalla de juego
      router.push({
        pathname: "/play-quiz",
        params: { themeId },
      });
    } catch (error) {
      console.error("Error checking questions:", error);
      Alert.alert("Error", "No se pudo verificar si el tema tiene preguntas");
    }
  };

  // Función para eliminar un tema
  const deleteTheme = async (themeId: string) => {
    Alert.alert(
      "Eliminar tema",
      "¿Estás seguro de que deseas eliminar este tema? Esta acción no se puede deshacer y se eliminarán todas las preguntas asociadas.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await themeService.deleteTheme(themeId);
              // Actualizar la lista de temas
              loadUserThemes();
              Alert.alert("Éxito", "Tema eliminado correctamente");
            } catch (error) {
              console.error("Error deleting theme:", error);
              Alert.alert("Error", "No se pudo eliminar el tema");
            }
          },
        },
      ]
    );
  };

  // Añadir este useEffect después de los otros efectos:
  useEffect(() => {
    // Suscribirse a cambios en los temas
    const unsubscribe = themeService.subscribeToThemeChanges(() => {
      console.log("Theme changes detected, reloading themes...");
      loadUserThemes();
    });

    // Limpiar la suscripción al desmontar
    return () => {
      unsubscribe();
    };
  }, [user]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Temas</Text>
        <TouchableOpacity style={styles.createButton} onPress={createNewTheme}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0F3057" />
          <Text style={styles.loadingText}>Cargando tus temas...</Text>
        </View>
      ) : userThemes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome5 name="book" size={50} color="#ccc" />
          <Text style={styles.emptyTitle}>No tienes temas creados</Text>
          <Text style={styles.emptyText}>
            Crea tu primer tema de preguntas para compartir con otros usuarios
          </Text>
          <TouchableOpacity
            style={styles.createFirstButton}
            onPress={createNewTheme}>
            <Text style={styles.createFirstButtonText}>
              Crear mi primer tema
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#0F3057"]}
              tintColor="#0F3057"
            />
          }>
          {userThemes.map((theme) => (
            <View key={theme.id} style={styles.themeCard}>
              <LinearGradient
                colors={theme.color}
                style={styles.themeIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}>
                <FontAwesome5 name={theme.icon} size={24} color="#fff" />
              </LinearGradient>
              <View style={styles.themeContent}>
                <Text style={styles.themeTitle}>{theme.title}</Text>
                <Text style={styles.themeDescription}>{theme.description}</Text>
                <Text style={styles.themeQuestions}>
                  {theme.questions_count} preguntas
                </Text>

                {/* Botones de acción principales */}
                <View style={styles.mainActions}>
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={() => playQuiz(theme.id)}>
                    <Ionicons name="play" size={16} color="#fff" />
                    <Text style={styles.playButtonText}>Jugar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.questionsButton}
                    onPress={() => viewQuestions(theme.id)}>
                    <Ionicons name="list" size={16} color="#0F3057" />
                    <Text style={styles.questionsButtonText}>Preguntas</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.themeActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => editTheme(theme.id)}>
                  <Ionicons name="pencil" size={18} color="#555" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => createQuestions(theme.id)}>
                  <Ionicons name="add-circle" size={18} color="#555" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => deleteTheme(theme.id)}>
                  <Ionicons name="trash" size={18} color="#ff4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0F3057",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  createFirstButton: {
    backgroundColor: "#0F3057",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  createFirstButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  themeCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  themeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  themeContent: {
    flex: 1,
    marginLeft: 15,
  },
  themeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  themeDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  themeQuestions: {
    fontSize: 12,
    color: "#888",
    marginBottom: 10,
  },
  mainActions: {
    flexDirection: "row",
    marginTop: 5,
  },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F3057",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
  },
  playButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
  questionsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  questionsButtonText: {
    color: "#0F3057",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
  themeActions: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 3,
  },
  deleteButton: {
    backgroundColor: "#ffeeee",
  },
});

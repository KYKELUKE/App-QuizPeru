"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import type { QuizTheme } from "./(tabs)/create";
import type { Question } from "./create-question";

export default function ThemeQuestionsScreen() {
  const params = useLocalSearchParams();
  const themeId = params.themeId as string;

  const [theme, setTheme] = useState<QuizTheme | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Cargar tema
      const themesJson = await AsyncStorage.getItem("quizThemes");
      const themes: QuizTheme[] = themesJson ? JSON.parse(themesJson) : [];
      const foundTheme = themes.find((t) => t.id === themeId);

      if (foundTheme) {
        setTheme(foundTheme);
      } else {
        Alert.alert("Error", "No se encontró el tema");
        router.back();
        return;
      }

      // Cargar preguntas
      const questionsJson = await AsyncStorage.getItem("quizQuestions");
      const allQuestions: Question[] = questionsJson
        ? JSON.parse(questionsJson)
        : [];
      const themeQuestions = allQuestions.filter((q) => q.themeId === themeId);

      setQuestions(themeQuestions);
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "No se pudieron cargar las preguntas");
    } finally {
      setIsLoading(false);
    }
  };

  const editQuestion = (questionId: string) => {
    router.push({
      pathname: "/create-question",
      params: { themeId, questionId },
    });
  };

  const deleteQuestion = async (questionId: string) => {
    Alert.alert(
      "Confirmar eliminación",
      "¿Estás seguro de que deseas eliminar esta pregunta?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              // Eliminar pregunta
              const questionsJson = await AsyncStorage.getItem("quizQuestions");
              const allQuestions: Question[] = questionsJson
                ? JSON.parse(questionsJson)
                : [];
              const updatedQuestions = allQuestions.filter(
                (q) => q.id !== questionId
              );

              await AsyncStorage.setItem(
                "quizQuestions",
                JSON.stringify(updatedQuestions)
              );

              // Actualizar contador de preguntas del tema
              const themesJson = await AsyncStorage.getItem("quizThemes");
              const themes: QuizTheme[] = themesJson
                ? JSON.parse(themesJson)
                : [];
              const updatedThemes = themes.map((t) => {
                if (t.id === themeId) {
                  return {
                    ...t,
                    questionsCount: Math.max((t.questionsCount || 0) - 1, 0),
                  };
                }
                return t;
              });

              await AsyncStorage.setItem(
                "quizThemes",
                JSON.stringify(updatedThemes)
              );

              // Actualizar estado local
              setQuestions(questions.filter((q) => q.id !== questionId));
              if (theme) {
                setTheme({
                  ...theme,
                  questionsCount: Math.max((theme.questionsCount || 0) - 1, 0),
                });
              }

              Alert.alert("Éxito", "Pregunta eliminada correctamente");
            } catch (error) {
              console.error("Error deleting question:", error);
              Alert.alert("Error", "No se pudo eliminar la pregunta");
            }
          },
        },
      ]
    );
  };

  const addQuestion = () => {
    router.push({
      pathname: "/create-question",
      params: { themeId },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0F3057" />
        <Text style={styles.loadingText}>Cargando preguntas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preguntas</Text>
        <TouchableOpacity style={styles.addButton} onPress={addQuestion}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {theme && (
        <LinearGradient
          colors={theme.color}
          style={styles.themeHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}>
          <View style={styles.themeIconContainer}>
            <FontAwesome5 name={theme.icon} size={24} color="#fff" />
          </View>
          <View style={styles.themeInfo}>
            <Text style={styles.themeTitle}>{theme.title}</Text>
            <Text style={styles.themeQuestions}>
              {theme.questionsCount} preguntas
            </Text>
          </View>
        </LinearGradient>
      )}

      {questions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome5 name="question-circle" size={50} color="#ccc" />
          <Text style={styles.emptyTitle}>No hay preguntas</Text>
          <Text style={styles.emptyText}>
            Añade preguntas a este tema para que los usuarios puedan
            responderlas
          </Text>
          <TouchableOpacity style={styles.addFirstButton} onPress={addQuestion}>
            <Text style={styles.addFirstButtonText}>
              Añadir primera pregunta
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.questionsContainer}>
          {questions.map((question, index) => (
            <View key={question.id} style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <Text style={styles.questionNumber}>Pregunta {index + 1}</Text>
                <View style={styles.questionActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => editQuestion(question.id)}>
                    <Ionicons name="pencil" size={18} color="#555" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => deleteQuestion(question.id)}>
                    <Ionicons name="trash" size={18} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.questionText}>{question.text}</Text>
              <View style={styles.optionsContainer}>
                {question.options.map((option) => (
                  <View
                    key={option.id}
                    style={[
                      styles.optionItem,
                      option.isCorrect && styles.correctOption,
                    ]}>
                    <Text
                      style={[
                        styles.optionText,
                        option.isCorrect && styles.correctOptionText,
                      ]}>
                      {option.text}
                    </Text>
                    {option.isCorrect && (
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color="#fff"
                        style={styles.correctIcon}
                      />
                    )}
                  </View>
                ))}
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
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0F3057",
    justifyContent: "center",
    alignItems: "center",
  },
  themeHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  themeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  themeInfo: {
    marginLeft: 16,
  },
  themeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  themeQuestions: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.8,
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
  addFirstButton: {
    backgroundColor: "#0F3057",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  addFirstButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  questionsContainer: {
    padding: 16,
  },
  questionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0F3057",
  },
  questionActions: {
    flexDirection: "row",
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: "#ffeeee",
  },
  questionText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 8,
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  correctOption: {
    backgroundColor: "#0F3057",
  },
  optionText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  correctOptionText: {
    color: "#fff",
    fontWeight: "bold",
  },
  correctIcon: {
    marginLeft: 8,
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
});

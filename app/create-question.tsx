"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/context/auth-context";
import { themeService } from "@/services/theme-service";
import { questionService } from "@/services/question-service";
import type {
  QuizTheme,
  Question,
  QuestionOption,
} from "@/types/database.types";

export default function CreateQuestionScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const themeId = params.themeId as string;
  const questionId = params.questionId as string;
  const isEditing = !!questionId;

  const [theme, setTheme] = useState<QuizTheme | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<QuestionOption[]>([
    { id: "1", text: "", is_correct: true },
    { id: "2", text: "", is_correct: false },
    { id: "3", text: "", is_correct: false },
    { id: "4", text: "", is_correct: false },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchQuestions, setBatchQuestions] = useState<Question[]>([]);

  // Cargar datos del tema y la pregunta si estamos editando
  useEffect(() => {
    loadThemeData();
    if (isEditing) {
      loadQuestionData();
    }
  }, []);

  const loadThemeData = async () => {
    try {
      const foundTheme = await themeService.getThemeById(themeId);

      if (foundTheme) {
        setTheme(foundTheme);
      } else {
        Alert.alert("Error", "No se encontró el tema");
        router.back();
      }
    } catch (error) {
      console.error("Error loading theme data:", error);
      Alert.alert("Error", "No se pudo cargar la información del tema");
    } finally {
      if (!isEditing) {
        setIsLoading(false);
      }
    }
  };

  const loadQuestionData = async () => {
    try {
      const question = await questionService.getQuestionById(questionId);

      if (question) {
        setQuestionText(question.text);
        setOptions(question.options);
      } else {
        Alert.alert("Error", "No se encontró la pregunta");
      }
    } catch (error) {
      console.error("Error loading question data:", error);
      Alert.alert("Error", "No se pudo cargar la información de la pregunta");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionChange = (id: string, text: string) => {
    setOptions(
      options.map((option) => (option.id === id ? { ...option, text } : option))
    );
  };

  const handleCorrectOptionChange = (id: string) => {
    setOptions(
      options.map((option) => ({
        ...option,
        is_correct: option.id === id,
      }))
    );
  };

  const validateForm = () => {
    if (!questionText.trim()) {
      Alert.alert("Error", "Por favor ingresa el texto de la pregunta");
      return false;
    }

    // Verificar que todas las opciones tengan texto
    const emptyOptions = options.filter((option) => !option.text.trim());
    if (emptyOptions.length > 0) {
      Alert.alert("Error", "Todas las opciones deben tener texto");
      return false;
    }

    // Verificar que haya una opción correcta
    const correctOption = options.find((option) => option.is_correct);
    if (!correctOption) {
      Alert.alert("Error", "Debe haber una opción correcta");
      return false;
    }

    return true;
  };

  const saveQuestion = async () => {
    if (!validateForm()) return;
    if (!user?.email) {
      Alert.alert("Error", "Debes iniciar sesión para crear una pregunta");
      return;
    }

    try {
      setIsSaving(true);

      if (isEditing) {
        // Actualizar pregunta existente
        await questionService.updateQuestion(questionId, {
          text: questionText,
          options,
        });

        Alert.alert("Éxito", "Pregunta actualizada correctamente");
        router.back();
      } else if (isBatchMode) {
        // Añadir a la lista de preguntas por lotes
        const newQuestion: Omit<Question, "id" | "created_at"> = {
          theme_id: themeId,
          text: questionText,
          options,
          created_by: user.email,
        };

        setBatchQuestions([...batchQuestions, newQuestion as Question]);

        // Limpiar el formulario para la siguiente pregunta
        setQuestionText("");
        setOptions([
          { id: "1", text: "", is_correct: true },
          { id: "2", text: "", is_correct: false },
          { id: "3", text: "", is_correct: false },
          { id: "4", text: "", is_correct: false },
        ]);

        Alert.alert(
          "Pregunta añadida",
          `Se ha añadido la pregunta al lote. Total: ${
            batchQuestions.length + 1
          }`,
          [
            { text: "Continuar añadiendo" },
            {
              text: "Guardar y salir",
              onPress: async () => {
                await saveBatchQuestions();
                router.back();
              },
            },
          ]
        );
      } else {
        // Crear nueva pregunta
        await questionService.createQuestion({
          theme_id: themeId,
          text: questionText,
          options,
          created_by: user.email,
        });

        Alert.alert("Éxito", "Pregunta creada correctamente");
        router.back();
      }
    } catch (error) {
      console.error("Error saving question:", error);
      Alert.alert("Error", "No se pudo guardar la pregunta");
    } finally {
      setIsSaving(false);
    }
  };

  const saveBatchQuestions = async () => {
    if (batchQuestions.length === 0) return;

    try {
      setIsSaving(true);

      // Añadir la pregunta actual si es válida
      if (validateForm()) {
        const currentQuestion: Omit<Question, "id" | "created_at"> = {
          theme_id: themeId,
          text: questionText,
          options,
          created_by: user?.email || "anonymous",
        };

        const allQuestions = [...batchQuestions, currentQuestion as Question];

        // Guardar todas las preguntas
        await questionService.createMultipleQuestions(
          allQuestions.map((q) => ({
            theme_id: q.theme_id,
            text: q.text,
            options: q.options,
            created_by: q.created_by,
          }))
        );

        Alert.alert(
          "Éxito",
          `Se han guardado ${allQuestions.length} preguntas`
        );
        setBatchQuestions([]);
      }
    } catch (error) {
      console.error("Error saving batch questions:", error);
      Alert.alert("Error", "No se pudieron guardar las preguntas");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0F3057" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (batchQuestions.length > 0) {
              Alert.alert(
                "Preguntas sin guardar",
                "Tienes preguntas sin guardar. ¿Qué deseas hacer?",
                [
                  {
                    text: "Descartar",
                    style: "destructive",
                    onPress: () => router.back(),
                  },
                  {
                    text: "Guardar y salir",
                    onPress: async () => {
                      await saveBatchQuestions();
                      router.back();
                    },
                  },
                  { text: "Cancelar", style: "cancel" },
                ]
              );
            } else {
              router.back();
            }
          }}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? "Editar Pregunta" : "Crear Pregunta"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {theme && (
        <View style={styles.themeInfo}>
          <Text style={styles.themeTitle}>Tema: {theme.title}</Text>
          {!isEditing && (
            <View style={styles.batchModeContainer}>
              <Text style={styles.batchModeText}>Modo lote</Text>
              <Switch
                value={isBatchMode}
                onValueChange={setIsBatchMode}
                trackColor={{ false: "#ddd", true: "#0F3057" }}
                thumbColor={isBatchMode ? "#fff" : "#f4f3f4"}
              />
            </View>
          )}
        </View>
      )}

      {isBatchMode && batchQuestions.length > 0 && (
        <View style={styles.batchInfo}>
          <Text style={styles.batchCount}>
            {batchQuestions.length}{" "}
            {batchQuestions.length === 1 ? "pregunta" : "preguntas"} en lote
          </Text>
        </View>
      )}

      <View style={styles.formContainer}>
        {/* Texto de la pregunta */}
        <Text style={styles.label}>Pregunta</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={questionText}
          onChangeText={setQuestionText}
          placeholder="Escribe tu pregunta aquí..."
          multiline
          numberOfLines={3}
        />

        {/* Opciones */}
        <Text style={styles.label}>Opciones (selecciona la correcta)</Text>
        {options.map((option, index) => (
          <View key={option.id} style={styles.optionContainer}>
            <View style={styles.optionHeader}>
              <Text style={styles.optionLabel}>Opción {index + 1}</Text>
              <View style={styles.correctContainer}>
                <Text style={styles.correctLabel}>Correcta</Text>
                <Switch
                  value={option.is_correct}
                  onValueChange={() => handleCorrectOptionChange(option.id)}
                  trackColor={{ false: "#ddd", true: "#0F3057" }}
                  thumbColor={option.is_correct ? "#fff" : "#f4f3f4"}
                />
              </View>
            </View>
            <TextInput
              style={styles.input}
              value={option.text}
              onChangeText={(text) => handleOptionChange(option.id, text)}
              placeholder={`Opción ${index + 1}`}
            />
          </View>
        ))}

        {/* Botones de acción */}
        <View style={styles.actionButtons}>
          {isBatchMode && (
            <TouchableOpacity
              style={[styles.saveButton, styles.batchSaveButton]}
              onPress={saveBatchQuestions}
              disabled={isSaving || batchQuestions.length === 0}>
              {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>
                  Guardar {batchQuestions.length} preguntas
                </Text>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveQuestion}
            disabled={isSaving}>
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>
                {isEditing
                  ? "Actualizar Pregunta"
                  : isBatchMode
                  ? "Añadir al lote"
                  : "Crear Pregunta"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
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
  themeInfo: {
    padding: 16,
    backgroundColor: "#e6f7ff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  themeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F3057",
  },
  batchModeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  batchModeText: {
    fontSize: 14,
    color: "#0F3057",
    marginRight: 8,
  },
  batchInfo: {
    backgroundColor: "#0F3057",
    padding: 12,
    alignItems: "center",
  },
  batchCount: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  formContainer: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  optionContainer: {
    marginBottom: 16,
  },
  optionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
  },
  correctContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  correctLabel: {
    fontSize: 14,
    color: "#555",
    marginRight: 8,
  },
  actionButtons: {
    marginTop: 24,
    marginBottom: 40,
  },
  saveButton: {
    backgroundColor: "#0F3057",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  batchSaveButton: {
    backgroundColor: "#28a745",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
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

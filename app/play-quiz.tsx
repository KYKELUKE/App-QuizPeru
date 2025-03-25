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
  Animated,
  Share,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/context/auth-context";
import { themeService } from "@/services/theme-service";
import { questionService } from "@/services/question-service";
import { quizService } from "@/services/quiz-service";
import type { QuizTheme, Question } from "@/types/database.types";

export default function PlayQuizScreen() {
  const params = useLocalSearchParams();
  const themeId = params.themeId as string;
  const { user } = useAuth();

  const [theme, setTheme] = useState<QuizTheme | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [progressAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    loadData();
  }, []);

  // Temporizador para cada pregunta
  useEffect(() => {
    if (isLoading || isAnswered || isQuizCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Animación de la barra de progreso
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: timeLeft * 1000,
      useNativeDriver: false,
    }).start();

    return () => {
      clearInterval(timer);
      progressAnim.setValue(1);
    };
  }, [currentQuestionIndex, isLoading, isAnswered, isQuizCompleted]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Cargar tema
      const foundTheme = await themeService.getThemeById(themeId);

      if (foundTheme) {
        setTheme(foundTheme);
      } else {
        Alert.alert("Error", "No se encontró el tema");
        router.back();
        return;
      }

      // Cargar preguntas
      const themeQuestions = await questionService.getQuestionsByTheme(themeId);

      if (themeQuestions.length === 0) {
        Alert.alert("Error", "Este tema no tiene preguntas", [
          { text: "Volver", onPress: () => router.back() },
        ]);
        return;
      }

      // Mezclar las preguntas para que aparezcan en orden aleatorio
      const shuffledQuestions = [...themeQuestions].sort(
        () => Math.random() - 0.5
      );
      setQuestions(shuffledQuestions);
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "No se pudieron cargar las preguntas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeout = () => {
    setIsAnswered(true);
    // No se suma puntuación si se agota el tiempo
  };

  const handleOptionSelect = (optionId: string) => {
    if (isAnswered) return;

    setSelectedOption(optionId);
    setIsAnswered(true);

    // Verificar si la respuesta es correcta
    const currentQuestion = questions[currentQuestionIndex];
    const selectedOptionObj = currentQuestion.options.find(
      (opt) => opt.id === optionId
    );

    if (selectedOptionObj?.is_correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(15);
      progressAnim.setValue(1);
    } else {
      setIsQuizCompleted(true);
      // Guardar resultado en el historial
      saveQuizResult();
    }
  };

  const saveQuizResult = async () => {
    try {
      if (!user?.email || !theme) return;

      await quizService.saveQuizResult({
        theme_id: themeId,
        theme_name: theme.title,
        user_id: user.email,
        score,
        total_questions: questions.length,
      });

      console.log("Quiz result saved successfully");
    } catch (error) {
      console.error("Error saving quiz result:", error);
    }
  };

  const shareResult = async () => {
    if (!theme) return;

    try {
      await Share.share({
        message: `¡He completado el quiz "${
          theme.title
        }" con una puntuación de ${score}/${questions.length} (${Math.round(
          (score / questions.length) * 100
        )}%)! ¡Intenta superarme en la app PerúQuiz!`,
      });
    } catch (error) {
      console.error("Error sharing result:", error);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsQuizCompleted(false);
    setTimeLeft(15);
    progressAnim.setValue(1);

    // Mezclar las preguntas nuevamente
    setQuestions([...questions].sort(() => Math.random() - 0.5));
  };

  const exitQuiz = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0F3057" />
        <Text style={styles.loadingText}>Cargando quiz...</Text>
      </View>
    );
  }

  if (isQuizCompleted) {
    const percentage = Math.round((score / questions.length) * 100);
    let resultMessage = "";
    let resultIcon = "";

    if (percentage >= 80) {
      resultMessage = "¡Excelente!";
      resultIcon = "trophy";
    } else if (percentage >= 60) {
      resultMessage = "¡Muy bien!";
      resultIcon = "star";
    } else if (percentage >= 40) {
      resultMessage = "Buen intento";
      resultIcon = "thumbs-up";
    } else {
      resultMessage = "Sigue practicando";
      resultIcon = "book";
    }

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={exitQuiz}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Resultados</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.resultsContainer}>
          <FontAwesome5 name={resultIcon} size={60} color="#0F3057" />
          <Text style={styles.resultTitle}>{resultMessage}</Text>
          <Text style={styles.resultScore}>
            {score} de {questions.length} correctas
          </Text>
          <View style={styles.percentageContainer}>
            <Text style={styles.percentageText}>{percentage}%</Text>
          </View>

          <View style={styles.resultActions}>
            <TouchableOpacity
              style={[styles.resultButton, styles.shareButton]}
              onPress={shareResult}>
              <Ionicons name="share-social" size={20} color="#fff" />
              <Text style={styles.shareButtonText}>Compartir</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.resultButton, styles.restartButton]}
              onPress={restartQuiz}>
              <Ionicons name="refresh" size={20} color="#0F3057" />
              <Text style={styles.restartButtonText}>Reintentar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.resultButton, styles.exitButton]}
              onPress={exitQuiz}>
              <Ionicons name="exit-outline" size={20} color="#fff" />
              <Text style={styles.exitButtonText}>Salir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            Alert.alert(
              "Salir del quiz",
              "¿Estás seguro de que deseas salir? Perderás tu progreso.",
              [
                { text: "Cancelar", style: "cancel" },
                { text: "Salir", onPress: exitQuiz },
              ]
            );
          }}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{theme?.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Pregunta {currentQuestionIndex + 1} de {questions.length}
        </Text>
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressWidth,
                backgroundColor: timeLeft < 5 ? "#ff4444" : "#0F3057",
              },
            ]}
          />
        </View>
        <Text style={styles.timerText}>{timeLeft}s</Text>
      </View>

      <ScrollView style={styles.questionContainer}>
        <Text style={styles.questionText}>{currentQuestion.text}</Text>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option) => {
            const isSelected = selectedOption === option.id;
            const isCorrect = option.is_correct && isAnswered;
            const isWrong = isSelected && !option.is_correct && isAnswered;

            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionButton,
                  isSelected && styles.selectedOption,
                  isCorrect && styles.correctOption,
                  isWrong && styles.wrongOption,
                ]}
                onPress={() => handleOptionSelect(option.id)}
                disabled={isAnswered}>
                <Text
                  style={[
                    styles.optionText,
                    (isSelected || isCorrect) && styles.selectedOptionText,
                  ]}>
                  {option.text}
                </Text>
                {isAnswered && option.is_correct && (
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                )}
                {isWrong && (
                  <Ionicons name="close-circle" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {isAnswered && (
        <View style={styles.nextContainer}>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNextQuestion}>
            <Text style={styles.nextButtonText}>
              {currentQuestionIndex < questions.length - 1
                ? "Siguiente Pregunta"
                : "Ver Resultados"}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
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
  progressContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  progressText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "#eee",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#0F3057",
  },
  timerText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    textAlign: "right",
  },
  questionContainer: {
    flex: 1,
    padding: 16,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectedOption: {
    backgroundColor: "#0F3057",
    borderColor: "#0F3057",
  },
  correctOption: {
    backgroundColor: "#28a745",
    borderColor: "#28a745",
  },
  wrongOption: {
    backgroundColor: "#dc3545",
    borderColor: "#dc3545",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  selectedOptionText: {
    color: "#fff",
    fontWeight: "bold",
  },
  nextContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  nextButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F3057",
    padding: 16,
    borderRadius: 8,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
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
  resultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  resultScore: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
  },
  percentageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  percentageText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#0F3057",
  },
  resultActions: {
    flexDirection: "column",
    justifyContent: "center",
    width: "100%",
    gap: 12,
  },
  resultButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: "100%",
  },
  shareButton: {
    backgroundColor: "#4267B2", // Facebook blue
  },
  restartButton: {
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#0F3057",
  },
  exitButton: {
    backgroundColor: "#0F3057",
  },
  shareButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
  restartButtonText: {
    color: "#0F3057",
    fontWeight: "bold",
    marginLeft: 8,
  },
  exitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
});

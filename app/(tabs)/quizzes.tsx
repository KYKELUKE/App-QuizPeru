"use client";

import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "@/context/auth-context";
import { themeService } from "@/services/theme-service";
import { questionService } from "@/services/question-service";
import type { QuizTheme } from "@/types/database.types";
import { useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");

export default function QuizzesScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("categories");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [publicThemes, setPublicThemes] = useState<QuizTheme[]>([]);
  const [featuredTheme, setFeaturedTheme] = useState<QuizTheme | null>(null);

  // Cargar temas públicos
  const loadPublicThemes = async () => {
    try {
      setIsLoading(true);
      if (!user?.email) return;

      // Obtener todos los temas públicos
      const themes = await themeService.getPublicThemes();
      setPublicThemes(themes);

      // Seleccionar un tema destacado (el que tenga más preguntas)
      if (themes.length > 0) {
        const featured = [...themes].sort(
          (a, b) => (b.questions_count || 0) - (a.questions_count || 0)
        )[0];
        setFeaturedTheme(featured);
      }
    } catch (error) {
      console.error("Error loading public themes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos al iniciar y al volver a la pantalla
  useEffect(() => {
    if (user) {
      loadPublicThemes();
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadPublicThemes();
      }
      return () => {};
    }, [user])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPublicThemes().finally(() => setRefreshing(false));
  }, [user]);

  // Función para jugar un quiz
  const playQuiz = async (themeId: string) => {
    try {
      // Verificar si el tema tiene preguntas
      const questions = await questionService.getQuestionsByTheme(themeId);

      if (questions.length === 0) {
        alert("Este tema no tiene preguntas disponibles.");
        return;
      }

      // Si hay preguntas, navegar a la pantalla de juego
      router.push({
        pathname: "/play-quiz",
        params: { themeId },
      });
    } catch (error) {
      console.error("Error checking questions:", error);
      alert("No se pudo verificar si el tema tiene preguntas");
    }
  };

  // Agrupar temas por categorías
  const getThemesByCategory = () => {
    const categories: Record<string, QuizTheme[]> = {};

    publicThemes.forEach((theme) => {
      // Usar el icono como identificador de categoría
      const category = theme.icon || "default";
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(theme);
    });

    return categories;
  };

  const themeCategories = getThemesByCategory();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0F3057" />
        <Text style={styles.loadingText}>Cargando quizzes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quizzes</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "categories" && styles.activeTab]}
          onPress={() => setActiveTab("categories")}>
          <Text
            style={[
              styles.tabText,
              activeTab === "categories" && styles.activeTabText,
            ]}>
            Categorías
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "popular" && styles.activeTab]}
          onPress={() => setActiveTab("popular")}>
          <Text
            style={[
              styles.tabText,
              activeTab === "popular" && styles.activeTabText,
            ]}>
            Populares
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "recent" && styles.activeTab]}
          onPress={() => setActiveTab("recent")}>
          <Text
            style={[
              styles.tabText,
              activeTab === "recent" && styles.activeTabText,
            ]}>
            Recientes
          </Text>
        </TouchableOpacity>
      </View>

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
        {/* Featured Quiz */}
        {featuredTheme && (
          <View style={styles.featuredContainer}>
            <Text style={styles.sectionTitle}>Quiz Destacado</Text>
            <TouchableOpacity
              style={styles.featuredCard}
              onPress={() => playQuiz(featuredTheme.id)}>
              <LinearGradient
                colors={featuredTheme.color || ["#0F3057", "#00587A"]}
                style={styles.featuredImage}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}>
                <FontAwesome5
                  name={featuredTheme.icon || "question"}
                  size={40}
                  color="#fff"
                  style={styles.featuredIcon}
                />
              </LinearGradient>
              <View style={styles.featuredContent}>
                <Text style={styles.featuredTitle}>{featuredTheme.title}</Text>
                <Text style={styles.featuredDescription}>
                  {featuredTheme.description}
                </Text>
                <View style={styles.featuredMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="help-circle" size={16} color="#666" />
                    <Text style={styles.metaText}>
                      {featuredTheme.questions_count || 0} preguntas
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="person" size={16} color="#666" />
                    <Text style={styles.metaText}>
                      {featuredTheme.created_by === user?.email
                        ? "Creado por ti"
                        : "Creado por otro usuario"}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Public Themes by Category */}
        {Object.entries(themeCategories).map(([category, themes]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.sectionTitle}>{getCategoryName(category)}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {themes.map((theme) => (
                <TouchableOpacity
                  key={theme.id}
                  style={styles.themeCard}
                  onPress={() => playQuiz(theme.id)}>
                  <LinearGradient
                    colors={theme.color || ["#0F3057", "#00587A"]}
                    style={styles.themeCardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}>
                    <FontAwesome5
                      name={theme.icon || "question"}
                      size={24}
                      color="#fff"
                    />
                  </LinearGradient>
                  <Text style={styles.themeCardTitle}>{theme.title}</Text>
                  <Text style={styles.themeCardQuestions}>
                    {theme.questions_count || 0} preguntas
                  </Text>
                  <View style={styles.playIconContainer}>
                    <Ionicons name="play-circle" size={24} color="#0F3057" />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ))}

        {/* Daily Challenge */}
        <View style={styles.dailyContainer}>
          <LinearGradient
            colors={["#0F3057", "#00587A"]}
            style={styles.dailyGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}>
            <View style={styles.dailyContent}>
              <View>
                <Text style={styles.dailyTitle}>Desafío Diario</Text>
                <Text style={styles.dailyDescription}>
                  ¡Completa el desafío y gana puntos extra!
                </Text>
              </View>
              <TouchableOpacity style={styles.dailyButton}>
                <Text style={styles.dailyButtonText}>Jugar</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
}

// Función para obtener el nombre de la categoría basado en el icono
function getCategoryName(iconName: string): string {
  const categoryMap: Record<string, string> = {
    book: "Historia",
    utensils: "Gastronomía",
    mountain: "Geografía",
    palette: "Arte y Cultura",
    leaf: "Naturaleza",
    landmark: "Monumentos",
    music: "Música",
    flask: "Ciencia",
    futbol: "Deportes",
    "map-marker-alt": "Lugares",
    default: "Otros temas",
  };

  return categoryMap[iconName] || "Otros temas";
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
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    color: "#888",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#333",
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  featuredContainer: {
    marginBottom: 25,
  },
  featuredCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuredImage: {
    width: "100%",
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  featuredIcon: {
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  featuredContent: {
    padding: 15,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  featuredDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  featuredMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    marginLeft: 5,
    fontSize: 12,
    color: "#666",
  },
  categorySection: {
    marginBottom: 25,
  },
  themeCard: {
    width: 160,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    position: "relative",
  },
  themeCardGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  themeCardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  themeCardQuestions: {
    fontSize: 12,
    color: "#888",
  },
  playIconContainer: {
    position: "absolute",
    bottom: 10,
    right: 10,
  },
  dailyContainer: {
    marginBottom: 25,
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  dailyGradient: {
    padding: 20,
  },
  dailyContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dailyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  dailyDescription: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
    maxWidth: "70%",
  },
  dailyButton: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  dailyButtonText: {
    color: "#0F3057",
    fontWeight: "bold",
  },
});

"use client";

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

// Quiz categories with Peruvian themes
const categories = [
  {
    id: 1,
    name: "Historia Peruana",
    icon: "monument",
    color: ["#FF5F6D", "#FFC371"],
    questions: 20,
  },
  {
    id: 2,
    name: "Gastronomía",
    icon: "utensils",
    color: ["#36D1DC", "#5B86E5"],
    questions: 15,
  },
  {
    id: 3,
    name: "Geografía",
    icon: "mountain",
    color: ["#11998e", "#38ef7d"],
    questions: 18,
  },
  {
    id: 4,
    name: "Cultura y Arte",
    icon: "palette",
    color: ["#8A2387", "#E94057"],
    questions: 12,
  },
  {
    id: 5,
    name: "Fauna y Flora",
    icon: "leaf",
    color: ["#0F3443", "#34e89e"],
    questions: 10,
  },
];

// Featured quiz data
const featuredQuiz = {
  title: "Maravillas de Machu Picchu",
  description: "Descubre los secretos de esta maravilla mundial",
  image: "/placeholder.svg?height=200&width=400",
  questions: 15,
  time: "10 min",
};

export default function QuizzesScreen() {
  const [activeTab, setActiveTab] = useState("categories");

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

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Featured Quiz */}
        <View style={styles.featuredContainer}>
          <Text style={styles.sectionTitle}>Quiz Destacado</Text>
          <TouchableOpacity style={styles.featuredCard}>
            <Image
              source={{ uri: "https://picsum.photos/400/200" }}
              style={styles.featuredImage}
            />
            <View style={styles.featuredContent}>
              <Text style={styles.featuredTitle}>{featuredQuiz.title}</Text>
              <Text style={styles.featuredDescription}>
                {featuredQuiz.description}
              </Text>
              <View style={styles.featuredMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="help-circle" size={16} color="#666" />
                  <Text style={styles.metaText}>
                    {featuredQuiz.questions} preguntas
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="time" size={16} color="#666" />
                  <Text style={styles.metaText}>{featuredQuiz.time}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Categorías</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity key={category.id} style={styles.categoryCard}>
                <LinearGradient
                  colors={category.color}
                  style={styles.categoryGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}>
                  <FontAwesome5
                    name={category.icon}
                    size={28}
                    color="#fff"
                    style={styles.categoryIcon}
                  />
                </LinearGradient>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryQuestions}>
                  {category.questions} preguntas
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

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
  categoriesContainer: {
    marginBottom: 25,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryCard: {
    width: width / 2 - 24,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  categoryIcon: {
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
    color: "#333",
  },
  categoryQuestions: {
    fontSize: 12,
    color: "#888",
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

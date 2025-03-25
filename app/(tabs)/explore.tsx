import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

// Categorías de exploración sobre Perú
const categories = [
  {
    id: 1,
    name: "Destinos Turísticos",
    description: "Explora los lugares más impresionantes de Perú",
    icon: "map-marker-alt",
    color: ["#FF5F6D", "#FFC371"],
  },
  {
    id: 2,
    name: "Historia y Cultura",
    description: "Descubre el rico pasado del Perú",
    icon: "monument",
    color: ["#36D1DC", "#5B86E5"],
  },
  {
    id: 3,
    name: "Gastronomía",
    description: "Conoce los sabores únicos de la cocina peruana",
    icon: "utensils",
    color: ["#11998e", "#38ef7d"],
  },
  {
    id: 4,
    name: "Tradiciones",
    description: "Sumérgete en las costumbres y festividades",
    icon: "mask",
    color: ["#8A2387", "#E94057"],
  },
];

// Artículos destacados
const featuredArticles = [
  {
    id: 1,
    title: "Machu Picchu: La Ciudad Perdida",
    image: "https://picsum.photos/id/1036/300/200",
    readTime: "5 min",
  },
  {
    id: 2,
    title: "El Misterio de las Líneas de Nazca",
    image: "https://picsum.photos/id/1037/300/200",
    readTime: "4 min",
  },
  {
    id: 3,
    title: "Ceviche: El Plato Bandera del Perú",
    image: "https://picsum.photos/id/1080/300/200",
    readTime: "3 min",
  },
];

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Explora Perú</Text>
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Banner */}
        <LinearGradient
          colors={["#0F3057", "#00587A"]}
          style={styles.banner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>
              Descubre las Maravillas del Perú
            </Text>
            <Text style={styles.bannerSubtitle}>
              Explora la historia, cultura y belleza natural
            </Text>
            <TouchableOpacity style={styles.bannerButton}>
              <Text style={styles.bannerButtonText}>Comenzar</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Categories */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Categorías</Text>
          <View style={styles.categoriesContainer}>
            {categories.map((category) => (
              <TouchableOpacity key={category.id} style={styles.categoryCard}>
                <LinearGradient
                  colors={category.color}
                  style={styles.categoryIcon}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}>
                  <FontAwesome5 name={category.icon} size={24} color="#fff" />
                </LinearGradient>
                <View style={styles.categoryContent}>
                  <Text style={styles.categoryTitle}>{category.name}</Text>
                  <Text style={styles.categoryDescription}>
                    {category.description}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color="#ccc"
                  style={styles.categoryArrow}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Articles */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Artículos Destacados</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.articlesContainer}>
            {featuredArticles.map((article) => (
              <TouchableOpacity key={article.id} style={styles.articleCard}>
                <Image
                  source={{ uri: article.image }}
                  style={styles.articleImage}
                />
                <View style={styles.articleContent}>
                  <Text style={styles.articleTitle}>{article.title}</Text>
                  <View style={styles.articleMeta}>
                    <Ionicons name="time-outline" size={14} color="#888" />
                    <Text style={styles.articleReadTime}>
                      {article.readTime}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Did You Know */}
        <View style={styles.didYouKnowContainer}>
          <View style={styles.didYouKnowHeader}>
            <Ionicons name="bulb-outline" size={24} color="#FFD700" />
            <Text style={styles.didYouKnowTitle}>¿Sabías que?</Text>
          </View>
          <Text style={styles.didYouKnowText}>
            Perú es hogar de 90 microclimas diferentes, lo que lo convierte en
            uno de los países con mayor diversidad climática del mundo.
          </Text>
        </View>

        {/* Upcoming Events */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Próximos Eventos</Text>
          <View style={styles.eventCard}>
            <View style={styles.eventDate}>
              <Text style={styles.eventDay}>28</Text>
              <Text style={styles.eventMonth}>JUL</Text>
            </View>
            <View style={styles.eventContent}>
              <Text style={styles.eventTitle}>
                Fiestas Patrias: Celebración de la Independencia
              </Text>
              <Text style={styles.eventLocation}>
                <Ionicons name="location-outline" size={14} color="#888" />{" "}
                Lima, Perú
              </Text>
            </View>
          </View>
          <View style={styles.eventCard}>
            <View style={styles.eventDate}>
              <Text style={styles.eventDay}>15</Text>
              <Text style={styles.eventMonth}>AGO</Text>
            </View>
            <View style={styles.eventContent}>
              <Text style={styles.eventTitle}>
                Festival Gastronómico Mistura
              </Text>
              <Text style={styles.eventLocation}>
                <Ionicons name="location-outline" size={14} color="#888" />{" "}
                Parque de la Exposición, Lima
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    padding: 20,
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
  banner: {
    marginHorizontal: 20,
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 25,
  },
  bannerContent: {
    padding: 20,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
    marginBottom: 15,
  },
  bannerButton: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  bannerButtonText: {
    color: "#0F3057",
    fontWeight: "bold",
  },
  sectionContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  categoriesContainer: {
    gap: 15,
  },
  categoryCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryContent: {
    flex: 1,
    marginLeft: 15,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 12,
    color: "#888",
  },
  categoryArrow: {
    marginLeft: 10,
  },
  articlesContainer: {
    marginLeft: -5,
  },
  articleCard: {
    width: 250,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  articleImage: {
    width: "100%",
    height: 140,
  },
  articleContent: {
    padding: 15,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  articleMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  articleReadTime: {
    fontSize: 12,
    color: "#888",
    marginLeft: 5,
  },
  didYouKnowContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FFD700",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  didYouKnowHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  didYouKnowTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
  didYouKnowText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  eventCard: {
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
  eventDate: {
    width: 50,
    height: 60,
    backgroundColor: "#0F3057",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  eventDay: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  eventMonth: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.9,
  },
  eventContent: {
    flex: 1,
    marginLeft: 15,
    justifyContent: "center",
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  eventLocation: {
    fontSize: 12,
    color: "#888",
  },
});

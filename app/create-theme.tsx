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
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/context/auth-context";
import { themeService } from "@/services/theme-service";

// Colores predefinidos para los temas
const themeColors = [
  ["#FF5F6D", "#FFC371"],
  ["#36D1DC", "#5B86E5"],
  ["#11998e", "#38ef7d"],
  ["#8A2387", "#E94057"],
  ["#0F3443", "#34e89e"],
];

// Iconos predefinidos para los temas
const themeIcons = [
  "book",
  "map-marker-alt",
  "utensils",
  "mountain",
  "landmark",
  "palette",
  "music",
  "flask",
  "futbol",
  "leaf",
];

export default function CreateThemeScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const themeId = params.themeId as string;
  const isEditing = !!themeId;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedIcon, setSelectedIcon] = useState(0);
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Cargar datos del tema si estamos editando
  useEffect(() => {
    if (isEditing) {
      loadThemeData();
    }
  }, [isEditing]);

  const loadThemeData = async () => {
    try {
      setIsLoading(true);
      const theme = await themeService.getThemeById(themeId);

      if (theme) {
        setTitle(theme.title);
        setDescription(theme.description);
        setIsPublic(theme.is_public);

        // Encontrar el índice del color
        const colorIndex = themeColors.findIndex(
          (c) => JSON.stringify(c) === JSON.stringify(theme.color)
        );
        setSelectedColor(colorIndex >= 0 ? colorIndex : 0);

        // Encontrar el índice del icono
        const iconIndex = themeIcons.indexOf(theme.icon);
        setSelectedIcon(iconIndex >= 0 ? iconIndex : 0);
      }
    } catch (error) {
      console.error("Error loading theme data:", error);
      Alert.alert("Error", "No se pudo cargar la información del tema");
    } finally {
      setIsLoading(false);
    }
  };

  const saveTheme = async () => {
    // Validación
    if (!title.trim()) {
      Alert.alert("Error", "Por favor ingresa un título para el tema");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Error", "Por favor ingresa una descripción para el tema");
      return;
    }

    if (!user?.email) {
      Alert.alert("Error", "Debes iniciar sesión para crear un tema");
      return;
    }

    try {
      setIsSaving(true);

      if (isEditing) {
        // Actualizar tema existente
        await themeService.updateTheme(themeId, {
          title,
          description,
          icon: themeIcons[selectedIcon],
          color: themeColors[selectedColor],
          is_public: isPublic,
        });

        Alert.alert("Éxito", "Tema actualizado correctamente");
      } else {
        // Crear nuevo tema
        await themeService.createTheme({
          title,
          description,
          icon: themeIcons[selectedIcon],
          color: themeColors[selectedColor],
          created_by: user.email,
          is_public: isPublic,
        });

        Alert.alert("Éxito", "Tema creado correctamente");
      }

      // Volver a la pantalla anterior
      router.back();
    } catch (error) {
      console.error("Error saving theme:", error);
      Alert.alert("Error", "No se pudo guardar el tema");
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
          onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? "Editar Tema" : "Crear Nuevo Tema"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.formContainer}>
        {/* Título */}
        <Text style={styles.label}>Título del Tema</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Ej: Historia del Perú"
          maxLength={50}
        />

        {/* Descripción */}
        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Breve descripción del tema..."
          multiline
          numberOfLines={4}
          maxLength={200}
        />

        {/* Selección de color */}
        <Text style={styles.label}>Color del Tema</Text>
        <View style={styles.colorContainer}>
          {themeColors.map((color, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.colorOption,
                {
                  backgroundColor: color[0],
                  borderWidth: selectedColor === index ? 3 : 0,
                },
              ]}
              onPress={() => setSelectedColor(index)}
            />
          ))}
        </View>

        {/* Selección de icono */}
        <Text style={styles.label}>Icono del Tema</Text>
        <View style={styles.iconContainer}>
          {themeIcons.map((icon, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.iconOption,
                selectedIcon === index && styles.selectedIconOption,
              ]}
              onPress={() => setSelectedIcon(index)}>
              <FontAwesome5
                name={icon}
                size={24}
                color={selectedIcon === index ? "#fff" : "#333"}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Opción de tema público */}
        <View style={styles.publicContainer}>
          <Text style={styles.label}>Tema Público</Text>
          <View style={styles.publicDescription}>
            <Text style={styles.publicText}>
              Si activas esta opción, otros usuarios podrán ver y responder a
              las preguntas de este tema
            </Text>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{ false: "#ddd", true: "#0F3057" }}
              thumbColor={isPublic ? "#fff" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Vista previa */}
        <Text style={styles.label}>Vista Previa</Text>
        <View style={styles.previewContainer}>
          <View
            style={[
              styles.previewIcon,
              { backgroundColor: themeColors[selectedColor][0] },
            ]}>
            <FontAwesome5
              name={themeIcons[selectedIcon]}
              size={24}
              color="#fff"
            />
          </View>
          <View style={styles.previewContent}>
            <Text style={styles.previewTitle}>
              {title || "Título del Tema"}
            </Text>
            <Text style={styles.previewDescription}>
              {description || "Descripción del tema..."}
            </Text>
            {isPublic && (
              <View style={styles.publicBadge}>
                <Text style={styles.publicBadgeText}>Público</Text>
              </View>
            )}
          </View>
        </View>

        {/* Botón de guardar */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveTheme}
          disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>
              {isEditing ? "Actualizar Tema" : "Crear Tema"}
            </Text>
          )}
        </TouchableOpacity>
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
  colorContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 8,
    borderColor: "#333",
  },
  iconContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  iconOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    margin: 8,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedIconOption: {
    backgroundColor: "#0F3057",
  },
  publicContainer: {
    marginVertical: 16,
  },
  publicDescription: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  publicText: {
    fontSize: 14,
    color: "#666",
    flex: 1,
    marginRight: 10,
  },
  previewContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  previewIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  previewContent: {
    flex: 1,
    marginLeft: 16,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  previewDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  publicBadge: {
    backgroundColor: "#0F3057",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  publicBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#0F3057",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 40,
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

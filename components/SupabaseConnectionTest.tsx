"use client";

import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { testSupabaseConnection } from "@/lib/supabase";

export default function SupabaseConnectionTest() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const result = await testSupabaseConnection();
      setIsConnected(result);
    } catch (error) {
      console.error("Error testing connection:", error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Estado de conexión a Supabase</Text>

      {isLoading ? (
        <Text style={styles.loadingText}>Probando conexión...</Text>
      ) : (
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusIndicator,
              {
                backgroundColor:
                  isConnected === null
                    ? "#ccc"
                    : isConnected
                    ? "#4CAF50"
                    : "#F44336",
              },
            ]}
          />
          <Text style={styles.statusText}>
            {isConnected === null
              ? "No probado"
              : isConnected
              ? "Conectado"
              : "Error de conexión"}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={testConnection}
        disabled={isLoading}>
        <Text style={styles.buttonText}>Probar conexión</Text>
      </TouchableOpacity>

      {!isConnected && isConnected !== null && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Posibles problemas:</Text>
          <Text style={styles.errorText}>
            1. Verifica que las variables de entorno estén configuradas
            correctamente
          </Text>
          <Text style={styles.errorText}>
            2. Asegúrate de que la URL y la clave anónima de Supabase sean
            correctas
          </Text>
          <Text style={styles.errorText}>
            3. Verifica tu conexión a internet
          </Text>
          <Text style={styles.errorText}>
            4. Comprueba que el proyecto de Supabase esté activo
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    color: "#333",
  },
  button: {
    backgroundColor: "#0F3057",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorContainer: {
    backgroundColor: "#FFEBEE",
    padding: 12,
    borderRadius: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#D32F2F",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
});

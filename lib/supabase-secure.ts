import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { AppState } from "react-native";
import Constants from "expo-constants";

// Adaptador para SecureStore
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    return SecureStore.deleteItemAsync(key);
  },
};

// Obtener las credenciales de Supabase
const getSupabaseCredentials = () => {
  // Intenta obtener de process.env primero
  let url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  let key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  // Si no están disponibles, intenta obtenerlos de Constants
  if (!url || !key) {
    try {
      const extra = Constants.expoConfig?.extra;
      url = extra?.supabaseUrl;
      key = extra?.supabaseAnonKey;
    } catch (error) {
      console.error("Error accessing Constants:", error);
    }
  }

  return { url, key };
};

const { url: supabaseUrl, key: supabaseAnonKey } = getSupabaseCredentials();

// Inicializar el cliente de Supabase con SecureStore
export const supabaseSecure = createClient(
  supabaseUrl || "",
  supabaseAnonKey || "",
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// Configurar el manejo del estado de la aplicación
try {
  AppState.addEventListener("change", (state) => {
    if (state === "active") {
      supabaseSecure.auth.startAutoRefresh();
    } else {
      supabaseSecure.auth.stopAutoRefresh();
    }
  });
} catch (error) {
  console.error("Error setting up AppState listener:", error);
}

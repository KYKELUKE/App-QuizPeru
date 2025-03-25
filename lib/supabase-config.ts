import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "react-native";
import Constants from "expo-constants";

// IMPORTANTE: Reemplaza estos valores con tus credenciales reales de Supabase
export const SUPABASE_URL = "https://tu-proyecto-real.supabase.co";
export const SUPABASE_ANON_KEY = "tu-clave-anonima-real";

// Obtener las credenciales de Supabase desde las variables de entorno o Constants
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

// Verificar que tenemos las credenciales
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase URL or Anon Key is missing. Please check your environment variables or app.config.js."
  );
}

// Crear un cliente de Supabase con manejo de errores
const createSupabaseClient = () => {
  try {
    return createClient(supabaseUrl || "", supabaseAnonKey || "", {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  } catch (error) {
    console.error("Error creating Supabase client:", error);
    // Devolver un cliente con URL y clave vacías como fallback
    return createClient("", "", {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
};

// Inicializar el cliente de Supabase
export const supabase = createSupabaseClient();

// Configurar el manejo del estado de la aplicación para mantener la sesión
try {
  AppState.addEventListener("change", (state) => {
    if (state === "active") {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
} catch (error) {
  console.error("Error setting up AppState listener:", error);
}

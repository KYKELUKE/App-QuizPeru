import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "react-native";
import Constants from "expo-constants";

// Obtener las credenciales de Supabase desde Constants (app.config.js)
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
    "Supabase URL o Anon Key no encontrados. Verifica tus variables de entorno o app.config.js."
  );
}

// Inicializar el cliente de Supabase
export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "", {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

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

// Función para probar la conexión a Supabase
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from("themes").select("count");

    if (error) {
      console.error("Error conectando a Supabase:", error);
      return false;
    }

    console.log("Conexión a Supabase exitosa!");
    return true;
  } catch (e) {
    console.error("Excepción al conectar a Supabase:", e);
    return false;
  }
}

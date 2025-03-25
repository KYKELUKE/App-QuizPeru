// Importar dotenv para cargar variables de entorno
require("dotenv").config();

// Verificar que las variables de entorno se están cargando
console.log("Cargando app.config.js con variables:", {
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  SUPABASE_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? "***" : undefined,
});

module.exports = {
  expo: {
    name: "PeruQuiz",
    slug: "PeruQuiz",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.crissiuwest.PeruQuiz",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.crissiuwest.PeruQuiz",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      "expo-font",
      "@react-native-async-storage/async-storage",
      "expo-secure-store",
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: "msjkjssjycwgarndjgno",
      },
      // Aquí puedes acceder a las variables de entorno
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      appName: process.env.EXPO_PUBLIC_APP_NAME || "PerúQuiz",
    },
    runtimeVersion: {
      policy: "appVersion",
    },
    updates: {
      url: "https://u.expo.dev/63930918-c08e-48a4-9c33-acaf49980744",
    },
  },
};

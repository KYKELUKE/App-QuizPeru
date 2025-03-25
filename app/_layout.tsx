"use client";

import type React from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { AuthProvider, useAuth } from "@/context/auth-context";

// Prevent the splash screen from auto-hiding before asset loading is complete.
try {
  SplashScreen.preventAutoHideAsync();
} catch (error) {
  console.warn("Error preventing splash screen from hiding:", error);
}

// Componente para proteger rutas con mejor manejo de errores
function ProtectedRouteGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    try {
      const inAuthGroup = segments[0] === "(tabs)";
      const inAuthScreens =
        segments[0] === "login" || segments[0] === "register";
      const isIndexScreen = segments.length === 1 && segments[0] === "";

      // Lista de rutas permitidas fuera del grupo de tabs para usuarios autenticados
      const allowedRoutes = [
        "create-theme",
        "create-question",
        "theme-questions",
        "play-quiz",
        "modal",
      ];

      const isAllowedRoute = allowedRoutes.includes(segments[0]);

      console.log("Auth state:", {
        user: !!user,
        inAuthGroup,
        inAuthScreens,
        segments,
        isAllowedRoute,
      });

      if (!user && inAuthGroup) {
        // Si el usuario no está autenticado pero intenta acceder a rutas protegidas,
        // redirigir a la pantalla de inicio
        console.log(
          "Redirecting unauthenticated user from protected route to home"
        );
        router.replace("/");
      } else if (
        user &&
        !inAuthGroup &&
        !inAuthScreens &&
        !isAllowedRoute &&
        !isIndexScreen
      ) {
        // Si el usuario está autenticado y no está en una ruta permitida,
        // redirigir a la pantalla principal de tabs
        console.log("Redirecting authenticated user to tabs");
        router.replace("/(tabs)");
      }
    } catch (error) {
      console.error("Error in route protection:", error);
    }
  }, [user, isLoading, segments]);

  return <>{children}</>;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <ProtectedRouteGuard>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="create-theme" options={{ headerShown: false }} />
          <Stack.Screen
            name="create-question"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="theme-questions"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="play-quiz" options={{ headerShown: false }} />
        </Stack>
      </ProtectedRouteGuard>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded || error) {
      try {
        SplashScreen.hideAsync();
      } catch (e) {
        console.warn("Error hiding splash screen:", e);
      }
    }
  }, [loaded, error]);

  // Manejar error de carga de fuentes
  if (error) {
    console.warn("Error loading fonts:", error);
  }

  // Mostrar null es seguro mientras se cargan las fuentes
  if (!loaded && !error) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

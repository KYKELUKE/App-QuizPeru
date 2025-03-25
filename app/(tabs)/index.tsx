import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Logo from "@/components/logo";
import Button from "@/components/Button";
import SupabaseConnectionTest from "@/components/SupabaseConnectionTest";

export default function HomeScreen() {
  return (
    <LinearGradient colors={["#0F3057", "#00587A"]} style={styles.container}>
      <Logo size="large" />
      <Text style={styles.appTitle}>PerúQuiz</Text>
      <Button
        title="Login"
        onPress={() => router.push("/login")}
        style={styles.button}
      />
      <Button
        title="Register"
        variant="secondary"
        onPress={() => router.push("/register")}
        style={styles.button}
      />

      {/* Componente de prueba - Puedes eliminar esto después de verificar la conexión */}
      <View style={styles.testContainer}>
        <SupabaseConnectionTest />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 40,
  },
  button: {
    width: "80%",
  },
  testContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    zIndex: 999,
  },
});

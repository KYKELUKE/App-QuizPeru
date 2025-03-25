import { StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Logo from "@/components/logo";
import Button from "@/components/Button";

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
});

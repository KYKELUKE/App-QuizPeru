import React from "react";
import { Image, StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const Logo = ({ size = "large" }) => {
  const logoSize = size === "large" ? width * 0.6 : width * 0.3;

  return (
    <Image
      source={{
        uri: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DALL%C2%B7E%202025-03-07%2019.44.08%20-%20A%20unique%20logo%20combining%20Peruvian%20cultural%20elements%2C%20technology%2C%20and%20a%20quiz%20concept.%20The%20design%20features%20intricate%20geometric%20patterns%20inspired%20by%20Incan-Photoroom-x5UymwHyZCxLRQjmxm2Vy9tOgYEQ7A.png",
      }}
      style={[styles.logo, { width: logoSize, height: logoSize }]}
      resizeMode="contain"
    />
  );
};

const styles = StyleSheet.create({
  logo: {
    marginBottom: 20,
  },
});

export default Logo;

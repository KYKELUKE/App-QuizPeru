import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

interface SocialButtonProps {
  type: "facebook" | "google" | "linkedin";
}

const SocialButton = ({ type }: SocialButtonProps) => {
  let iconName: "facebook" | "google" | "linkedin" = "facebook";
  if (type === "google") iconName = "google";
  if (type === "linkedin") iconName = "linkedin";

  return (
    <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
      <FontAwesome name={iconName} size={18} color="#555" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
  },
});

export default SocialButton;

import { Stack } from "expo-router";
import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function GetStartedScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {/* Background Image */}
        <Image
          source={require("../../assets/images/started_image.jpeg")}
          style={styles.backgroundImage}
        />

        {/* Overlay Text Box */}
        <View style={styles.overlay}>
          <Text style={styles.headline}>Your Skin. Our Smart Care.</Text>
          <Text style={styles.subheadline}>Meet Your Pocket Dermatologist.</Text>
          <Text style={styles.description}>
            Instant skin insights powered by AI. Doctor-backed, always-on support—right in your pocket.
          </Text>
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/screens/LoginScreen")}
        >
          <Text style={styles.buttonText}>Get Started ➜</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "125%",
    resizeMode: "cover",
    opacity: 0.85,
  },
  overlay: {
    backgroundColor: "#FFFFFFCC", // Glassmorphism effect
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: "center",
    width: 340,
    marginTop: 420,
    marginBottom: 20,
  },
  headline: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 6,
    color: "#1E1E1E",
  },
  subheadline: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 12,
    color: "#333",
  },
  description: {
    fontSize: 15,
    textAlign: "center",
    color: "#555",
    lineHeight: 22,
  },
  button: {
    backgroundColor: "#E9B08A",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    width: 340,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: "#000",
    fontSize: 17,
    fontWeight: "bold",
  },
});

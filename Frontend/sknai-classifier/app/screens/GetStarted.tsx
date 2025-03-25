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

      {/* Overlay Box with Text */}
      <View style={styles.overlay}>
        <Text style={styles.title}>Your skin’s health, one scan away.</Text>
        <Text style={styles.subtitle}>
          Get instant skin insights with <Text style={styles.bold}>SKnAI</Text> — anytime, anywhere.{"\n"}
          <Text style={styles.bold}>Smart, simple,</Text> and always ready to help.
        </Text>

       
      </View>
      <TouchableOpacity style={styles.button} onPress={() => router.push("/screens/LoginScreen")}>
        <Text style={styles.buttonText}>Get Started</Text>
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
    width:"100%",
    height:"100%",
    margin:0,
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "125%",
    resizeMode: "cover",
    opacity:0.8
  },
  overlay: {
    backgroundColor: "#FFFFFFDA",
    padding: 30,
    borderRadius: 12,
    alignItems: "center",
    width: 357,
    height:204,
    marginBottom: 20,
    marginTop: 400
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#333",
  },
  bold: {
    fontWeight: "bold",
  },
  button: {
    
    backgroundColor: "#E9B08A",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: 351,
    height: 54,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,

  },
  buttonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
});

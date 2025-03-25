import { Stack } from "expo-router";
import React from "react";
import { ScrollView, Text, StyleSheet, SafeAreaView,TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome, AntDesign } from "@expo/vector-icons";


const TermsAndConditions = () => {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
         {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <FontAwesome name="arrow-left" size={20} color="black" />
      </TouchableOpacity>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Terms & Conditions</Text>

          <Text style={styles.bulletPoint}>
          By using SKnAI, you agree to the following terms: SKnAI is an AI-powered dermatology assistant designed to provide general 
            information about potential skin conditions based on user-submitted images.
          </Text>

          <Text style={styles.bulletPoint}>
            It is not a substitute for professional medical advice, diagnosis, or treatment. 
            Always consult a licensed healthcare provider for any medical concerns.
          </Text>

          <Text style={styles.bulletPoint}>
          Users must not upload offensive, illegal, or third-party content and must use 
          the app responsibly and ethically. Uploaded data, including images and questions, may be securely stored to improve 
            SKnAI's performance and is handled in accordance with our Privacy Policy.
          </Text>

          <Text style={styles.bulletPoint}>
             We do not share your data without consent. SKnAI and its creators are not liable 
            for any actions, harm, or decisions resulting from the use of the app. Continued use constitutes acceptance of any future updates to these terms.
          </Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push("/screens/HomeScreen")}
        >
          <Text style={styles.buttonText}>Log in</Text>
        </TouchableOpacity>

        </ScrollView>
{/* Login Button */}
        
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    paddingHorizontal: 25,
    paddingBottom: 100, // Space for button
    marginRight:10,
    marginLeft:5,
    textAlign:"center",
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    marginVertical: 30,
    textAlign: "center",
    fontFamily: "Merriweather_700Bold",
    marginTop:60
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    backgroundColor: "#E9B08A",
    padding: 5,
    borderRadius: 40,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    fontFamily: "Merriweather_400Regular",
    textAlign:"center",
  },
  bulletPoint: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    paddingLeft: 28,
    position: "relative",
    fontFamily: "Merriweather_400Regular",
  },
  
  button: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "#E9B08A",
    paddingVertical: 15,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "Merriweather_700Bold",
  },
});

export default TermsAndConditions;
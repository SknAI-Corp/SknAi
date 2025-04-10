// import React from "react";
// import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from "react-native";
// import { FontAwesome, AntDesign } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput } from "react-native";
// import * as WebBrowser from "expo-web-browser";
// import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
// import { auth, signInWithCredential } from "./firebaseConfig";
// import { GoogleAuthProvider } from "firebase/auth";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import axios from "axios";
import { API_BASE_URL } from "./config";

// WebBrowser.maybeCompleteAuthSession();
const SignupScreen =  () => {
  const router = useRouter(); // Expo Router Navigation

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/users/register`, {
        firstName,
        lastName,
        email,
        password,
      });

      if (response.data.success) {
        Alert.alert("Signup successful! Redirecting to login...");
        router.push("/screens/LoginScreen"); // Navigate to Signin page
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError("Signup failed. Try again.");
      console.error(err);
    }
  };


  //  const [request, response, promptAsync] = Google.useAuthRequest({
  //   clientId: "AIzaSyDmTC9x1MRqaQD7L8UiVmdvk3TMB9Dw7bI", // Replace with your Google Web Client ID
  // });

  // useEffect(() => {
  //   if (response?.type === "success") {
  //     const { idToken } = response.authentication;
  //     const credential = GoogleAuthProvider.credential(idToken);
  //     signInWithCredential(auth, credential)
  //       .then(() => {
  //         Alert.alert("Success", "Logged in with Google!");
  //         router.push("/screens/HomeScreen"); // Navigate to Home Screen
  //       })
  //       .catch((error) => {
  //         Alert.alert("Login Failed", error.message);
  //       });
  //   }
  // }, [response]);
  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <FontAwesome name="arrow-left" size={20} color="black" />
      </TouchableOpacity>

      {/* Signup Heading */}
      <Text style={styles.title}>Sign up</Text>

      {/* User Name */}
      

      {/* First Name */}
      <Text style={styles.label}>First name</Text>
      <View style={styles.inputContainer}>
        <FontAwesome name="user" size={18} color="#888" style={styles.icon} />
        <TextInput placeholder="First name" value={firstName}
        onChangeText={setFirstName} style={styles.input} />
      </View>

      {/* Last Name */}
      <Text style={styles.label}>Last name</Text>
      <View style={styles.inputContainer}>
        <FontAwesome name="user" size={18} color="#888" style={styles.icon} />
        <TextInput placeholder="Last name" value={lastName}
        onChangeText={setLastName} style={styles.input} />
      </View>

      {/* Email */}
      <Text style={styles.label}>Email</Text>
      <View style={styles.inputContainer}>
        <FontAwesome name="envelope" size={18} color="#888" style={styles.icon} />
        <TextInput placeholder="Enter email" value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address" style={styles.input}  />
      </View>

      {/* Password */}
      <Text style={styles.label}>Password</Text>
      <View style={styles.inputContainer}>
        <FontAwesome name="lock" size={18} color="#888" style={styles.icon} />
        <TextInput placeholder="Password" style={styles.input} value={password}
        onChangeText={setPassword}
        secureTextEntry />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Sign Up Button */}
      <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
        <Text style={styles.signupButtonText}>Sign up</Text>
      </TouchableOpacity>

      
      {/* OR Section */}
      <Text style={styles.orText}>OR</Text>

      {/* Google Sign-In */}
      <TouchableOpacity style={styles.googleButton} >
        <AntDesign name="google" size={20} color="black" style={styles.googleIcon} />
        <Text style={styles.googleButtonText}>Sign in with Google</Text>
      </TouchableOpacity>

      {/* Already have an account? */}
      <Text style={styles.footerText}>
        Already have an account?{" "}
        <Text style={styles.loginText} onPress={() => router.navigate("/screens/LoginScreen")}>
          Log in
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 25,
    paddingTop: 50,
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    backgroundColor: "#F4A261",
    padding: 10,
    borderRadius: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 45,
    fontSize: 14,
  },
  signupButton: {
    backgroundColor: "#F4A261",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  signupButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  orText: {
    textAlign: "center",
    fontSize: 14,
    marginVertical: 15,
    fontWeight: "bold",
    color: "#666",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 10,
    justifyContent: "center",
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  footerText: {
    textAlign: "center",
    fontSize: 14,
    marginTop: 15,
    color: "#666",
  },
  loginText: {
    color: "blue",
    fontWeight: "bold",
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
});

export default SignupScreen;


import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import axios from "axios";
import { API_BASE_URL } from "./config";
import AsyncStorage from "@react-native-async-storage/async-storage";

// WebBrowser.maybeCompleteAuthSession();
const ChangePasswordScreen =  () => {
  const router = useRouter(); // Expo Router Navigation

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New password and confirm password do not match.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("accessToken"); // or whatever key you're storing token with

      const response = await axios.post(
        `${API_BASE_URL}/api/v1/users/change-password`, // adjust endpoint if needed
        { oldPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert("Success", response.data?.message || "Password changed!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      router.push("/screens/HomeScreen")
    } catch (error) {
      console.error("Password change error:", error);
    //   Alert.alert("Error", error.response?.data?.message || "Something went wrong");
    }
  };


  
  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <FontAwesome name="arrow-left" size={20} color="black" />
      </TouchableOpacity>

      {/* Signup Heading */}
      <Text style={styles.title}>Change Password</Text>

      {/* User Name */}
      

      {/* First Name */}
      <Text style={styles.label}>Old Password</Text>
      <View style={styles.inputContainer}>
        <FontAwesome name="user" size={18} color="#888" style={styles.icon} />
        <TextInput
        secureTextEntry
        placeholder="Old Password"
        value={oldPassword}
        onChangeText={setOldPassword}
        style={styles.input}
      />
      </View>

      {/* Last Name */}
      <Text style={styles.label}>New Password</Text>
      <View style={styles.inputContainer}>
        <FontAwesome name="user" size={18} color="#888" style={styles.icon} />
        <TextInput
        secureTextEntry
        placeholder="New Password"
        value={newPassword}
        onChangeText={setNewPassword}
        style={styles.input}
      />
      </View>

      {/* Email */}
      <Text style={styles.label}>Confirm Password</Text>
      <View style={styles.inputContainer}>
        <FontAwesome name="envelope" size={18} color="#888" style={styles.icon} />
        <TextInput
        secureTextEntry
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={styles.input}
      />
      </View>

      {/* Sign Up Button */}
      <TouchableOpacity style={styles.signupButton} onPress={handleChangePassword}>
        <Text style={styles.signupButtonText}>Update Password</Text>
      </TouchableOpacity>
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

export default ChangePasswordScreen;

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from "expo-router";
import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { API_BASE_URL } from "./config";
import uuid from 'react-native-uuid';
import 'react-native-get-random-values';
import * as CryptoJS from 'crypto-js';
import objectId from 'bson-objectid';

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setEmailError(!email);
      setPasswordError(!password);
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    setLoading(true);
    setEmailError(false);
    setPasswordError(false);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/users/login`, { email, password }, { withCredentials: true });

      const { accessToken, refreshToken, user } = response.data.data;
      
      // Store tokens securely
      await AsyncStorage.setItem("accessToken", accessToken);
      await AsyncStorage.setItem("refreshToken", refreshToken);
      await AsyncStorage.setItem("userInfo", JSON.stringify(user));
      
      Alert.alert("Success", "Login successful!");
      console.log("User Info:", user);

      // Navigate to HomeScreen with user data
      router.push({ pathname: "/screens/HomeScreen", params: { firstName: user.firstName, accessToken } });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
          console.error("Axios Error:", err.response?.data);
          Alert.alert("Error", err.response?.data?.message || "Login failed");
      } else {
          console.error("Unexpected Error:", err);
          Alert.alert("Error", "Something went wrong. Please try again.");
      }
  } finally {
      setLoading(false);
  }
  };
// doctor login
const handleDoctorLogin = async () => {
  if (!email || !password) {
    setEmailError(!email);
    setPasswordError(!password);
    Alert.alert("Error", "Please enter email and password");
    return;
  }

  setLoading(true);
  setEmailError(false);
  setPasswordError(false);

  try {
    const response = await axios.post(`${API_BASE_URL}/api/v1/doctor/login`, { email, password }, { withCredentials: true });

    const { accessToken, doctor } = response.data.data;
    
    // Store tokens securely
    await AsyncStorage.setItem("accessToken", accessToken);
    // await AsyncStorage.setItem("userInfo", JSON.stringify(user));
    
    Alert.alert("Success", "Login successful!");
    console.log("User Info:", doctor);
    
    router.push({ pathname: "/screens/DoctorScreen", params: { Name: doctor.name, accessToken } });
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
        console.error("Axios Error:", err.response?.data);
        Alert.alert("Error", err.response?.data?.message || "Login failed");
    } else {
        console.error("Unexpected Error:", err);
        Alert.alert("Error", "Something went wrong. Please try again.");
    }
} finally {
    setLoading(false);
}
};
  // Base64 encoding helper
  function base64UrlEncode(str: string) {
    return Buffer.from(str)
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }

const generateGuestToken = () => {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const payload = {
    userId: 'guest',
    email: 'guest@sknai.ai',
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiry
  };

  const secret = 'My-name-is-sknai-and-this-is-my-secret-token'; // 🔐 shared secret with backend

  const headerEncoded = base64UrlEncode(JSON.stringify(header));
  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));

  const signature = CryptoJS.HmacSHA256(`${headerEncoded}.${payloadEncoded}`, secret).toString(
    CryptoJS.enc.Base64
  )
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${headerEncoded}.${payloadEncoded}.${signature}`;
};

const handleContinueAsGuest = () => {
  const guestToken = generateGuestToken();
  const sessionId = objectId().toHexString();
console.log(guestToken);
console.log(sessionId);
  router.push({
    pathname: '/screens/Guest',
    params: {
      guest: 'true',
      guestToken,
      sessionId,
    },
  });
};

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        <Text style={styles.title}>Log in</Text>
        
        {/* Form Container */}
        <View style={styles.formContainer}>
          {/* Username Input */}
          <Text style={styles.label}>User name</Text>
          <View style={[styles.inputContainer , emailError && styles.errorBorder]}>
          
            <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput 
              placeholder="User name"
              placeholderTextColor="#666"
              style={styles.input}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError(false);
              }}
              autoCapitalize="none"
            />
          </View>

          {/* Password Input */}
          <Text style={styles.label}>Password</Text>
          <View style={[styles.inputContainer , passwordError && styles.errorBorder]}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput 
              placeholder="Password"
              placeholderTextColor="#666"
              secureTextEntry
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError(false);
              }}
              style={styles.input}
            />
          </View>

          {/* Forgot Password */}
          <TouchableOpacity 
            onPress={() => router.push("/screens/ForgotPassword")}
            style={styles.forgotPasswordContainer}
          >
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity 
          style={styles.button}
          onPress={handleLogin} disabled={loading}
        >
           {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
        </TouchableOpacity>

        {/* Guest Button */}
        <TouchableOpacity 
          style={styles.button1}
          onPress={handleContinueAsGuest}
        >
          <Text style={styles.buttonText1}>Continue as Guest</Text>
        </TouchableOpacity>
        {/* Guest Button */}
        <TouchableOpacity 
          style={styles.button2}
          onPress={handleDoctorLogin}
        >
          <Text style={styles.buttonText1}>Login As a Doctor</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don’t have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/screens/SignUpScreen")}>
            <Text style={styles.signUpText}>Sign Up </Text>
          </TouchableOpacity>
          
        </View>
          
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    paddingTop:0,
    paddingBottom:0,
    marginTop:0,
    marginBottom:0,
  },
  title: {
    top:10,
    fontSize: 40,
    fontWeight: "bold",
    marginVertical: 40,
    textAlign: "center",
    fontFamily: 'Merriweather_700Bold',
  },
  label: {
    fontSize: 16,
    color: "#666",
    marginBottom: 15,
    fontWeight:"bold",
  },
  formContainer: {
    width: 300,
    height:252,
    left:30,
    top:30,
    marginBottom: 90,
  },
  
  inputContainer: {
    width: 300,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 10,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    
    height: '100%',
    fontSize: 16,
    fontFamily: 'Merriweather_400Regular',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  forgotPassword: {
    color: "#007bff",
    fontSize: 16,
    fontFamily: 'Merriweather_400Regular',
  },
  backButton: {
    position: "absolute",
    top: 30,
    left: 20,
    padding: 5,
    zIndex: 1,
    backgroundColor: "#E9B08A",
    borderRadius: 25,
  },
  button: {
    
    backgroundColor: "#E9B08A",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 15,
    width: 300,
    height: 54,
    alignItems: "center",
    marginTop:0,
    left:32,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    // padding: 25, 125, 25, 125,


  },
  errorBorder: {
    borderColor: "red",

  },
  buttonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
  button1: {
    
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 15,
    width: 300,
    height: 54,
    alignItems: "center",
    marginTop:40,
    left:32,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor:'black',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,

  },
  buttonText1: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
  button2: {
    
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 15,
    width: 300,
    height: 54,
    alignItems: "center",
    marginTop:30,
    left:32,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor:'black',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,

  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 'auto',
    paddingVertical: 40,
    marginBottom:50
  },
  footerText: {
    fontSize: 16,
    color: "#666",
    fontFamily: 'Merriweather_400Regular',
    
  },
  
  signUpText: {
    fontSize: 16,
    color: "#007bff",
    fontWeight: "500",
    fontFamily: 'Merriweather_700Bold',
  },
});

export default LoginScreen;

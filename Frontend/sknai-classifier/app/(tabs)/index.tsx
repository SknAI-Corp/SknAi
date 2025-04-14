import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from 'buffer';
import {jwtDecode } from "jwt-decode";
const IndexScreen = () => {
  const router = useRouter();
  if (typeof global.Buffer === 'undefined') {
    global.Buffer = Buffer;
  }
  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("accessToken");
  
      if (token) {
        try {
          const decoded: any = jwtDecode (token);
          const currentTime = Date.now() / 1000; // in seconds
  
          if (decoded.exp && decoded.exp < currentTime) {
            // Token expired
            await AsyncStorage.clear();
            router.replace("/screens/GetStarted");
          } else {
            // Token is valid
            router.replace("/screens/HomeScreen");
          }
        } catch (error) {
          // Invalid token format
          await AsyncStorage.clear();
          router.replace("/screens/GetStarted");
        }
      } else {
        await AsyncStorage.clear();
        router.replace("/screens/GetStarted");
      }
    };
  
    checkAuth();
  }, []);

  
  // useEffect(() => {
  //   const clearStorage = async () => {
  //     const token = await AsyncStorage.getItem("accessToken");
  //     try {
  //       await AsyncStorage.clear();
  //       console.log('AsyncStorage cleared!');
  //       if(!token){
  //         router.replace("/screens/GetStarted");
  //       }
        
  //     } catch (e) {
  //       console.error('Error clearing AsyncStorage:', e);
  //     }
  //   };

  //   clearStorage();
  // }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.splashText}>SKNAI</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  splashText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
  },
});

export default IndexScreen;

import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
const IndexScreen = () => {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("accessToken");
      if (token) {
        router.replace("/screens/HomeScreen"); // Redirect to Home if logged in
      } else {
        setTimeout(() => {
          router.replace("/screens/GetStarted"); // Otherwise, show GetStarted
        }, 5000);
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

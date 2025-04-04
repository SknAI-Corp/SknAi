import React from "react";
import { View, Text, Switch, Image, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Avatar } from "react-native-paper";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { API_BASE_URL } from "./config";
const SettingScreen = () => {
  const [faceIdEnabled, setFaceIdEnabled] = React.useState(true);
  const [silentNotifications, setSilentNotifications] = React.useState(false);
    const router = useRouter();
  const handleLogout = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken'); 
      if (!accessToken) {
        throw new Error('Access token is missing');
      }
      // Make a request to the backend to clear cookies and logout user
      await axios.post(`${API_BASE_URL}/api/v1/users/logout`, {}, {
        withCredentials: true, // Ensure cookies are sent with the request
        headers: {
          'Authorization': `Bearer ${accessToken}`, // Pass the valid token
        }
      });

      // Clear user token from AsyncStorage
      await AsyncStorage.removeItem('accessToken');
      
      // Optionally, you can show an alert for confirmation before navigating
      Alert.alert('Success', 'You have been logged out', [
        { text: 'OK', onPress: () => router.push('/screens/LoginScreen') }
      ]);
    } catch (error) {
      console.error('Logout failed', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
       <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="black" />
              </TouchableOpacity>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Avatar.Image 
          source={{ uri: "https://randomuser.me/api/portraits/men/75.jpg" }} 
          size={80} 
        />
        <Text style={styles.userName}>Steve</Text>
      </View>

      {/* Settings Options */}
      <View style={styles.optionContainer}>
        {/* My Account */}
        <TouchableOpacity style={styles.option}>
          <View style={styles.optionRow}>
            <Ionicons name="person-outline" size={24} color="black" />
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>My Account</Text>
              <Text style={styles.optionSubtitle}>Changes to your account details</Text>
            </View>
          </View>
          <Feather name="edit" size={20} color="black" />
        </TouchableOpacity>

        {/* Face ID / Touch ID */}
        <View style={styles.option}>
          <View style={styles.optionRow}>
            <MaterialIcons name="fingerprint" size={24} color="black" />
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Face ID / Touch ID</Text>
              <Text style={styles.optionSubtitle}>Manage your device security</Text>
            </View>
          </View>
          <Switch 
            value={faceIdEnabled} 
            onValueChange={() => setFaceIdEnabled(!faceIdEnabled)} 
          />
        </View>

        {/* Silent Notifications */}
        <View style={styles.option}>
          <View style={styles.optionRow}>
            <Ionicons name="notifications-off-outline" size={24} color="black" />
            <Text style={styles.optionTitle}>Silent Notifications</Text>
          </View>
          <Switch 
            value={silentNotifications} 
            onValueChange={() => setSilentNotifications(!silentNotifications)} 
          />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.option} onPress={handleLogout}>
          <View style={styles.optionRow}>
            <MaterialIcons name="logout" size={24} color="black" />
            <Text style={styles.optionTitle}>Logout</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <Text style={styles.footerText}>SknAI {"\n"} Created with Love</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    alignItems: "center",
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
  },
  optionContainer: {
    width: "100%",
  },
  option: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 15,
    marginVertical: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionTextContainer: {
    marginLeft: 10,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  optionSubtitle: {
    fontSize: 12,
    color: "gray",
  },
  footerText: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 12,
    color: "gray",
  },
  backButton: {
    position: "absolute",
    left: 10,
    backgroundColor: "#E9B08A",
    padding: 10,
    // marginRight: 20,
    borderRadius: 20,
  },
});

export default SettingScreen;

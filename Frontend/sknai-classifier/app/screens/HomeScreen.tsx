import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
} from "react-native";
import { useRouter, useLocalSearchParams  } from "expo-router";
import axios from "axios";

import { API_BASE_URL } from "./config";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HomeScreen = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-250)).current; // Initial position off-screen
  const router = useRouter();
  //  const [firstName, setFirstName] = useState("");

  const [firstName, setFirstName] = useState("");
  const [token, setToken] = useState<string | null>(null);

  
useEffect(() => {
  const fetchUserData = async () => {
    try {
      const accessToken = await AsyncStorage.getItem("accessToken");
      const userInfo = await AsyncStorage.getItem("userInfo");

      if (accessToken && userInfo) {
        setToken(accessToken); // Store accessToken in state
        const user = JSON.parse(userInfo); // Convert string back to object
        setFirstName(user.firstName); // Set firstName from stored user info
      }
    } catch (error) {
      console.error("Error retrieving user data:", error);
    }
  };

  fetchUserData();
}, []);

  const toggleMenu = () => {
    Animated.timing(slideAnim, {
      toValue: menuOpen ? -250 : 0, // Slide in or out
      duration: 300,
      useNativeDriver: false,
    }).start();

    setMenuOpen(!menuOpen);
  };

  // useEffect(() => {
    
    
  //   const fetchUserProfile = async () => {
  //     try {
  //       const token = await AsyncStorage.getItem('userToken');
  //       setToken(token);
  //       if (!token) {
  //         console.log("No token found, skipping API call");
  //         return; 
  //       }
  //       const response = await apiClient.get('/user', {
  //         headers: {
  //           Authorization: `Bearer ${token}`, // Send token in Authorization header
  //         }
  //       });
  //       console.log(response.data);
  //       setFirstName(response.data.firstName);
  //     } catch (error) {
  //       console.error('Error fetching profile:', error);
  //     }
  //   };
  //   fetchUserProfile();
  
  // }, [])
  

  return (
    <View style={styles.container}>
      {/* Overlay when menu is open */}
      {menuOpen && <TouchableOpacity style={styles.overlay} onPress={toggleMenu} />}

      {/* Sidebar Menu */}
      <Animated.View style={[styles.sidebar, { left: slideAnim }]}>
        <Image source={require("../../assets/images/user.png")} style={styles.profileImage} />
        <Text style={styles.userName}>{firstName || "Guest"}</Text>

        <TouchableOpacity style={styles.menuItem}>
          
        <Text style={styles.menuText}><Image source={require("../../assets/images/home.png")}></Image>Home</Text>
          
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
        <Text style={styles.menuText}><Image source={require("../../assets/images/profile.png")}></Image> Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
        <Text style={styles.menuText}><Image source={require("../../assets/images/Notifications.png")}></Image> Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
        <Text style={styles.menuText}><Image source={require("../../assets/images/Chat History.png")}></Image> Chat History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
        <Text style={styles.menuText}><Image source={require("../../assets/images/Doctor.png")}></Image> Doctor's Report</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
        <Text style={styles.menuText}><Image source={require("../../assets/images/Settings.png")}></Image> Settings</Text>
        </TouchableOpacity>

        {token &&(

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/screens/Logout")}>
          <Text style={styles.menuText}><Image source={require("../../assets/images/signout.png")}></Image>Sign out</Text>
        </TouchableOpacity>
        )}

      </Animated.View>

      {/* Menu Button */}
      <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
        <Text style={styles.menuIcon}>☰</Text>
      </TouchableOpacity>

      {/* Greeting */}
      <Text style={styles.greeting}>
        <Text style={styles.greetingHighlight}>Good Morning,</Text> {firstName || "Guest"}!
      </Text>

      {/* "Did You Know?" Section */}
      <Image source={require("../../assets/images/lightbulb.jpeg")} style={styles.lightbulb} />

      {/* Fact Boxes */}
      <View style={styles.factBox}>
        <Text style={styles.factText}>
          Hormones like cortisol can cause breakouts, rashes, or dullness.
        </Text>
      </View>
      <View style={styles.factBox}>
        <Text style={styles.factText}>
          Trillions of good bacteria live on your skin, helping to protect and heal it.
        </Text>
      </View>

      {/* "Let's Talk" Button */}
      <TouchableOpacity style={styles.talkButton} onPress={() => router.navigate("/screens/ChatScreen")}>
        <Text style={styles.talkButtonText}>Let’s Talk</Text>
      </TouchableOpacity>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.bottomButton}>
          <Text style={styles.bottomButtonText}>Reports</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>2</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomButton}>
          <Text style={styles.bottomButtonText}>FAQs</Text>
        </TouchableOpacity>
      </View>

      {/* Disclaimer */}
      <Text style={styles.disclaimer}>
        SknAI can make mistakes. Check important info.
      </Text>
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
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1,
  },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom:20,
    width: 250,
    height: 760,
    backgroundColor: "#E9B08A",
    paddingTop: 20,
    paddingRight: 50,
    zIndex: 6,
    textAlign:"center",
    alignItems:"center"
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  menuItem: {
    paddingVertical: 25,
  },
  menuText: {
    fontSize: 16,
    
    color: "#000",
  },
  menuButton: {
    position: "absolute",
    top: 20,
    left: 25,
    zIndex: 3,
  },
  menuIcon: {
    fontSize: 40,
  },
  greeting: {
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 40,
    alignItems: "flex-start",
    display: "flex",
    marginRight: 120,
  },
  greetingHighlight: {
    color: "#E29578",
  },
  lightbulb: {
    width: 123,
    height: 123,
    marginTop: 10,
  },
  factBox: {
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 10,
    width: 280,
    height: 75,
    marginTop: 10,
  },
  factText: {
    fontSize: 14,
    textAlign: "center",
  },
  talkButton: {
    backgroundColor: "#E9B08A",
    padding: 20,
    borderRadius: 19,
    marginTop: 20,
    width: 261,
    height: 67,
    alignItems: "center",
  },
  talkButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  bottomButtons: {
    flexDirection: "row",
    marginTop: 20,
  },
  bottomButton: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 10,
    alignItems: "center",
    flexDirection: "row",
    width: 125,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bottomButtonText: {
    fontSize: 14,
    alignItems: "center",
  },
  badge: {
    backgroundColor: "#E29578",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  disclaimer: {
    fontSize: 10,
    color: "gray",
    marginTop: 20,
  },
});

export default HomeScreen;

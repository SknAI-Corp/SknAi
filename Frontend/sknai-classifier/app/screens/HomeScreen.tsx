import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  ScrollView,
  ActivityIndicator,
  Alert, 
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
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  
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
  const fetchSessions = async () => {
    try {
      const accessToken = await AsyncStorage.getItem("accessToken");
      const response = await axios.get(`${API_BASE_URL}/api/v1/session/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setSessions(response.data.data); // Assuming `data` contains sessions array
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchSessions();

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
  

  return (
    <View style={styles.container}>
      {/* Overlay when menu is open */}
      {menuOpen && <TouchableOpacity style={styles.overlay} onPress={toggleMenu} />}

      {/* Sidebar Menu */}
      <Animated.View style={[styles.sidebar, { left: slideAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>SknAI</Text>
        </View>
        <TouchableOpacity style={styles.menuItem}>
          
         <Text style={styles.menuText}><Image source={require("../../assets/images/home.png")}></Image>Home</Text>
          
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          
         <Text style={styles.menuText}><Image source={require("../../assets/images/Doctor.png")}></Image>Doctor's Report</Text>
          
        </TouchableOpacity>
        <Text style={styles.title}>Chat History</Text>
  <ScrollView style={styles.menuContainer}>
  {loading ? (
          <ActivityIndicator size="large" color="#000" />
        ) : sessions.length > 0 ? (
          sessions?.map((session, index) => (
            <TouchableOpacity key={session?._id || index} style={styles.chatItem} >
              <Text style={styles.chatText}>{session?.title || "Unnamed Session"}</Text>
            </TouchableOpacity>
          ))
          
        ) : (
          <Text style={styles.noSessionsText}>No sessions found</Text>
        )}
  </ScrollView>

  {/* User Profile Footer */}
  <TouchableOpacity onPress={()=> router.push("/screens/SettingScreen")}>
    <View style={styles.footer}>
      <Image source={require("../../assets/images/user.png")} style={styles.profileImage} />
      <Text style={styles.userName}>{firstName || "Guest"}</Text>
    </View>
  </TouchableOpacity>
  {/* {token && (
    <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/screens/Logout")}>
      <Image source={require("../../assets/images/signout.png")} style={styles.menuIcon} />
      <Text style={styles.menuText}>Sign out</Text>
    </TouchableOpacity>
  )} */}
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
  header: {
    alignItems: "center",
    paddingVertical: 15,
    backgroundColor: "#E9B08A",
    // borderBottomWidth: 1,
    // borderBottomColor: "#ccc",
  },
  headerText: {
    fontSize: 35,
    fontWeight: "bold",
    color: "#333",
    alignItems:"center",
    marginLeft:50
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
  chatItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: "#D9D9D9",
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop:50
  },
  chatText: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
  },
  noSessionsText: {
    textAlign: "center",
    padding: 20,
    fontSize: 16,
    color: "gray",
  },
  // sidebar: {
  //   position: "absolute",
  //   top: 0,
  //   left: 0,
  //   bottom:20,
  //   width: 250,
  //   height: 760,
  //   backgroundColor: "#E9B08A",
  //   paddingTop: 20,
  //   paddingRight: 50,
  //   zIndex: 6,
  //   textAlign:"center",
  //   alignItems:"center"
  // },
  // profileImage: {
  //   width: 80,
  //   height: 80,
  //   borderRadius: 40,
  //   marginBottom: 10,
  // },
  // userName: {
  //   fontSize: 18,
  //   fontWeight: "bold",
  //   marginBottom: 20,
  // },
  // menuItem: {
  //   paddingVertical: 25,
  // },
  // menuText: {
  //   fontSize: 16,
    
  //   color: "#000",
  // },
  // menuButton: {
  //   position: "absolute",
  //   top: 20,
  //   left: 25,
  //   zIndex: 3,
  // },
  // menuIcon: {
  //   fontSize: 40,
  // },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 250,
    backgroundColor: "#E9B08A",
    paddingTop: 20,
    paddingHorizontal: 15,
    zIndex: 6,
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  menuContainer: {
    flex: 1,
    width: "100%",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    width: "100%",
    borderRadius: 8,
  },
  menuIcon: {
    fontSize:40,
    marginRight: 10,
  },
  menuText: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderColor: "#D9D9D9",
  },
  menuButton: {
      position: "absolute",
      top: 20,
      left: 25,
      zIndex: 3,
    },
  profileImage: {
    width: 40,

    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
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

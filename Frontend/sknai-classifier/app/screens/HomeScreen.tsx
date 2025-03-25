import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";

const HomeScreen = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-250)).current; // Initial position off-screen
  const router = useRouter();

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
        <Image
          source={{ uri: "https://via.placeholder.com/80" }}
          style={styles.profileImage}
        />
        <Text style={styles.userName}>Steve</Text>

        <TouchableOpacity style={styles.menuItem}>
          
          <Image source={require("../../assets/images/home.png")}></Image>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>👤 Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>🔔 Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>🗂 Chat History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>📑 Doctor’s Report</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>⚙️ Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>🚪 Sign out</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Menu Button */}
      <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
        <Text style={styles.menuIcon}>☰</Text>
      </TouchableOpacity>

      {/* Greeting */}
      <Text style={styles.greeting}>
        <Text style={styles.greetingHighlight}>Good Morning,</Text> Steve
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
    width: 250,
    height: "100%",
    backgroundColor: "#E9B08A",
    paddingTop: 60,
    paddingLeft: 20,
    zIndex: 2,
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

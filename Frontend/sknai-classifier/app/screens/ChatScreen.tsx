import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, Entypo } from "@expo/vector-icons";

export default function ChatScreen() {
  const router = useRouter();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current; // Initial position (off-screen)

  // Function to open chat
  const openChat = () => {
    Animated.timing(slideAnim, {
      toValue: 0, // Slide into view
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsChatOpen(true);
  };

  // Function to close chat
  const closeChat = () => {
    Animated.timing(slideAnim, {
      toValue: 300, // Slide out of view
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsChatOpen(false));
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Chat History</Text>
      </View>

      

      {/* Show "New Chat" button only if chat is closed */}
      {!isChatOpen && (
        <TouchableOpacity style={styles.newChatButton} onPress={openChat}>
          <Text style={styles.newChatText}>New Chat</Text>
          <Ionicons name="add" size={20} color="black" />
        </TouchableOpacity>
      )}

       {/* Chat Input Box */}
       <Animated.View style={[styles.chatBox, { transform: [{ translateY: slideAnim }] }]}>
        {/* Attachment Button */}
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="add" size={24} color="black" />
        </TouchableOpacity>

        {/* Text Input */}
        <TextInput style={styles.input} placeholder="Type a message...." placeholderTextColor="#555" />

        {/* Voice Input */}
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="mic-outline" size={24} color="black" />
        </TouchableOpacity>
      </Animated.View>
      {isChatOpen && (
        <TouchableOpacity style={styles.sendButton}>
          <Ionicons name="send" size={35} color="black" />
        </TouchableOpacity>
      )}

      {/* Disclaimer */}
      <Text style={styles.disclaimer}>SknAI can make mistakes. Check important info.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    left: 0,
    backgroundColor: "#E9B08A",
    padding: 10,
    borderRadius: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  emptyContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
  },
  subText: {
    fontSize: 14,
    color: "#888",
    marginTop: 5,
  },
  newChatButton: {
    position: "absolute",
    bottom: 50,
    right: 20,
    flexDirection: "row",
    backgroundColor: "#E9B08A",
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  newChatText: {
    fontSize: 16,
    marginRight: 5,
    fontWeight: "bold",
  },
  chatBox: {
    position: "absolute",
    bottom: 50,
    left:40,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E9B08A",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    width: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  input: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 16,
    color: "black",
  },
  iconButton: {
    padding: 5,
  },
  sendButton: {
    position: "absolute",
    bottom: 50,
    right: 10,
    
    padding: 12,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  disclaimer: {
    fontSize: 10,
    color: "gray",
    position: "absolute",
    bottom: 10,
    textAlign: "center",
  },
});


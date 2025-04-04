import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, TextInput, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://172.20.10.3:8000"; // Update this as needed

type Message = {
  sender: "user" | "ai";
  content: string;
};

export default function ChatScreen() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [typingMessage, setTypingMessage] = useState("");
  const slideAnim = useRef(new Animated.Value(300)).current;

  const handleSendMessage = async () => {
    if (!message) return;
    setLoading(true);
    const accessToken = await AsyncStorage.getItem("accessToken");
  
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/messages/`,
        { sessionId, content: message },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
  
      const { userMessage, aiMessage } = response.data.data;
  
      // Append user message immediately
      const userMsgObj = { sender: "user", content: userMessage.content } as Message;
      setChatMessages((prev) => [...prev, userMsgObj]);
      setMessage("");
  
      // Start typing animation
      let aiContent = "";
      setTypingMessage("");
  
      for (let i = 0; i < aiMessage.content.length; i++) {
        setTimeout(() => {
          aiContent += aiMessage.content[i];
          setTypingMessage(aiContent);
        }, i * 50);
      }
  
      // After animation complete, add AI message
      setTimeout(() => {
        const aiMsgObj = { sender: "ai", content: aiMessage.content } as Message;
        setChatMessages((prev) => [...prev, aiMsgObj]);
        setTypingMessage("");
      }, aiMessage.content.length * 50 + 100);
  
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };
  const openChat = async () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsChatOpen(true);
    const accessToken = await AsyncStorage.getItem("accessToken");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/session/`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setSessionId(response.data.data._id);
    } catch (error) {
      console.error("Error creating new session", error);
    }
  };

  const closeChat = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsChatOpen(false));
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === "user" ? styles.userMessageContainer : styles.aiMessageContainer,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          item.sender === "user" ? styles.userMessage : styles.aiMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.content}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.newChatButton} onPress={openChat}>
        <Text style={styles.newChatText}>New Chat</Text>
        <Ionicons name="add" size={20} color="black" />
      </TouchableOpacity>

      {isChatOpen && (
        <>
          <FlatList
              data={chatMessages}
              renderItem={renderMessage}
              keyExtractor={(_, index) => index.toString()}
              contentContainerStyle={{ paddingBottom: 10 }}
            />

{typingMessage.length > 0 && (
  <View style={styles.aiMessageContainer}>
    <View style={styles.aiMessage}>
      <Text style={styles.messageText}>{typingMessage}</Text>
    </View>
  </View>
)}

          <View style={styles.chatBox}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              value={message}
              onChangeText={setMessage}
              placeholderTextColor="#555"
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage} disabled={loading}>
              <Ionicons name="send" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  newChatButton: {
    backgroundColor: "#E9B08A",
    padding: 15,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  newChatText: {
    fontSize: 16,
    marginRight: 5,
  },
  chatBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#E9B08A",
  },
  input: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 16,
  },
  sendButton: {
    padding: 10,
  },
  messageContainer: {
    marginVertical: 5,
    maxWidth: "70%",
  },
  userMessageContainer: {
    alignSelf: "flex-end",
  },
  aiMessageContainer: {
    alignSelf: "flex-start",
  },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
  },
  userMessage: {
    backgroundColor: "#E9B08A",
  },
  aiMessage: {
    backgroundColor: "#d3d3d3",
  },
  messageText: {
    color: "#000",
  },
});

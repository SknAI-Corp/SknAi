import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  TextInput,
  FlatList,
  Modal,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { Camera } from "expo-camera";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from 'react-native-uuid';

const API_BASE_URL = "http://172.20.10.3:8000"; // Update this as needed
const id = uuid.v4().toString();

type Message = {
  id?: string;
  sender: "user" | "ai";
  content: string;
  imageAttached: string | null;
  temp?: boolean;
};

export default function ChatScreen() {
  // const { SessionId } = useLocalSearchParams();
  const router = useRouter();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [permission, setPermission] = useState<boolean | null>(null);
  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [typingMessage, setTypingMessage] = useState("");
  const slideAnim = useRef(new Animated.Value(300)).current;
  const [selectedImage, setSelectedImage] = useState<null | {
    uri: string;
    name: string;
    type: string;
  }>(null);

  const flatListRef = useRef<FlatList<Message>>(null); // Ref for FlatList
  const typingScrollRef = useRef<ScrollView>(null);
  const [thinking, setThinking] = useState(false);
  const [showThinkingDots, setShowThinkingDots] = useState(true);

  const handleSendMessage = async () => {
    if (!message && !selectedImage) return;

    setLoading(true);

    const accessToken = await AsyncStorage.getItem("accessToken");

    try {
      // new code
      const formData = new FormData();
      formData.append("sessionId", sessionId);
      if (message) formData.append("content", message);
      if (selectedImage) {
        formData.append("imageAttached", {
          uri: selectedImage.uri,
          name: selectedImage.name,
          type: selectedImage.type,
        } as any); // 'any' to fix TS error
      }
      // till here
      console.log(formData);

      const response = await axios.post(
        `${API_BASE_URL}/api/v1/messages/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const { userMessage, aiMessage } = response.data.data;
      
      // Append user message immediately
      const userMsgObj = {
        sender: "user",
        content: userMessage.content,
        imageAttached: userMessage.imageAttached || null,
      } as Message;
      setChatMessages((prev) => [...prev, userMsgObj]);
      setMessage("");
      setSelectedImage(null);

      const thinkingMsgObj: Message = {
        id: Date.now().toString(),
        sender: "ai",
        content: "thinking...", // placeholder
        imageAttached: null,
        temp: true, // custom flag to identify temporary message
      };

      setChatMessages((prev) => [...prev, thinkingMsgObj]);

// Start blinking dots
setThinking(true);
const blinkInterval = setInterval(() => {
  setShowThinkingDots((prev) => !prev);
}, 500);

// Remove "thinking..." temporary message
setChatMessages((prev) => prev.filter((msg) => !msg.temp));

// Stop blinking
clearInterval(blinkInterval);
setThinking(false);

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
        const aiMsgObj = {
          sender: "ai",
          content: aiMessage.content,
        } as Message;
        setChatMessages((prev) => [...prev, aiMsgObj]);
        setTypingMessage("");
        
      }, aiMessage.content.length * 50 + 100);

      
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typingScrollRef.current) {
      typingScrollRef.current.scrollToEnd({ animated: true });
    }
  }, [typingMessage]);

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
      console.log(response.data.data._id);
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

  const renderMessage = ({ item, index }: { item: Message; index:number }) => {
    const isLast = index === chatMessages.length - 1;
    const showImage = item.sender === "user" && item.imageAttached;
    const isMostRecentUserMessage =
      item.sender === "user" && item.content === message;

    return (
      <View
        style={[
          styles.messageContainer,
          item.sender === "user"
            ? styles.userMessageContainer
            : styles.aiMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            // User message background
      item.sender === "user" && { backgroundColor: "#E9B08A" },

      // AI message: no background if image attached
      item.sender === "ai" &&
        (item.imageAttached
          ? { backgroundColor: "transparent" }
          : styles.aiMessage),
    ]}
        >
          {/* Render Text if exists */}
          {item.content ? (
            <Text style={styles.messageText}>{item.content}</Text>
          ) : null}

          {/* Render Image if exists */}
          {item.imageAttached ? (
            <Image
              source={{ uri: item.imageAttached }}
              style={styles.imagePreview} // Define style for image size
              resizeMode="cover"
            />
          ) : null}

          {/* Show "Thinking..." only for the last AI message and while thinking */}
          {item.sender === 'ai' && item.content === 'thinking...' && thinking ? (
  <Text style={{ color: '#555', fontStyle: 'italic' }}>
    {showThinkingDots ? 'Thinking...' : ''}
  </Text>
) : (
  <Text style={styles.messageText}>{item.content}</Text>
)}
        </View>
      </View>
    );
  };
  // Request camera permission
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setPermission(status === "granted");
    })();
  }, []);

  if (permission === null) return <Text>Requesting camera permissions...</Text>;
  if (permission === false) return <Text>No access to camera</Text>;

  // Function to pick image from gallery
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const pickedAsset = result.assets[0];
      const localUri = pickedAsset.uri;
      const fileName = localUri.split("/").pop() || `photo.jpg`;
      const fileType = pickedAsset.type
        ? `${pickedAsset.type}/jpeg`
        : "image/jpeg";
      setModalVisible(false);
      setSelectedImage({
        uri: localUri,
        name: fileName,
        type: fileType,
      });
    }
  };
  // Function to take a photo
  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setModalVisible(false);
    }
  };
  const handleCancelImage = () => {
    setSelectedImage(null); // Reset selected image
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>NewChat</Text>
        </View>

        {!isChatOpen && (
          <TouchableOpacity style={styles.newChatButton} onPress={openChat}>
            <Text style={styles.newChatText}>New Chat</Text>
            <Ionicons name="add" size={20} color="black" />
          </TouchableOpacity>
        )}

        {isChatOpen && (
          <>
            <FlatList
              ref={flatListRef}
              data={chatMessages}
              renderItem={renderMessage}
              keyExtractor={(_, index) => index.toString()}
              contentContainerStyle={{ paddingBottom: 10, marginTop: 80 }}
            />

            {typingMessage.length > 0 && (
              <View style={[styles.messageContainer, styles.aiMessageContainer]}>
                <View style={[styles.messageBubble, styles.aiMessage]}>
                  <ScrollView
                  ref={typingScrollRef}
                    style={[styles.typingScrollView, {
                      maxHeight: Math.min(50 + typingMessage.length * 0.8, 300), // Cap at 300
                    },]}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                  >
                    <Text style={styles.messageText}>
                      {typingMessage}
                    </Text>
                  </ScrollView>
                </View>
              </View>
            )}

            <View style={styles.chatBox}>
              {/* Icon Button to open modal */}
              <TouchableOpacity style={styles.iconButton} onPress={openModal}>
                <Ionicons name="add" size={24} color="black" />
              </TouchableOpacity>

              {/* Image and TextInput Container */}
              <View style={styles.inputWrapper}>
                {/* Display selected image */}
                {selectedImage && (
                  <View style={styles.imageContainer}>
                    <TouchableOpacity
                      onPress={handleCancelImage}
                      style={styles.cancelButton}
                    >
                      <Ionicons name="close-circle" size={24} color="red" />
                    </TouchableOpacity>
                    <Image
                      source={{ uri: selectedImage.uri }}
                      style={styles.selectedImage}
                    />
                  </View>
                )}

                <TextInput
                  style={styles.input}
                  placeholder="Type a message..."
                  value={message}
                  onChangeText={setMessage}
                  placeholderTextColor="#555"
                />
              </View>

              {/* Send Button */}
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendMessage}
                disabled={loading}
              >
                <Ionicons name="send" size={24} color="black" />
              </TouchableOpacity>
            </View>
          </>
        )}
        {/* Disclaimer */}
        {/* <Text style={styles.disclaimer}>SknAI can make mistakes. Check important info.</Text> */}
        {/* Modal for Image Upload / Scan Photo */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Choose an Option</Text>
              <TouchableOpacity style={styles.modalButton} onPress={pickImage}>
                <Text style={styles.modalText}>Upload Image</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton}>
                <Text style={styles.modalText}>Scan Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeModalButton}
                onPress={closeModal}
              >
                <Text style={styles.modalText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 10,
    flex: 1,
    height: 40,
  },
  imageContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  cancelButton: {
    marginRight: 5,
  },
  selectedImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 10,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingVertical: 20,
    paddingHorizontal: 20,
    zIndex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  backButton: {
    position: "absolute",
    left: 10,
    backgroundColor: "#E9B08A",
    padding: 10,
    borderRadius: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
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
    maxWidth: "100%",
  },
  userMessageContainer: {
    alignSelf: "flex-end",
  },
  aiMessageContainer: {
    alignSelf: "flex-start",
    width: "100%",
  },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
  },
  userMessage: {
    backgroundColor: "#E9B08A",
    marginTop: 10,
    padding:5,
    borderRadius: 10,
  },
  aiMessage: {
    // backgroundColor: "#d3d3d3",
    marginTop: 10,
  },
  messageText: {
    color: "#000",
  },
  disclaimer: {
    fontSize: 10,
    color: "gray",
    position: "absolute",
    bottom: 10,
    textAlign: "center",
  },
  iconButton: {
    padding: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalButton: {
    backgroundColor: "#E9B08A",
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    width: "100%",
    alignItems: "center",
  },
  modalText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  closeModalButton: {
    marginTop: 10,
  },
  imagePreview: {
    width: 120,
    height: 120,
    marginTop: 10,
    borderRadius: 10,
  },
  typingScrollView: {
    maxHeight: 150, // Or any height limit you prefer
  },
});

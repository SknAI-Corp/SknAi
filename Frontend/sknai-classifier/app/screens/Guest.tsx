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
  Keyboard,
  Button,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { Camera } from "expo-camera";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "./config";
import Markdown from 'react-native-markdown-display';
import uuid from 'react-native-uuid';

type Message = {
  id?: string;
  sender: "user" | "ai";
  content: string;
  imageAttached: string | null;
  temp?: boolean;
};

export default function Guest() {
    const { guest, guestToken, sessionId: sessionIdParam  } = useLocalSearchParams();
    const isGuest = guest === 'true';
const router = useRouter();

const [sessionId, setSessionId] = useState<string | null>(
    typeof sessionIdParam === 'string' ? sessionIdParam : null
  );

const [guestMessageCount, setGuestMessageCount] = useState(0);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<null | {
    uri: string;
    name: string;
    type: string;
  }>(null);

  const [typingMessage, setTypingMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  const [permission, setPermission] = useState<boolean | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const flatListRef = useRef<FlatList<Message>>(null);
  const slideAnim = useRef(new Animated.Value(300)).current;

  const handleSendMessage = async () => {
    Keyboard.dismiss();
  
    const hasText = message.trim().length > 0;
    const hasImage = !!selectedImage;
  
    if (!hasText && !hasImage) {
      Alert.alert('Warning', 'Please enter a message or select an image.');
      return;
    }
  
    const finalMessage = hasText ? message.trim() : 'What is this?';
  
    const isGuest = guest === 'true';
    // const guestToken = isGuest ? `guest-${uuid.v4()}` : await AsyncStorage.getItem("accessToken");
//   console.log(guestToken);
    const userMsgObj: Message = {
        sender: 'user', // TypeScript now understands it's one of the allowed types
        content: finalMessage,
        imageAttached: selectedImage?.uri || null,
      };
    setChatMessages((prev) => [...prev, userMsgObj]);
    setMessage('');
    setSelectedImage(null);
    setLoading(true);
  
    setChatMessages((prev) => [...prev, {
      id: Date.now().toString(),
      sender: 'ai',
      content: 'thinking...',
      imageAttached: null,
      temp: true,
    }]);
  
    try {
      const formData = new FormData();
  
      if (typeof sessionId === 'string') {
        formData.append('sessionId', sessionId);
      }
  
      formData.append('content', finalMessage);
  
      if (hasImage && selectedImage?.uri) {
        const localUri = selectedImage.uri;
        const filename = selectedImage.name || localUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = selectedImage.type || (match ? `image/${match[1]}` : `image`);
      
        formData.append('imageAttached', {
          uri: localUri,
          name: filename,
          type,
        } as any); // 👈 Use `as any` because React Native doesn't have a native Blob/File
      }
  console.log(formData);
      const response = await axios.post(`${API_BASE_URL}/api/v1/messages/`, formData, {
        headers: {
          Authorization: `Bearer ${guestToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });
  console.log(response.data.data);
      const { sessionId: returnedSessionId, aiMessage } = response.data.data;
  
      if (!sessionId && returnedSessionId) setSessionId(returnedSessionId);
  
      setChatMessages((prev) => prev.filter((msg) => !msg.temp));
  
      let aiContent = '';
      setTypingMessage('');
  
      for (let i = 0; i < aiMessage.content.length; i++) {
        setTimeout(() => {
          aiContent += aiMessage.content[i];
          setTypingMessage(aiContent);
        }, i * 30);
      }
  
      setTimeout(() => {
        setChatMessages((prev) => [...prev, {
          sender: 'ai',
          content: aiMessage.content,
          imageAttached: null,
        }]);
        setTypingMessage('');
      }, aiMessage.content.length * 30 + 200);
  
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Something went wrong while sending your message.');
    } finally {
      setLoading(false);
    }
  };
  
  
 
  const handleCancelImage = () => {
    setSelectedImage(null); // Reset selected image
  };
  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);
  const setImageUri = () => {};
  // const handleCancelImage = () => setSelectedImage(null);

  const openChat = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setIsChatOpen(true);
  };

  const renderMessage = ({ item }: { item: Message }) => (
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
          item.sender === "user"
            ? { backgroundColor: "#E9B08A" }
            : styles.aiMessage,
        ]}
      >
        {item.content && <Markdown style={markdownStyles}>{item.content}</Markdown>}
        {item.imageAttached && (
          <Image
            source={{ uri: item.imageAttached }}
            style={styles.imagePreview}
            resizeMode="cover"
          />
        )}
      </View>
    </View>
  );

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
  
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={10}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>
            { "New Chat"}
          </Text>
          
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
              <View
                style={[styles.messageContainer, styles.aiMessageContainer]}
              >
                <View style={[styles.messageBubble, styles.aiMessage]}>
                  <Text style={styles.messageText}>{typingMessage}</Text>
                </View>
              </View>
            )}

            <View style={styles.chatBox}>
              <TouchableOpacity style={styles.iconButton} onPress={openModal}>
                <Ionicons name="add" size={24} color="black" />
              </TouchableOpacity>
              <View style={styles.inputWrapper}>
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
        {/* Footer */}
     <Text style={styles.footerText}>SknAI can make mistakes.Check important info</Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
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
  newChatText: { fontSize: 16, marginRight: 5 },
  chatBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#E9B08A",
    marginBottom: 0,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 10,
    flex: 1,
    height: 40,
  },
  input: { flex: 1, marginHorizontal: 10, fontSize: 16 },
  sendButton: { padding: 10 },
  messageContainer: { marginVertical: 5, maxWidth: "100%" },
  userMessageContainer: { alignSelf: "flex-end" },
  aiMessageContainer: { alignSelf: "flex-start", width: "100%" },
  messageBubble: { padding: 10, borderRadius: 10 },
  userMessage: { backgroundColor: "#E9B08A" },
  aiMessage: { backgroundColor: "white" },
  messageText: { color: "#000" },
  imageContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  cancelButton: { marginRight: 5 },
  selectedImage: { width: 50, height: 50, borderRadius: 10, marginRight: 10 },
  imagePreview: { width: 120, height: 120, marginTop: 10, borderRadius: 10 },
  iconButton: { padding: 5 },
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
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  modalButton: {
    backgroundColor: "#E9B08A",
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    width: "100%",
    alignItems: "center",
  },
  modalText: { fontSize: 16, fontWeight: "bold" },
  closeModalButton: { marginTop: 10 },
  doctorIcon: {
    position: "absolute",
    right: 16,
    top: 12, // adjust as needed to align with title
  },
  footerText: {
    marginTop: 5,
    textAlign: "center",
    fontSize: 10,
    color: "black",
    paddingBottom:0
  },
  
});

export const markdownStyles: any = {
  body: {
    color: "#000",
    fontSize: 16,
  },
  heading1: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#333",
  },
  heading2: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 8,
    color: "#444",
  },
  paragraph: {
    marginVertical: 6,
    lineHeight: 22,
    color: "#000",
  },
  list_item: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 4,
  },
  bullet_list_icon: {
    marginRight: 10,
    fontSize: 10,
    lineHeight: 20,
  },
  strong: {
    fontWeight: "bold",
  },
  em: {
    fontStyle: "italic",
  },
  link: {
    color: "#E9B08A",
    textDecorationLine: "underline",
  },
  code_inline: {
    backgroundColor: "#f4f4f4",
    padding: 4,
    borderRadius: 4,
    fontFamily: "Courier",
    fontSize: 14,
    color: "#555",
  },
};


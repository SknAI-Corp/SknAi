import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, TextInput, Alert, Modal } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, Entypo } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import axios from 'axios';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { API_BASE_URL } from "./config";
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function ChatScreen() {
  const router = useRouter();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current; // Initial position (off-screen)
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState<boolean | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [token, setToken] = useState<string | null>(null);

  // Function to open chat
  const openChat = async() => {
    Animated.timing(slideAnim, {
      toValue: 0, // Slide into view
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsChatOpen(true);
    const accessToken = await AsyncStorage.getItem("accessToken");
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/session/`, // Replace with your actual backend URL
        {}, // No need to send the title from the frontend
        { headers: { Authorization: `Bearer ${accessToken}` } } // Add your authentication token if necessary
      );
      setSessionData(response.data.data); // Assuming the response contains session data
      alert(response.data.message); // Show success message
    } catch (error) {
      console.error('Error creating new session', error);
      alert('Failed to create new session');
    }
  };

  // Function to close chat
  const closeChat = () => {
    Animated.timing(slideAnim, {
      toValue: 300, // Slide out of view
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsChatOpen(false));
  };

  const [messages, setMessages] = useState([]);

    // Request camera permission
    useEffect(() => {
      (async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setPermission(status === 'granted');
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
  
      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
        setModalVisible(false);
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
  
    // Upload Image to Cloudinary
    const uploadImage = async () => {
      if (!selectedImage) return;

      setUploading(true);
      let formData = new FormData();
      const file = new File([selectedImage], "upload.jpg", { type: "image/jpeg" });
      formData.append("image", file);

      try {
          const response = await axios.post("http://172.20.10.3:8000/upload", formData, {
              headers: { "Content-Type": "multipart/form-data" },
          });

          Alert.alert("Success", "Image uploaded successfully!");
          console.log("Image URL:", response.data.imageUrl);
          setSelectedImage(null);
      } catch (error) {
          console.error("Upload Error:", error);
          Alert.alert("Error", "Upload failed!");
      } finally {
          setUploading(false);
      }
  };
    
  
    // Function to remove the selected image
    const removeImage = () => {
      setImageUri(null);
    };


  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Chat</Text>
      </View>

      {/* New Chat Button */}
      {!isChatOpen && (
        <TouchableOpacity style={styles.newChatButton} onPress={openChat}>
          <Text style={styles.newChatText}>New Chat</Text>
          <Ionicons name="add" size={20} color="black" />
        </TouchableOpacity>
      )}

      {/* Chat Input Box */}
      {isChatOpen && (
        <View style={styles.chatBox}>
          <TouchableOpacity style={styles.iconButton} onPress={openModal}>
            <Ionicons name="add" size={24} color="black" />
          </TouchableOpacity>
          <TextInput style={styles.input} placeholder="Type a message..." placeholderTextColor="#555" />
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="mic-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>
      )}
      
      {isChatOpen && (
        <TouchableOpacity style={styles.sendButton} onPress={uploadImage} disabled={uploading}>
          <Ionicons name="send" size={35} color="black" />
        </TouchableOpacity>
      )}

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
            <TouchableOpacity style={styles.closeModalButton} onPress={closeModal}>
              <Text style={styles.modalText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    left: 40,
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
});


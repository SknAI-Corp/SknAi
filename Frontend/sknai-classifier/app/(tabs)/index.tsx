// import React, { useState, useEffect } from 'react';
// import { 
//   View, Text, Image, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, Modal,TextInput
// } from 'react-native';
// import * as ImagePicker from 'expo-image-picker';
// import { Camera } from 'expo-camera';
// import axios from 'axios';
// import { MaterialIcons, Feather } from '@expo/vector-icons';


// const API_BASE_URL = "http://10.0.0.90:8080"; // Replace with actual FastAPI URL

// export default function HomeScreen() {
//   const [imageUri, setImageUri] = useState<string | null>(null);
//   const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
//   const [prediction, setPrediction] = useState<string | null>(null);
//   const [confidence, setConfidence] = useState<number | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [permission, setPermission] = useState<boolean | null>(null);
//   const [modalVisible, setModalVisible] = useState(false);

//   const [messages, setMessages] = useState([]);

//   // Request camera permission
//   useEffect(() => {
//     (async () => {
//       const { status } = await Camera.requestCameraPermissionsAsync();
//       setPermission(status === 'granted');
//     })();
//   }, []);

//   if (permission === null) return <Text>Requesting camera permissions...</Text>;
//   if (permission === false) return <Text>No access to camera</Text>;

//   // Function to pick image from gallery
//   const pickImage = async () => {
//     let result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [4, 3],
//       quality: 1,
//     });

//     if (!result.canceled) {
//       setImageUri(result.assets[0].uri);
//       setModalVisible(false);
//     }
//   };

//   // Function to take a photo
//   const takePhoto = async () => {
//     let result = await ImagePicker.launchCameraAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [4, 3],
//       quality: 1,
//     });

//     if (!result.canceled) {
//       setImageUri(result.assets[0].uri);
//       setModalVisible(false);
//     }
//   };

//   // Function to upload image and predict
//   const uploadImage = async () => {
//     if (!imageUri) {
//       Alert.alert("No image selected");
//       return;
//     }

//     let formData = new FormData();
//     formData.append('file', {
//       uri: imageUri,
//       name: 'upload.jpg',
//       type: 'image/jpeg',
//     } as any);

//     try {
//       setLoading(true);
//       const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });

//       if (response.data.file_name) {
//         setUploadedFileName(response.data.file_name);
//         predictDisease(response.data.file_name);
//       } else {
//         throw new Error("Upload failed");
//       }
//     } catch (error) {
//       console.error("Upload Error:", error);
//       Alert.alert("Upload Failed", "Something went wrong!");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Function to get prediction
//   const predictDisease = async (fileName: string) => {
//     try {
//       setLoading(true);
//       const response = await axios.post(`${API_BASE_URL}/predict`, new URLSearchParams({ file_name: fileName }).toString(), {
//         headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//       });

//       setPrediction(response.data.prediction);
//       setConfidence(response.data.confidence);
//     } catch (error) {
//       console.error("Prediction Error:", error);
//       Alert.alert("Prediction Failed", "Something went wrong!");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Function to remove the selected image
//   const removeImage = () => {
//     setImageUri(null);
//   };

//   return (
//     <View style={styles.container}>
//       {/* Floating + Button for Image Selection */}
//       <TouchableOpacity 
//         style={styles.fab} 
//         onPress={() => setModalVisible(true)}
//       >
//         <Feather name="plus" size={30} color="white" />
//       </TouchableOpacity>

//       {/* Modal for Image Options */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={modalVisible}
//         onRequestClose={() => setModalVisible(false)}
//       >
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <TouchableOpacity style={styles.option} onPress={pickImage}>
//               <MaterialIcons name="photo-library" size={24} color="black" />
//               <Text>Choose from Gallery</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.option} onPress={takePhoto}>
//               <MaterialIcons name="photo-camera" size={24} color="black" />
//               <Text>Take a Photo</Text>
//             </TouchableOpacity>
//             <TouchableOpacity onPress={() => setModalVisible(false)}>
//               <Text style={{ color: "red", marginTop: 10 }}>Cancel</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       {/* Uploaded Image & Prediction */}
//       {imageUri && (
//         <View style={styles.chatBubble}>
//           <Image source={{ uri: imageUri }} style={styles.image} />
//           <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
//             <Text style={styles.removeImageText}>x</Text>
//           </TouchableOpacity>
//           {loading ? (
//             <ActivityIndicator size="large" color="blue" />
//           ) : (
//             prediction && (
//               <Text style={styles.predictionText}>
//                 prediction: {prediction} 
//               </Text>
//             )
//           )}
//         </View>
//       )}

//       <View style={styles.inputContainer}>
//   <TextInput 
//     style={styles.textInput} 
//     placeholder="Type a message..." 
    
//   />
//   <TouchableOpacity style={styles.sendButton} onPress={uploadImage}>
//     {/* <Text style={styles.sendButtonText}>Send</Text> */}
//     <Feather name="arrow-right" size={20} color="white" />
//   </TouchableOpacity>
// </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 25,
//     paddingHorizontal: 15,
//     marginHorizontal: 10,
//     marginBottom: 10,
//     backgroundColor: 'white',
//   },
//   textInput: {
//     flex: 1,
//     height: 50,
//     fontSize: 16,
//   },
//   container: {
//     flex: 1,
//     padding: 30,
//     justifyContent: 'flex-end',
//     alignItems: 'center',
//     backgroundColor: '#f8f8f8',
//     bottom:60
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
//   },
//   modalContent: {
//     width: 300,
//     padding: 20,
//     backgroundColor: 'white',
//     borderRadius: 10,
//     alignItems: 'center',
//   },
//   option: {
//     width: '100%',
//     padding: 10,
//     marginVertical: 5,
//     backgroundColor: '#007bff',
//     borderRadius: 5,
//     alignItems: 'center',
//   },
//   fab: {
//     position: 'absolute',
//     bottom: 105,
//     right: 20,
//     backgroundColor: '#007bff',
//     padding: 15,
//     borderRadius: 50,
//     alignItems: 'center',
//     justifyContent: 'center',
//     elevation: 5,
//   },
//   chatBubble: {
//     backgroundColor: "#d1ecf1",
//     padding: 10,
//     borderRadius: 10,
//     maxWidth: "80%",
//     alignSelf: "flex-end",
//     marginBottom: 80,
//   },
//   image: {
//     width: 150,
//     height: 150,
//     borderRadius: 10,
//   },
//   predictionText: {
//     marginTop: 5,
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#333",
//   },
//   sendButton: {
//     backgroundColor: '#007bff',
//     padding: 15,
//     borderRadius: 50,
//     width: '20%',
//     alignItems: 'center',
//     marginBottom: 5,
//     marginRight:-15
//   },
//   disabledButton: {
//     backgroundColor: '#ccc',
//   },
//   sendButtonText: {
//     color: 'white',
//     fontSize: 18,
//   },
//   removeImageButton: {
//     position: 'absolute',
//     top: 5,
//     right: 5,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',  // Slight background for the button
//     borderRadius: 15,
//     padding: 5,
//     width: 25,
//     height: 25,
//     justifyContent: 'center',
//     alignItems: 'center',
//     opacity:15
//   },
//   removeImageText: {
//     color: 'white',
//     fontSize: 25,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     lineHeight: 20,
//   },
// });


// // // new

// // // import React, { useState } from "react";
// // // import {
// // //   View,
// // //   TextInput,
// // //   TouchableOpacity,
// // //   Image,
// // //   Text,
// // //   Alert,
// // //   StyleSheet,
// // //   ActivityIndicator,
// // // } from "react-native";
// // // import * as ImagePicker from "expo-image-picker";
// // // import { AntDesign, Ionicons } from "@expo/vector-icons";
// // // import axios from "axios";

// // // const API_BASE_URL = "http://172.20.10.3:8000"; // Replace with your actual FastAPI server URL

// // // export default function HomeScreen() {
// // //   const [imageUri, setImageUri] = useState<string | null>(null);
// // //   const [prediction, setPrediction] = useState<string | null>(null);
// // //   const [loading, setLoading] = useState(false);
// // //   const [sendActive, setSendActive] = useState(false);


// // //   // Select Image from Camera or Gallery
// // //   const selectImage = async () => {
// // //     Alert.alert("Select Image", "Choose an option", [
// // //       {
// // //         text: "Camera",
// // //         onPress: async () => pickImage("camera"),
// // //       },
// // //       {
// // //         text: "Gallery",
// // //         onPress: async () => pickImage("gallery"),
// // //       },
// // //       { text: "Cancel", style: "cancel" },
// // //     ]);
// // //   };

// // //   const pickImage = async (source: "gallery" | "camera") => {
// // //     let result;
// // //     if (source === "gallery") {
// // //       result = await ImagePicker.launchImageLibraryAsync({
// // //         mediaTypes: ImagePicker.MediaTypeOptions.Images,
// // //         allowsEditing: true,
// // //         aspect: [4, 3],
// // //         quality: 1,
// // //       });
// // //     } else {
// // //       result = await ImagePicker.launchCameraAsync({
// // //         mediaTypes: ImagePicker.MediaTypeOptions.Images,
// // //         allowsEditing: true,
// // //         aspect: [4, 3],
// // //         quality: 1,
// // //       });
// // //     }

// // //     if (!result.canceled) {
// // //       setImageUri(result.assets[0].uri);
// // //       setSendActive(true); // Enable send button
// // //     }
// // //   };

// // //   // Upload & Predict
// // //   const handleSend = async () => {
// // //     if (!imageUri) return;

// // //     let formData = new FormData();
// // //     formData.append("file", {
// // //       uri: imageUri,
// // //       name: "upload.jpg",
// // //       type: "image/jpeg",
// // //     } as any);

// // //     try {
// // //       setLoading(true);
// // //       const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
// // //         headers: { "Content-Type": "multipart/form-data" },
// // //       });

// // //       if (response.data.file_name) {
// // //         predictDisease(response.data.file_name);
// // //       } else {
// // //         throw new Error("Upload failed");
// // //       }
// // //     } catch (error) {
// // //       console.error("Upload Error:", error);
// // //       Alert.alert("Upload Failed", "Something went wrong!");
// // //     } finally {
// // //       setLoading(false);
// // //       setSendActive(false); // Disable send button after sending
// // //     }
// // //   };

// // //   // Get Prediction
// // //   const predictDisease = async (fileName: string) => {
// // //     try {
// // //       setLoading(true);
// // //       const response = await axios.post(
// // //         `${API_BASE_URL}/predict`,
// // //         new URLSearchParams({ file_name: fileName }).toString(),
// // //         { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
// // //       );

// // //       setPrediction(response.data.prediction);
// // //     } catch (error) {
// // //       console.error("Prediction Error:", error);
// // //       Alert.alert("Prediction Failed", "Something went wrong!");
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   return (
// // //     <View style={styles.container}>
// // //       {/* Display uploaded image & prediction */}
// // //       {imageUri && (
// // //         <View style={styles.resultContainer}>
// // //           <Image source={{ uri: imageUri }} style={styles.image} />
// // //           {loading ? (
// // //             <ActivityIndicator size="small" color="blue" />
// // //           ) : (
// // //             <Text style={styles.predictionText}>
// // //               {prediction ? `Prediction: ${prediction}` : "Awaiting result..."}
// // //             </Text>
// // //           )}
// // //         </View>
// // //       )}

// // //       {/* ChatGPT-style input box */}
// // //       <View style={styles.chatBox}>
// // //         {/* "+" Button to Pick Image */}
// // //         <TouchableOpacity onPress={selectImage} style={styles.iconButton}>
// // //           <AntDesign name="plus" size={24} color="gray" />
// // //         </TouchableOpacity>

// // //         {/* Fake Input Field (Just Placeholder Text) */}
// // //         <TextInput
// // //           style={styles.input}
// // //           placeholder={imageUri ? "Ready to send image..." : "Upload an image..."}
// // //           editable={false}
// // //         />

// // //         {/* Send Button */}
// // //         <TouchableOpacity
// // //           style={[styles.sendButton, { opacity: sendActive ? 1 : 0.5 }]}
// // //           disabled={!sendActive}
// // //           onPress={handleSend}
// // //         >
// // //           <Ionicons name="send" size={24} color="white" />
// // //         </TouchableOpacity>
// // //       </View>
// // //     </View>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   container: {
// // //     flex: 1,
// // //     justifyContent: "flex-end",
// // //     padding: 20,
// // //     backgroundColor: "#f5f5f5",
// // //   },
// // //   resultContainer: {
// // //     alignItems: "flex-end",
// // //     marginBottom: 10,
// // //   },
// // //   image: {
// // //     width: 80,
// // //     height: 80,
// // //     borderRadius: 10,
// // //   },
// // //   predictionText: {
// // //     fontSize: 14,
// // //     marginTop: 5,
// // //     textAlign: "center",
// // //     backgroundColor: "#fff",
// // //     padding: 8,
// // //     borderRadius: 5,
// // //     shadowColor: "#000",
// // //     shadowOffset: { width: 0, height: 2 },
// // //     shadowOpacity: 0.1,
// // //     shadowRadius: 3,
// // //     elevation: 3,
// // //   },
// // //   chatBox: {
// // //     flexDirection: "row",
// // //     alignItems: "center",
// // //     backgroundColor: "#fff",
// // //     borderRadius: 25,
// // //     paddingHorizontal: 10,
// // //     paddingVertical: 8,
// // //     shadowColor: "#000",
// // //     shadowOffset: { width: 0, height: 2 },
// // //     shadowOpacity: 0.1,
// // //     shadowRadius: 3,
// // //     elevation: 3,
// // //   },
// // //   iconButton: {
// // //     padding: 8,
// // //   },
// // //   input: {
// // //     flex: 1,
// // //     fontSize: 16,
// // //     color: "#333",
// // //     paddingLeft: 10,
// // //   },
// // //   sendButton: {
// // //     backgroundColor: "#007bff",
// // //     borderRadius: 20,
// // //     padding: 10,
// // //   },
// // // });

import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

const IndexScreen = () => {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      router.replace("/screens/GetStarted"); // Navigate after 5 seconds
    }, 5000);
  }, []);

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

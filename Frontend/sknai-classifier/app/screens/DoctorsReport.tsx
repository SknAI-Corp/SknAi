import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE_URL } from "./config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const DoctorsReport = () => {
  const { pdf, id } = useLocalSearchParams();
  const router = useRouter();
  const [note, setNote] = useState("");
  const handleRemarks = async() => {
    try {
      const token = await AsyncStorage.getItem("accessToken"); 
      
      const response = await axios.patch(
        `${API_BASE_URL}/api/v1/doctor/reports/${id}/review`, // Replace `reportId` with the actual ID
        {
          doctorRemarks: note,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            
          },
        }
      );
  
      alert("Remarks submitted successfully!");
      console.log("Response:", response.data);
    } catch (error) {
      console.error("Error submitting remarks:", error);
      alert("Failed to submit remarks.");
    }
  };

  if (!pdf) {
    return (
      <Text style={{ textAlign: "center", marginTop: 100 }}>
        No PDF available.
      </Text>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.pdfBox}>
          <WebView
            originWhitelist={["*"]}
            source={{ uri: pdf as string }}
            style={styles.webview}
          />
        </View>

        <Text style={styles.label}>Doctor's Notes:</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Write your notes here..."
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={6}
        />
        <TouchableOpacity style={styles.remarksButton} onPress={handleRemarks}>
    <Text style={styles.remarksButtonText}>Submit Remarks</Text>
  </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContainer: {
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 16,
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
  pdfBox: {
    height: Dimensions.get("window").height * 0.6,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 20,
  },
  webview: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  textArea: {
    height: 120,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    textAlignVertical: "top", // makes text start from top-left like textarea
    backgroundColor: "#f5f5f5",
    fontSize: 16,
  },
  remarksButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    width:"40%",
    marginTop:5

  },
  
  remarksButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default DoctorsReport;

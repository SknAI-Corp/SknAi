import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Text, StyleSheet, Dimensions,TouchableOpacity } from "react-native";
import {useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "./config";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";

const UserReports = () => {
  const { id } = useLocalSearchParams();
   const router = useRouter();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        const accessToken = await AsyncStorage.getItem("accessToken");

        // Make sure the id is passed as a parameter in the request
        const response = await axios.get(`${API_BASE_URL}/api/v1/reports/`, {
          params: { id }, // Passing id to the request
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        // Log the response to inspect the structure
      console.log("Response:", response.data);

      const report = response.data.data[0];
      console.log(report);
        
            console.log("PDF URL:", report.reportPdfUrl);
            setPdfUrl(report.reportPdfUrl); // Set the PDF URL
       
      } catch (err) {
        console.error("Error fetching PDF:", err);
        setError("Failed to load PDF.");
      } finally {
        setLoading(false);
      }
    };

    fetchPdf();
  }, [id]);

  // Show loading indicator if data is still being fetched
  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 100 }} />;

  // Show error message if there's any issue fetching the PDF
  if (error) return <Text style={{ textAlign: "center", color: "red", marginTop: 100 }}>{error}</Text>;

  // Show message if no PDF URL is available
  if (!pdfUrl) return <Text style={{ textAlign: "center", marginTop: 100 }}>No PDF available.</Text>;

  return (
    <View style={styles.container}>
        <View style={styles.header}>
        <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        
        ><Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        </View>
      <WebView
        source={{ uri: pdfUrl }}
        style={{ width: Dimensions.get("window").width, height: Dimensions.get("window").height }}
      />
    
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
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
});

export default UserReports;

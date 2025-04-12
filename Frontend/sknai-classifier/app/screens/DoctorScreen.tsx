import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { API_BASE_URL } from "./config";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Report = {
  id: string;
  case: string;
  date: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  reportPdfUrl: string;
};

const DoctorScreen: React.FC = () => {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const accessToken = await AsyncStorage.getItem("accessToken");

        console.log(accessToken);
        const response2 = await axios.get(
          `${API_BASE_URL}/api/v1/doctor/reports`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        const data = await response2.data.data;

        // Map to UI format
        const mappedReports = data.map((report: any) => {
          const status = report.status || "pending"; // default fallback
          const isPending = status === "pending";

          return {
            id: report._id || report.id,
            case: report.userQuery || "Unknown",
            date: new Date(
              report.submittedAt || report.createdAt
            ).toDateString(),
            icon: isPending ? "assignment-late" : "check-circle", // or "done", "check"
            iconColor: isPending ? "#FFD700" : "#34c759", // yellow for pending, green for done
            reportPdfUrl: report.reportPdfUrl,
            status: status,
          };
        });

        setReports(mappedReports);
      } catch (err: any) {
        setError("Failed to load reports.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleLogout = async () => {
    try {
      const accessToken = await AsyncStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("Access token is missing");
      }
      // Make a request to the backend to clear cookies and logout user
      await axios.post(
        `${API_BASE_URL}/api/v1/doctor/logout`,
        {},
        {
          withCredentials: true, // Ensure cookies are sent with the request
          headers: {
            Authorization: `Bearer ${accessToken}`, // Pass the valid token
          },
        }
      );

      // Clear user token from AsyncStorage
      await AsyncStorage.removeItem("accessToken");

      // Optionally, you can show an alert for confirmation before navigating
      Alert.alert("Success", "You have been logged out", [
        { text: "OK", onPress: () => router.push("/screens/LoginScreen") },
      ]);
    } catch (error) {
      console.error("Logout failed", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };
  const renderItem = ({ item }: { item: Report }) => (
    <TouchableOpacity
      onPress={() =>
        router.push(
          `/screens/DoctorsReport?pdf=${item.reportPdfUrl}&id=${item.id}`
        )
      }
    >
      <View style={styles.card}>
        <View>
          <Text style={styles.caseId}># {item.id}</Text>
          <Text style={styles.caseTitle}>Case: {item.case}</Text>
          <Text style={styles.caseDate}>Report Date: {item.date}</Text>
        </View>
        <MaterialIcons name={item.icon} size={32} color={item.iconColor} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Doctor’s Screen</Text>
        <TouchableOpacity onPress={handleLogout}>
          <MaterialCommunityIcons name="exit-run" size={28} color="red" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#000"
          style={{ marginTop: 100 }}
        />
      ) : error ? (
        <Text style={{ textAlign: "center", marginTop: 100, color: "red" }}>
          {error}
        </Text>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 20 }}
        />
      )}

      <Text style={styles.footer}>
        SknAI can make mistakes. Check important info.
      </Text>
    </SafeAreaView>
  );
};

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
  card: {
    marginTop: 5,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  caseId: {
    fontWeight: "500",
    color: "#555",
  },
  caseTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 5,
  },
  caseDate: {
    fontSize: 14,
    color: "#777",
    marginTop: 2,
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: "#999",
    marginTop: "auto",
    marginBottom: 0,
  },
});

export default DoctorScreen;

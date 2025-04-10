import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from "expo-router";

type Report = {
  id: string;
  case: string;
  date: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
};

const reports: Report[] = [
  {
    id: '2196744',
    case: 'Eczema on legs',
    date: 'Jan 20, 2025',
    icon: 'assignment-late',
    iconColor: '#f5a623',
  },
  {
    id: '2196547',
    case: 'Acne on Face',
    date: 'Jan 10, 2025',
    icon: 'assignment-late',
    iconColor: '#34c759',
  },
  {
    id: '2196388',
    case: 'Psoriasis on arms',
    date: 'Dec 18, 2024',
    icon: 'assignment-late',
    iconColor: '#f5a623',
  },
  {
    id: '2196299',
    case: 'Rash on back',
    date: 'Nov 5, 2024',
    icon: 'assignment-late',
    iconColor: '#34c759',
  },
];

const DoctorReportScreen: React.FC = () => {
    const router = useRouter();
  const renderItem = ({ item }: { item: Report }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.caseId}># {item.id}</Text>
        <Text style={styles.caseTitle}>Case : {item.case}</Text>
        <Text style={styles.caseDate}>Report Date: {item.date}</Text>
      </View>
      <MaterialIcons name={item.icon} size={32} color={item.iconColor} />
    </View>
  );

  return (
    <SafeAreaView  style={styles.container}>
        <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="black"  />
      </TouchableOpacity>

      <Text style={styles.title}>Doctor’s Report</Text>
      </View>
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 20 }}
      />

      <Text style={styles.footer}>
        SknAI can make mistakes. Check important info.
      </Text>
    </SafeAreaView>
  );
};

export default DoctorReportScreen;

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
    marginTop:5,
    backgroundColor: '#fff',
  borderRadius: 16,
  padding: 20,
  marginVertical: 12,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',

  // iOS shadow
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.1,
  shadowRadius: 10,
  },
  caseId: {
    fontWeight: '500',
    color: '#555',
  },
  caseTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 5,
  },
  caseDate: {
    fontSize: 14,
    color: '#777',
    marginTop: 2,
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    marginTop: 'auto',
    marginBottom: 0,
  },
});

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE_URL } from "./config";

const DoctorsReview = () => {
  const router = useRouter();
   const { id, reportPdfUrl } = useLocalSearchParams();
   console.log(id);
   console.log(reportPdfUrl);
   
   useEffect(() => {
    const fetchPdf = async () => {
      try {
        const accessToken = await AsyncStorage.getItem("accessToken");

        
      } catch (err) {
        console.error("Error fetching PDF:", err);
        
      } finally {
        
      }
    };

    fetchPdf();
  }, [id]);
  return (
    <View>
      <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    paddingTop:0,
    paddingBottom:0,
    marginTop:0,
    marginBottom:0,
  },
  title: {
    top:10,
    fontSize: 40,
    fontWeight: "bold",
    marginVertical: 40,
    textAlign: "center",
    fontFamily: 'Merriweather_700Bold',
  },
  label: {
    fontSize: 16,
    color: "#666",
    marginBottom: 15,
    fontWeight:"bold",
  },
  formContainer: {
    width: 300,
    height:252,
    left:30,
    top:30,
    marginBottom: 90,
  },
  
  inputContainer: {
    width: 300,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 10,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    
    height: '100%',
    fontSize: 16,
    fontFamily: 'Merriweather_400Regular',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  forgotPassword: {
    color: "#007bff",
    fontSize: 16,
    fontFamily: 'Merriweather_400Regular',
  },
  backButton: {
    position: "absolute",
    top: 30,
    left: 20,
    padding: 5,
    zIndex: 1,
    backgroundColor: "#E9B08A",
    borderRadius: 25,
  },
  button: {
    
    backgroundColor: "#E9B08A",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 15,
    width: 300,
    height: 54,
    alignItems: "center",
    marginTop:0,
    left:32,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    // padding: 25, 125, 25, 125,


  },
  errorBorder: {
    borderColor: "red",

  },
  buttonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
  button1: {
    
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 15,
    width: 300,
    height: 54,
    alignItems: "center",
    marginTop:40,
    left:32,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor:'black',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,

  },
  buttonText1: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
  button2: {
    
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 15,
    width: 300,
    height: 54,
    alignItems: "center",
    marginTop:30,
    left:32,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor:'black',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,

  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 'auto',
    paddingVertical: 40,
    marginBottom:50
  },
  footerText: {
    fontSize: 16,
    color: "#666",
    fontFamily: 'Merriweather_400Regular',
    
  },
  
  signUpText: {
    fontSize: 16,
    color: "#007bff",
    fontWeight: "500",
    fontFamily: 'Merriweather_700Bold',
  },
});
export default DoctorsReview
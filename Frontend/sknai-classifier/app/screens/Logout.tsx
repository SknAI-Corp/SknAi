import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import axios from 'axios';

const LogoutScreen = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken'); 
      if (!accessToken) {
        throw new Error('Access token is missing');
      }
      // Make a request to the backend to clear cookies and logout user
      await axios.post('http://172.20.10.3:8000/api/v1/users/logout', {}, {
        withCredentials: true, // Ensure cookies are sent with the request
        headers: {
          'Authorization': `Bearer ${accessToken}`, // Pass the valid token
        }
      });

      // Clear user token from AsyncStorage
      await AsyncStorage.removeItem('accessToken');
      
      // Optionally, you can show an alert for confirmation before navigating
      Alert.alert('Success', 'You have been logged out', [
        { text: 'OK', onPress: () => router.push('/screens/LoginScreen') }
      ]);
    } catch (error) {
      console.error('Logout failed', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Are you sure you want to logout?</Text>
      <Button title="Logout" onPress={handleLogout} color="red" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
});

export default LogoutScreen;

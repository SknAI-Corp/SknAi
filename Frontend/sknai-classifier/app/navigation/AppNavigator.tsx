import { Stack } from "expo-router";

export default function AppNavigator() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="screens/GetStartedScreen" />
      <Stack.Screen name="screens/LoginScreen" />
      <Stack.Screen name="screens/HomeScreen" />
    </Stack>
  );
}

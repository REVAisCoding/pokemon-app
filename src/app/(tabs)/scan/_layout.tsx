import { Stack } from 'expo-router';

export default function ScanLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="loading" />
      <Stack.Screen name="job/[jobId]" />
      <Stack.Screen name="confirm" />
      <Stack.Screen name="result" />
      <Stack.Screen name="error" />
    </Stack>
  );
}

/**
 * Main React Native App (Zustand Edition)
 */
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import AppNavigator from './src/app/navigation/AppNavigator';
import AuthNavigator from './src/features/auth/AuthNavigator';
import { useAuthStore } from './src/store/authStore';
enableScreens();
// ⚡ React Query client with conservative defaults to avoid auto-refetching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});
const AuthGate = () => {
  const { user, loading, initializeSession } = useAuthStore();
  useEffect(() => {
    initializeSession();
  }, [initializeSession]);
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fff',
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return (
    <NavigationContainer>
      {user ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
const App = () => {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthGate />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
};

export default App;

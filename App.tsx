/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { Provider, useDispatch, useSelector } from 'react-redux';
enableScreens();

import AppNavigator from './src/app/navigation/AppNavigator';
import AuthNavigator from './src/features/auth/AuthNavigator';
import { AppDispatch, RootState, store } from './src/slices';
import { hydrateAuth } from './src/slices/authSlice';

// ⚡ create a react-query client
const queryClient = new QueryClient();

// 🔐 Handles deciding whether user is logged in or not
const AuthGate = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, loading } = useSelector(
    (state: RootState) => state.auth,
  );

  // Run hydration once on startup
  useEffect(() => {
    dispatch(hydrateAuth());
  }, [dispatch]);

  // 🌀 Show loader until hydration completes
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

  // ✅ Authenticated → AppNavigator | Not Authenticated → AuthNavigator
  console.log(
    '[AuthGate] Render → isAuthenticated:',
    isAuthenticated,
    '| loading:',
    loading,
  );

  // ✅ Authenticated → AppNavigator | Not Authenticated → AuthNavigator
  return (
    <NavigationContainer>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

function App() {
  // const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <AuthGate />
        </QueryClientProvider>
      </Provider>
    </SafeAreaProvider>
  );
}

export default App;

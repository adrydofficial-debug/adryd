/**
 * Main React Native App
 */

import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';

import { Provider } from 'react-redux';
import AppNavigator from './src/app/navigation/AppNavigator';
import AuthNavigator from './src/features/auth/AuthNavigator';
import { supabase } from './src/services/supabase';
import { store } from './src/slices';

enableScreens();

// ⚡ React Query client
const queryClient = new QueryClient();

const AuthGate = () => {
  const [user, setUser] = useState<any>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkSupabaseSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      setCheckingSession(false);
    };

    checkSupabaseSession();
  }, []);

  if (checkingSession) {
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
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <AuthGate />
        </QueryClientProvider>
      </Provider>
    </SafeAreaProvider>
  );
};

export default App;

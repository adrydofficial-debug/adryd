
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import AppNavigator from './src/app/navigation/AppNavigator';
import AuthNavigator from './src/features/auth/AuthNavigator';
import { useAuthStore } from './src/store/authStore';
import LanguageSelectionModal from './src/components/LanguageSelectionModal';
import {
  isLanguageSelected,
  setLanguageSelected,
  getLanguage,
  saveLanguage,
} from './src/services/languageStorage';
import i18n from './src/i18n';
import { useRegisterFcmToken } from './src/features/fcmtoken/hooks/useRegisterFcmToken';
enableScreens();
// :zap: React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
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
// :closed_lock_with_key: Auth + Language + Notification Gate
const AuthGate = () => {
  const { user, loading, initializeSession } = useAuthStore();
  const registerFcm = useRegisterFcmToken();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [checkingLanguage, setCheckingLanguage] = useState(true);
  useEffect(() => {
    initializeSession();
    checkLanguagePreference();
    setupNotifications();
  }, []);
  // :white_tick: Language check
  const checkLanguagePreference = async () => {
    try {
      const hasSelectedLanguage = await isLanguageSelected();
      if (!hasSelectedLanguage) {
        setShowLanguageModal(true);
      } else {
        const savedLanguage = await getLanguage();
        if (savedLanguage) {
          i18n.changeLanguage(savedLanguage);
        }
      }
    } catch (error) {
      console.error('Error checking language preference:', error);
    } finally {
      setCheckingLanguage(false);
    }
  };
  const handleLanguageSelect = async (language: 'en' | 'ur') => {
    try {
      await saveLanguage(language);
      await setLanguageSelected();
      i18n.changeLanguage(language);
      setShowLanguageModal(false);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };
  // :bell: Push Notification Setup
  const setupNotifications = async () => {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      if (enabled) console.log(':bell: Notification permission granted');
      const fcmToken = await messaging().getToken();
      console.log(':mobile_phone: FCM Token:', fcmToken);
      try {
        const res = await registerFcm.mutateAsync(fcmToken);
        console.log('[FCM] register token result:', res);
      } catch (e) {
        console.warn('[FCM] register token failed:', e);
      }
      const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
      });
      await notifee.displayNotification({
        title: 'Welcome',
        body: 'App opened — notifications are enabled.',
        android: {
          channelId,
          importance: AndroidImportance.HIGH,
        },
      });
      const initialNotification = await messaging().getInitialNotification();
      if (initialNotification) {
        Alert.alert(
          'Opened from notification',
          initialNotification.notification?.title ?? 'Opened via notification'
        );
      }
      const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
        console.log(':incoming_envelope: Foreground message:', remoteMessage);
        await notifee.displayNotification({
          title: remoteMessage.notification?.title,
          body: remoteMessage.notification?.body,
          android: {
            channelId: 'default',
            importance: AndroidImportance.HIGH,
          },
        });
      });
      const unsubscribeTokenRefresh = messaging().onTokenRefresh(async (newToken) => {
        console.log(':repeat: FCM token refreshed:', newToken);
        try {
          const res = await registerFcm.mutateAsync(newToken);
          console.log('[FCM] refresh register result:', res);
        } catch (e) {
          console.warn('[FCM] refresh register failed:', e);
        }
      });
      const unsubscribeOpened = messaging().onNotificationOpenedApp((remoteMessage) => {
        if (remoteMessage) {
          Alert.alert(
            'Opened from notification',
            remoteMessage.notification?.title ?? ''
          );
        }
      });
      return () => {
        unsubscribeForeground();
        unsubscribeOpened();
        unsubscribeTokenRefresh();
      };
    } catch (err) {
      console.warn('Notification setup error', err);
    }
  };
  if (loading || checkingLanguage) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return (
    <>
      <NavigationContainer>
        {user ? <AppNavigator /> : <AuthNavigator />}
      </NavigationContainer>
      <LanguageSelectionModal
        visible={showLanguageModal}
        onSelectLanguage={handleLanguageSelect}
      />
    </>
  );
};
// :brain: Main App Wrapper
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

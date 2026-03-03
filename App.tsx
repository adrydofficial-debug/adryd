import {
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
import { I18nManager, Linking } from 'react-native';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect, useRef, useState } from 'react';
import 'react-native-get-random-values';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import Toast from 'react-native-toast-message';
import 'react-native-url-polyfill/auto';
import AppInitializer from './src/app/AppInitializer';
import AppNavigator from './src/app/navigation/AppNavigator';
import LanguageSelectionModal from './src/components/LanguageSelectionModal';
import SplashScreen from './src/components/SplashScreen';
import AuthNavigator from './src/features/auth/AuthNavigator';
import { useRegisterFcmToken } from './src/features/fcmtoken/hooks/useRegisterFcmToken';
import { useNotificationsStream } from './src/features/notifications/hooks/useNotifications';
import Onboard from './src/features/splash/screens/OnBoard';
import i18n from './src/i18n';
import {
  getLanguage,
  isLanguageSelected,
  saveLanguage,
  setLanguageSelected,
} from './src/services/languageStorage';
import {
  getFCMToken,
  requestNotificationPermission,
  setupForegroundMessageHandler,
  setupNotificationOpenedHandler,
} from './src/services/notificationService';
import {
  isOnboardingCompleted,
  setOnboardingCompleted,
} from './src/services/onboardingStorage';
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
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [checkingLanguage, setCheckingLanguage] = useState(true);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [splashComplete, setSplashComplete] = useState(false);
  const navigationRef = useRef<NavigationContainerRef<any>>(null);
  const registerFcmToken = useRegisterFcmToken();
  const fcmTokenRegistered = useRef<string | null>(null);
  // const hasInitializedCity = useRef(false);

  // Initialize notification stream to listen for new notifications
  useNotificationsStream(user?.id || null);

  useEffect(() => {
    initializeSession();
    checkOnboardingAndLanguage();
    // Listener for links while app is open
    const linkingListener = Linking.addEventListener(
      'url',
      (event: { url: string }) => {
        handleReferralLink(event.url);
      },
    );
    // Check if app was opened from a link
    Linking.getInitialURL().then(url => {
      if (url) handleReferralLink(url);
    });
    return () => {
      linkingListener.remove();
    };
  }, [initializeSession]);

  // Setup notifications when user is logged in
  useEffect(() => {
    if (!user || !splashComplete) return;

    const setupNotifications = async () => {
      try {
        // Request permission
        const hasPermission = await requestNotificationPermission();
        if (!hasPermission) {
          console.log('⚠️ Notification permission not granted');
          return;
        }

        // Get FCM token
        const token = await getFCMToken();
        if (token && fcmTokenRegistered.current !== token) {
          // Register token with backend (only if not already registered)
          fcmTokenRegistered.current = token;
          registerFcmToken.mutate(token);
        }

        // Setup foreground handler (when app is open)
        const unsubscribeForeground = setupForegroundMessageHandler();

        // Setup notification opened handler (when user taps notification)
        const unsubscribeOpened = setupNotificationOpenedHandler(data => {
          console.log('📨 Notification tapped, data:', data);

          // Navigate to relevant screen based on notification type
          if (
            data?.type === 'status_update' &&
            data?.advertisement_id &&
            navigationRef.current
          ) {
            navigationRef.current.navigate('CampaignChatDetail', {
              campaignId: parseInt(data.advertisement_id, 10),
              campaignName: data.campaign_name || 'Campaign',
              boardLocation: data.location,
            });
          }
        });

        return () => {
          unsubscribeForeground();
          unsubscribeOpened();
        };
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    };
    setupNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, splashComplete]); // Removed registerFcmToken from deps to prevent infinite loop

  // useEffect(() => {
  //   if (!splashComplete || hasInitializedCity.current) return;

  //   const initCity = async () => {
  //     try {
  //       console.log('[InitCity] Starting initialization...');

  //       const stored = await AsyncStorage.getItem('selected_city');

  //       if (stored) {
  //         const city = JSON.parse(stored);
  //         console.log('[InitCity] Restoring city from storage:', city);

  //         await useAppStore.getState().setSelectedCity(city);
  //       } else {
  //         const { cities } = useAppStore.getState();

  //         console.log('[InitCity] No stored city found');
  //         console.log('[InitCity] Available cities:', cities);

  //         if (cities && cities.length > 0) {
  //           const firstCity = cities[0];

  //           console.log('[InitCity] Using first city as default:', firstCity);

  //           await useAppStore.getState().setSelectedCity(firstCity);
  //         } else {
  //           console.warn('[InitCity] No cities available to set as default');
  //         }
  //       }

  //       hasInitializedCity.current = true;
  //       console.log('[InitCity] Initialization complete');
  //     } catch (err) {
  //       console.error('[InitCity] Failed:', err);
  //     }
  //   };

  //   initCity();
  // }, [splashComplete]);

  // --------------------
  // Referral Handling
  // --------------------
  const handleReferralLink = (url: string) => {
    const referralPrefix = 'https://adryd.app/invite/';
    if (url.startsWith(referralPrefix)) {
      const referralCode = url.substring(referralPrefix.length);
      console.log('Referral code detected:', referralCode);

      // Store in auth store
      useAuthStore.getState().setReferrerCode(referralCode);
    }
  };

  const checkOnboardingAndLanguage = async () => {
    try {
      // Check if user has completed onboarding
      const hasCompletedOnboarding = await isOnboardingCompleted();
      setHasSeenOnboarding(hasCompletedOnboarding);

      if (!hasCompletedOnboarding) {
        // First time user - will show onboarding after splash
        setShowOnboarding(true);
      } else {
        // Returning user - skip onboarding
        setShowOnboarding(false);
      }

      // Check language preference
      const hasSelectedLanguage = await isLanguageSelected();
      if (!hasSelectedLanguage) {
        setShowLanguageModal(true);
      } else {
        // Load saved language
        const savedLanguage = await getLanguage();
        console.log('Selected Language is ', savedLanguage);
        if (savedLanguage) {
          if (savedLanguage === 'ur') {
            I18nManager.allowRTL(true);
            I18nManager.forceRTL(true);
            i18n.changeLanguage(savedLanguage);
          }
        }
      }
    } catch (error) {
      console.error('Error checking onboarding/language preference:', error);
    } finally {
      setCheckingLanguage(false);
      setCheckingOnboarding(false);
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

  const handleOnboardingComplete = async () => {
    try {
      await setOnboardingCompleted();
      setShowOnboarding(false);
      setHasSeenOnboarding(true);
    } catch (error) {
      console.error('Error marking onboarding as completed:', error);
      setShowOnboarding(false);
    }
  };

  const handleSplashComplete = () => {
    setSplashComplete(true);
  };

  // For returning users, auto-complete splash after 2 seconds once checks are done
  useEffect(() => {
    if (
      !loading &&
      !checkingLanguage &&
      !checkingOnboarding &&
      hasSeenOnboarding &&
      !splashComplete
    ) {
      const timer = setTimeout(() => {
        setSplashComplete(true);
      }, 2000); // 2 seconds for returning users
      return () => clearTimeout(timer);
    }
  }, [
    loading,
    checkingLanguage,
    checkingOnboarding,
    hasSeenOnboarding,
    splashComplete,
  ]);

  // Show splash screen while checking or if splash hasn't completed
  // For returning users, show brief splash (2 seconds)
  // For first-time users, show full splash then onboarding
  if (loading || checkingLanguage || checkingOnboarding || !splashComplete) {
    return (
      <SplashScreen
        onComplete={handleSplashComplete}
        shouldWaitForLoading={loading || checkingLanguage || checkingOnboarding}
      />
    );
  }

  // Show onboarding for first-time users (after splash completes)
  if (showOnboarding && !hasSeenOnboarding) {
    return <Onboard onComplete={handleOnboardingComplete} />;
  }

  // Show main app (Home or Login based on user state)
  return (
    <>
      {/* <AppInitializer splashComplete={splashComplete} />; */}
      <NavigationContainer ref={navigationRef}>
        {user ? <AppNavigator /> : <AuthNavigator />}
      </NavigationContainer>
      <LanguageSelectionModal
        visible={showLanguageModal}
        onSelectLanguage={handleLanguageSelect}
      />
      <Toast />
    </>
  );
};
const App = () => {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AppInitializer />
        <AuthGate />
        {/* </AppInitializer> */}
      </QueryClientProvider>
    </SafeAreaProvider>
  );
};

export default App;

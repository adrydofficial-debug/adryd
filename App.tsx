// /**
//  * Main React Native App (Zustand Edition)
//  */

// import 'react-native-get-random-values';
// import 'react-native-url-polyfill/auto';
// import { NavigationContainer } from '@react-navigation/native';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import React, { useEffect, useState } from 'react';
// import { ActivityIndicator, View } from 'react-native';
// import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { enableScreens } from 'react-native-screens';
// import AppNavigator from './src/app/navigation/AppNavigator';
// import AuthNavigator from './src/features/auth/AuthNavigator';
// import { useAuthStore } from './src/store/authStore';
// import LanguageSelectionModal from './src/components/LanguageSelectionModal';
// import { isLanguageSelected, setLanguageSelected, getLanguage, saveLanguage } from './src/services/languageStorage';
// import i18n from './src/i18n';
// enableScreens();
// // ⚡ React Query client with conservative defaults to avoid auto-refetching
// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       staleTime: 1000 * 60 * 5, // 5 minutes
//       gcTime: 1000 * 60 * 30, // 30 minutes
//       refetchOnMount: false,
//       refetchOnWindowFocus: false,
//       refetchOnReconnect: false,
//       retry: 1,
//     },
//     mutations: {
//       retry: 0,
//     },
//   },
// });
// const AuthGate = () => {
//   const { user, loading, initializeSession } = useAuthStore();
//   const [showLanguageModal, setShowLanguageModal] = useState(false);
//   const [checkingLanguage, setCheckingLanguage] = useState(true);

// import 'react-native-get-random-values';
// import 'react-native-url-polyfill/auto';
// import { NavigationContainer } from '@react-navigation/native';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import React, { useEffect, useState } from 'react';
// import { ActivityIndicator, View } from 'react-native';
// import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { enableScreens } from 'react-native-screens';
// import AppNavigator from './src/app/navigation/AppNavigator';
// import AuthNavigator from './src/features/auth/AuthNavigator';
// import { useAuthStore } from './src/store/authStore';
// import LanguageSelectionModal from './src/components/LanguageSelectionModal';
// import { isLanguageSelected, setLanguageSelected, getLanguage, saveLanguage } from './src/services/languageStorage';
// import i18n from './src/i18n';
// enableScreens();
// // ⚡ React Query client with conservative defaults to avoid auto-refetching
// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       staleTime: 1000 * 60 * 5, // 5 minutes
//       gcTime: 1000 * 60 * 30, // 30 minutes
//       refetchOnMount: false,
//       refetchOnWindowFocus: false,
//       refetchOnReconnect: false,
//       retry: 1,
//     },
//     mutations: {
//       retry: 0,
//     },
//   },
// });
// const AuthGate = () => {
//   const { user, loading, initializeSession } = useAuthStore();
//   const [showLanguageModal, setShowLanguageModal] = useState(false);
//   const [checkingLanguage, setCheckingLanguage] = useState(true);

//   useEffect(() => {
//     initializeSession();
//     checkLanguagePreference();
//   }, [initializeSession]);

//   const checkLanguagePreference = async () => {
//     try {
//       const hasSelectedLanguage = await isLanguageSelected();
//       if (!hasSelectedLanguage) {
//         setShowLanguageModal(true);
//       } else {
//         // Load saved language
//         const savedLanguage = await getLanguage();
//         if (savedLanguage) {
//           i18n.changeLanguage(savedLanguage);
//         }
//       }
//     } catch (error) {
//       console.error('Error checking language preference:', error);
//     } finally {
//       setCheckingLanguage(false);
//     }
//   };

//   const handleLanguageSelect = async (language: 'en' | 'ur') => {
//     try {
//       await saveLanguage(language);
//       await setLanguageSelected();
//       i18n.changeLanguage(language);
//       setShowLanguageModal(false);
//     } catch (error) {
//       console.error('Error saving language:', error);
//     }
//   };

//   if (loading || checkingLanguage) {
//     return (
//       <View
//         style={{
//           flex: 1,
//           justifyContent: 'center',
//           alignItems: 'center',
//           backgroundColor: '#fff',
//         }}
//       >
//         <ActivityIndicator size="large" />
//       </View>
//     );
//   }
//   return (
//     <>
//       <NavigationContainer>
//         {user ? <AppNavigator /> : <AuthNavigator />}
//       </NavigationContainer>
//       <LanguageSelectionModal
//         visible={showLanguageModal}
//         onSelectLanguage={handleLanguageSelect}
//       />
//     </>
//   );
// };
// const App = () => {
//   return (
//     <SafeAreaProvider>
//       <QueryClientProvider client={queryClient}>
//         <AuthGate />
//       </QueryClientProvider>
//     </SafeAreaProvider>
//   );
// };

// export default App;
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import 'react-native-get-random-values';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import 'react-native-url-polyfill/auto';
import AppNavigator from './src/app/navigation/AppNavigator';
import LanguageSelectionModal from './src/components/LanguageSelectionModal';
import SplashScreen from './src/components/SplashScreen';
import AuthNavigator from './src/features/auth/AuthNavigator';
import Onboard from './src/features/splash/screens/OnBoard';
import i18n from './src/i18n';
import {
  getLanguage,
  isLanguageSelected,
  saveLanguage,
  setLanguageSelected,
} from './src/services/languageStorage';
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

  useEffect(() => {
    initializeSession();
    checkOnboardingAndLanguage();
  }, [initializeSession]);

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
        if (savedLanguage) {
          i18n.changeLanguage(savedLanguage);
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
    if (!loading && !checkingLanguage && !checkingOnboarding && hasSeenOnboarding && !splashComplete) {
      const timer = setTimeout(() => {
        setSplashComplete(true);
      }, 2000); // 2 seconds for returning users
      return () => clearTimeout(timer);
    }
  }, [loading, checkingLanguage, checkingOnboarding, hasSeenOnboarding, splashComplete]);

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

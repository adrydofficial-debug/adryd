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
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import AppNavigator from './src/app/navigation/AppNavigator';
import AuthNavigator from './src/features/auth/AuthNavigator';
import { useAuthStore } from './src/store/authStore';
import LanguageSelectionModal from './src/components/LanguageSelectionModal';
import SplashScreen from './src/components/SplashScreen';
import { isLanguageSelected, setLanguageSelected, getLanguage, saveLanguage } from './src/services/languageStorage';
import i18n from './src/i18n';
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
  const [splashCompleted, setSplashCompleted] = useState(false);

  useEffect(() => {
    initializeSession();
    checkLanguagePreference();
  }, [initializeSession]);

  const checkLanguagePreference = async () => {
    try {
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

  const handleSplashComplete = () => {
    setSplashCompleted(true);
  };

  // Show splash screen until splash animation completes AND loading/checkingLanguage is done
  const isLoading = loading || checkingLanguage;
  const shouldShowSplash = !splashCompleted || isLoading;

  if (shouldShowSplash) {
    return <SplashScreen onComplete={handleSplashComplete} shouldWaitForLoading={isLoading} />;
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

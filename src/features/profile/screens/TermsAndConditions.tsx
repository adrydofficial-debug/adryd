import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
  Animated,
  Easing,
  Alert,
  Share,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RNFS from 'react-native-fs';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import BackButton from '../../../components/BackButton';
import PrimaryButton from '../../../components/PrimaryButton';
import { getTermsAgreed, setTermsAgreed } from '../../../services/storage';
import { useAuthStore } from '../../../store/authStore';
import { useTermsAndConditions } from '../../legal/hooks/useLegalDocuments';
import { useLegalAgreements } from '../../legal/hooks/useLegalAgreements';

const { width, height } = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

interface TermsAndConditionsProps {
  route?: {
    params?: {
      fromAuth?: boolean;
      user?: any;
      navigateTo?: string;
    };
  };
}

const TermsAndConditions: React.FC<TermsAndConditionsProps> = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = (route.params as any) || {};
  const fromAuth = params.fromAuth || false;
  const navigateTo = params.navigateTo;
  const pendingUser = params.user; // User from registration OTP verification
  const setUser = useAuthStore(s => s.setUser);
  const { i18n: i18nInstance } = useTranslation();

  const [hasAgreed, setHasAgreed] = useState<boolean>(false);
  const [showHelloBanner, setShowHelloBanner] = useState<boolean>(false);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [currentLanguage, setCurrentLanguage] = useState<string>(i18nInstance.language || 'en');
  
  // Legal documents hooks
  const { content, version, loading: contentLoading, error: contentError, isCached } = useTermsAndConditions();
  const { submitAgreement } = useLegalAgreements();
  
  // Refs
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Animation values
  const checkboxScale = useRef(new Animated.Value(1)).current;
  const checkboxOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslateY = useRef(new Animated.Value(100)).current; // Start from bottom

  useEffect(() => {
    checkTermsAgreement();
    // Listen for language changes
    const handleLanguageChange = (lang: string) => {
      setCurrentLanguage(lang);
    };
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  useEffect(() => {
    // Animate button container appearance (but keep button hidden until checkbox is checked)
    if (showHelloBanner) {
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [showHelloBanner]);

  const checkTermsAgreement = async () => {
    try {
      const agreed = await getTermsAgreed();
      setHasAgreed(agreed);
      setShowHelloBanner(!agreed || fromAuth);
      // Always start with checkbox unchecked
      setIsChecked(false);
    } catch (error) {
      console.error('Error checking terms agreement:', error);
      setShowHelloBanner(true);
      setIsChecked(false);
    }
  };

  const handleCheckboxToggle = () => {
    const newCheckedState = !isChecked;
    setIsChecked(newCheckedState);

    // Animate checkbox
    Animated.sequence([
      Animated.parallel([
        Animated.spring(checkboxScale, {
          toValue: 0.8,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
        Animated.timing(checkboxOpacity, {
          toValue: newCheckedState ? 1 : 0,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(checkboxScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
    ]).start();

    // Animate button from bottom when checked
    if (newCheckedState) {
      // Scroll to bottom to show the button
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
      Animated.parallel([
        Animated.spring(buttonTranslateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Hide button when unchecked
      Animated.parallel([
        Animated.timing(buttonTranslateY, {
          toValue: 100,
          duration: 250,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 0.8,
          duration: 250,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleAgree = async () => {
    if (!isChecked) {
      return; // Don't proceed if checkbox is not checked
    }

    // Animate button press
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(async () => {
      try {
        // Submit agreement to backend
        if (version) {
          const success = await submitAgreement('terms', version);
          if (!success) {
            Alert.alert('Error', 'Failed to submit agreement. Please try again.');
            return;
          }
        }
        
        // Also update local storage (for backward compatibility)
        await setTermsAgreed(true);
        setHasAgreed(true);
        setShowHelloBanner(false);
        
        // Navigate based on where we came from
        setTimeout(() => {
          if (navigateTo && pendingUser) {
            // If we have a pending user from registration, set it first
            // This will cause the app to switch from AuthNavigator to AppNavigator
            setUser(pendingUser);
            
            // Use a small delay to ensure the navigator has switched
            setTimeout(() => {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: navigateTo }],
                })
              );
            }, 100);
          } else if (navigateTo) {
            // If we have a navigation target but no pending user, just navigate
            (navigation as any).navigate(navigateTo);
          } else {
            // Otherwise, just go back
            navigation.goBack();
          }
        }, 300);
      } catch (error) {
        console.error('Error saving terms agreement:', error);
        Alert.alert('Error', 'Failed to submit agreement. Please try again.');
      }
    });
  };

  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        // Android 13+ (API 33+) doesn't require WRITE_EXTERNAL_STORAGE permission
        const androidVersion = Platform.Version;
        if (androidVersion >= 33) {
          return true;
        }
        
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs access to storage to download Terms and Conditions',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS doesn't need this permission
  };

  const handleDownload = async () => {
    try {
      // Use fetched content from API
      if (!content || content.trim().length === 0) {
        Alert.alert(
          'Error',
          'Terms and Conditions content is not available. Please check your internet connection and try again.'
        );
        return;
      }
      
      const termsContent = content;
      const fileName = 'ADRYD_Terms_and_Conditions.txt';

      // For both platforms, create a file and share it
      // This is more reliable than direct file system access
      try {
        // Create file in a temporary/cache directory first
        const tempDir = Platform.OS === 'android' 
          ? RNFS.CachesDirectoryPath 
          : RNFS.DocumentDirectoryPath;
        const tempFilePath = `${tempDir}/${fileName}`;
        
        // Remove file if it exists
        const fileExists = await RNFS.exists(tempFilePath);
        if (fileExists) {
          await RNFS.unlink(tempFilePath);
        }
        
        // Write the file with full content
        await RNFS.writeFile(tempFilePath, termsContent, 'utf8');
        
        // Verify file was written correctly
        const fileExistsAfter = await RNFS.exists(tempFilePath);
        if (!fileExistsAfter) {
          throw new Error('File was not created');
        }
        
        // Read back to verify content
        const fileContent = await RNFS.readFile(tempFilePath, 'utf8');
        if (!fileContent || fileContent.length === 0) {
          throw new Error('File was created but is empty');
        }
        
        // For Android, also try to save to Downloads if permission granted
        if (Platform.OS === 'android') {
          const hasPermission = await requestStoragePermission();
          if (hasPermission) {
            try {
              const downloadPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
              // Copy to Downloads folder
              await RNFS.copyFile(tempFilePath, downloadPath);
              
              // Verify the copy
              const downloadExists = await RNFS.exists(downloadPath);
              const downloadContent = await RNFS.readFile(downloadPath, 'utf8');
              
              if (downloadExists && downloadContent.length > 0) {
                const fileStats = await RNFS.stat(downloadPath);
                Alert.alert(
                  'Download Complete',
                  `Terms and Conditions have been saved to your Downloads folder.\n\nFile: ${fileName}\nSize: ${(fileStats.size / 1024).toFixed(2)} KB`,
                  [{ text: 'OK' }]
                );
                return; // Success, exit early
              }
            } catch (downloadError) {
              console.log('Could not save to Downloads, will use Share instead:', downloadError);
              // Continue to Share API as fallback
            }
          }
        }
        
        // Share the file - this allows users to save it wherever they want
        // On Android, users can save to Downloads from the share menu
        // On iOS, users can save to Files app from the share menu
        const fileUri = Platform.OS === 'android' 
          ? `file://${tempFilePath}` 
          : `file://${tempFilePath}`;
        
        const result = await Share.share({
          url: fileUri,
          title: 'ADRYD Terms and Conditions',
          message: Platform.OS === 'android' ? 'ADRYD Terms and Conditions' : undefined,
        });
        
        if (result.action === Share.sharedAction) {
          Alert.alert(
            'Shared',
            'Terms and Conditions have been shared. You can save it to your preferred location from the share menu.',
            [{ text: 'OK' }]
          );
        } else if (result.action === Share.dismissedAction && Platform.OS === 'ios') {
          Alert.alert(
            'Saved',
            'Terms and Conditions file is ready. You can save it to Files app from the share menu.',
            [{ text: 'OK' }]
          );
        }
      } catch (fileError: any) {
        console.error('Error creating file:', fileError);
        
        // Final fallback: share as text
        try {
          const result = await Share.share({
            message: termsContent,
            title: 'ADRYD Terms and Conditions',
          });
          if (result.action === Share.sharedAction) {
            Alert.alert(
              'Shared',
              'Terms and Conditions have been shared as text. You can copy and save it.',
              [{ text: 'OK' }]
            );
          }
        } catch (shareError) {
          console.error('Share error:', shareError);
          Alert.alert(
            'Error',
            `Unable to download or share. Please try again.\n\nError: ${fileError?.message || 'Unknown error'}`,
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error: any) {
      console.error('Error downloading Terms and Conditions:', error);
      Alert.alert(
        'Download Failed',
        `Unable to download Terms and Conditions. Please try again.\n\nError: ${error?.message || 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleLanguageToggle = (lang: 'en' | 'ur') => {
    i18n.changeLanguage(lang);
    setCurrentLanguage(lang);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />

      {/* Fixed Header with Back Button, Title and Language Selector */}
      <View style={styles.fixedHeader}>
        {/* First Row: Back Button and Language Selector */}
        <View style={styles.headerTopRow}>
          <BackButton iconColor="#18181B" style={styles.backButtonContainer} />
          <View style={styles.languageSelector}>
            <TouchableOpacity
              style={[
                styles.languageButton,
                currentLanguage === 'en' && styles.languageButtonActive,
              ]}
              onPress={() => handleLanguageToggle('en')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  currentLanguage === 'en' && styles.languageButtonTextActive,
                ]}
              >
                English
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.languageButton,
                currentLanguage === 'ur' && styles.languageButtonActive,
              ]}
              onPress={() => handleLanguageToggle('ur')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  currentLanguage === 'ur' && styles.languageButtonTextActive,
                ]}
              >
                Urdu
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Second Row: Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>Terms and Conditions</Text>
        </View>
      </View>

      {/* Hello Banner - Only shown if user hasn't agreed and from auth flow */}
      {showHelloBanner && fromAuth && (
        <View style={styles.helloBanner}>
          <Text style={styles.helloTitle}>Hello</Text>
          <Text style={styles.helloSubtitle}>
            Before you create an account, please read and accept our Terms and Condition.
          </Text>
        </View>
      )}

      {/* Terms Content - Scrolls behind the fixed header */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { 
            paddingTop: (Platform.OS === 'ios' ? hp(10) : hp(12)) + (showHelloBanner && fromAuth ? 79 + hp(2) : 0)
          }
        ]}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.contentCard}>
          {/* Version Info - Scrolls with content */}
          <View style={styles.lastUpdateContainer}>
            <Text style={styles.lastUpdate}>
              {version ? `Version: ${version}` : 'Last update: Yesterday'}
            </Text>
            {isCached && (
              <Text style={[styles.lastUpdate, { fontSize: 10, color: '#999', marginTop: 4 }]}>
                (Showing cached version)
              </Text>
            )}
          </View>

          {contentLoading && !content ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#C539A5" />
              <Text style={styles.loadingText}>Loading Terms & Conditions...</Text>
            </View>
          ) : contentError && !content ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error loading content: {contentError}</Text>
              <Text style={styles.errorText}>
                Please check your internet connection and try again.
              </Text>
            </View>
          ) : content ? (
            <View style={styles.termsContent}>
              <Text style={styles.paragraph}>{content}</Text>
            </View>
          ) : (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                No content available. Please check your internet connection and try again.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Checkbox and Agree Button - Only shown if user hasn't agreed or from auth */}
      {showHelloBanner && (
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: buttonOpacity,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={handleCheckboxToggle}
            activeOpacity={0.7}
          >
            <Animated.View
              style={[
                styles.checkbox,
                isChecked && styles.checkboxChecked,
                {
                  transform: [{ scale: checkboxScale }],
                },
              ]}
            >
              <Animated.View
                style={{
                  opacity: checkboxOpacity,
                }}
              >
                {isChecked && (
                  <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                )}
              </Animated.View>
            </Animated.View>
            <Text style={[
              styles.checkboxText,
              { color: isChecked ? '#18181B' : '#70737D' }
            ]}>
              These Terms will be applied fully and affect
            </Text>
          </TouchableOpacity>
          
          <Animated.View
            style={{
              transform: [
                { translateY: buttonTranslateY },
                { scale: buttonScale },
              ],
            }}
          >
            <PrimaryButton
              title="Agree"
              onPress={handleAgree}
              disabled={!isChecked}
              buttonStyle={styles.agreeButton}
            />
          </Animated.View>
        </Animated.View>
      )}

      {/* Download Button - Only visible when NOT from auth flow */}
      {!fromAuth && (
        <View style={styles.downloadButtonContainer}>
          <PrimaryButton
            title="Download"
            onPress={handleDownload}
            buttonStyle={styles.downloadButton}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? hp(1) : hp(2),
    paddingHorizontal: 17,
    paddingBottom: hp(1.5),
    borderBottomWidth: 0,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp(1),
  },
  backButtonContainer: {
    position: 'relative',
    left: 0,
    top: 0,
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#18181B',
    textAlign: 'center',
  },
  languageSelector: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  languageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'transparent',
    minWidth: 60,
    alignItems: 'center',
  },
  languageButtonActive: {
    backgroundColor: '#C539A5',
  },
  languageButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#70737D',
  },
  languageButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  lastUpdateContainer: {
    marginBottom: hp(2),
    marginTop: hp(1),
  },
  lastUpdate: {
    fontSize: 12,
    fontWeight: '400',
    color: '#999999',
  },
  helloBanner: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? hp(10) : hp(12),
    left: 17,
    zIndex: 5,
    marginTop: hp(1.5),
    marginBottom: hp(2),
    padding: 15, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 17, 
    borderWidth: 0.7, 
    borderColor: '#E5E7EB', 
    width: Math.min(356, width - 34), 
    minHeight: 79,
  },
  helloTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 6.11, 
  },
  helloSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    paddingBottom: hp(20),
    paddingHorizontal: 0,
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingTop: 0,
    paddingRight: 15,
    paddingBottom: 20,
    paddingLeft: 15,
    width: width,
    alignSelf: 'stretch',
  },
  termsContent: {
    marginBottom: hp(2),
  },
  introText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    lineHeight: 22,
    marginBottom: hp(2),
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#18181B',
    marginTop: hp(2.5),
    marginBottom: hp(1),
  },
  paragraph: {
    fontSize: 12,
    fontWeight: '400',
    color: '#18181B',
    lineHeight: 20,
    marginBottom: hp(1.5),
  },
  bulletPoint: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    lineHeight: 22,
    marginBottom: hp(0.8),
    marginLeft: wp(2),
  },
  boldText: {
    fontWeight: '700',
  },
  link: {
    color: '#C539A5',
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: wp(4),
    paddingBottom: Platform.OS === 'ios' ? hp(2) : hp(3),
    paddingTop: hp(2.5),
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: hp(2),
    paddingVertical: hp(0.5),
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#C539A5',
    backgroundColor: '#FFFFFF',
    marginRight: wp(2),
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#C539A5',
    borderColor: '#C539A5',
  },
  checkboxText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#000000',
    flex: 1,
    lineHeight: 18,
    marginTop: 2,
  },
  agreeButton: {
    alignSelf: 'center',
    width: 161.5,
  },
  downloadButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: width,
    height: 123,
    paddingHorizontal: wp(4),
    paddingBottom: Platform.OS === 'ios' ? hp(2) : hp(3),
    paddingTop: hp(2.5),
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    zIndex: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadButton: {
    width: 161.5,
    alignSelf: 'center',
  },
  loadingContainer: {
    paddingVertical: hp(5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: hp(2),
    fontSize: 14,
    color: '#70737D',
  },
  errorContainer: {
    paddingVertical: hp(3),
    paddingHorizontal: wp(4),
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    marginBottom: hp(1),
    textAlign: 'center',
  },
});

export default TermsAndConditions;

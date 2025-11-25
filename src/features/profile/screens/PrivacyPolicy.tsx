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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RNFS from 'react-native-fs';
import BackButton from '../../../components/BackButton';
import PrimaryButton from '../../../components/PrimaryButton';
import { getTermsAgreed, setTermsAgreed } from '../../../services/storage';
import { useAuthStore } from '../../../store/authStore';

const { width, height } = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

interface PrivacyPolicyProps {
  route?: {
    params?: {
      fromAuth?: boolean;
      user?: any;
      navigateTo?: string;
    };
  };
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = (route.params as any) || {};
  const fromAuth = params.fromAuth || false;
  const navigateTo = params.navigateTo;
  const pendingUser = params.user; // User from registration OTP verification
  const setUser = useAuthStore(s => s.setUser);
  const [hasAgreed, setHasAgreed] = useState<boolean>(false);
  const [showHelloBanner, setShowHelloBanner] = useState<boolean>(false);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const checkboxScale = useRef(new Animated.Value(1)).current;
  const checkboxOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslateY = useRef(new Animated.Value(100)).current; // Start from bottom

  useEffect(() => {
    checkTermsAgreement();
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
      }
    });
  };

  const getPrivacyContent = (): string => {
    return `PRIVACY POLICY

Last update: Yesterday

This Privacy Policy explains how ADRYD Marketing Co. ("ADRYD," "we," "our," or "us") collects, uses, and protects your personal information when you use our website https://adryd.app and our mobile application (collectively referred to as the "Platform"). By using our Platform, you agree to the collection and use of your information in accordance with this Privacy Policy.

1. Information We Collect

We collect information that you provide directly to us, including:
• Personal identification information (name, email address, phone number)
• Business information (company name, registration number, address)
• Payment information (processed securely through third-party payment processors)
• Account credentials and profile information
• Content you submit through our Platform (advertisements, campaigns, etc.)

2. How We Use Your Information

We use the information we collect to:
• Provide, maintain, and improve our services
• Process transactions and send related information
• Send you technical notices, updates, and support messages
• Respond to your comments, questions, and requests
• Monitor and analyze trends, usage, and activities
• Detect, prevent, and address technical issues and fraudulent activity

3. Information Sharing and Disclosure

We do not sell, trade, or rent your personal information to third parties. We may share your information only:
• With your consent
• To comply with legal obligations
• To protect our rights and safety
• With service providers who assist us in operating our Platform (under strict confidentiality agreements)

4. Data Security

We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.

5. Data Retention

We retain your personal information for as long as necessary to provide our services and comply with legal obligations. When we no longer need your information, we will securely delete or anonymize it.

6. Your Rights

Under Pakistan's Personal Data Protection Bill, you have the right to:
• Access your personal information
• Correct inaccurate data
• Request deletion of your data
• Object to processing of your data
• Data portability

To exercise these rights, please contact us at support@adryd.app.

7. Cookies and Tracking Technologies

We use cookies and similar tracking technologies to track activity on our Platform and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.

8. Third-Party Links

Our Platform may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review the privacy policies of any third-party sites you visit.

9. Children's Privacy

Our Platform is not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.

10. Changes to This Privacy Policy

We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last update" date.

11. Contact Us

For any questions about this Privacy Policy, please contact us at:
📧 support@adryd.app
📍 ADRYD Marketing Co., Lahore, Pakistan`;
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
            message: 'App needs access to storage to download Privacy Policy',
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
      const privacyContent = getPrivacyContent();
      const fileName = 'ADRYD_Privacy_Policy.txt';
      
      // Verify content is not empty
      if (!privacyContent || privacyContent.trim().length === 0) {
        Alert.alert('Error', 'Privacy Policy content is empty.');
        return;
      }

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
        await RNFS.writeFile(tempFilePath, privacyContent, 'utf8');
        
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
                  `Privacy Policy has been saved to your Downloads folder.\n\nFile: ${fileName}\nSize: ${(fileStats.size / 1024).toFixed(2)} KB`,
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
          title: 'ADRYD Privacy Policy',
          message: Platform.OS === 'android' ? 'ADRYD Privacy Policy' : undefined,
        });
        
        if (result.action === Share.sharedAction) {
          Alert.alert(
            'Shared',
            'Privacy Policy has been shared. You can save it to your preferred location from the share menu.',
            [{ text: 'OK' }]
          );
        } else if (result.action === Share.dismissedAction && Platform.OS === 'ios') {
          Alert.alert(
            'Saved',
            'Privacy Policy file is ready. You can save it to Files app from the share menu.',
            [{ text: 'OK' }]
          );
        }
      } catch (fileError: any) {
        console.error('Error creating file:', fileError);
        
        // Final fallback: share as text
        try {
          const result = await Share.share({
            message: privacyContent,
            title: 'ADRYD Privacy Policy',
          });
          if (result.action === Share.sharedAction) {
            Alert.alert(
              'Shared',
              'Privacy Policy has been shared as text. You can copy and save it.',
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
      console.error('Error downloading Privacy Policy:', error);
      Alert.alert(
        'Download Failed',
        `Unable to download Privacy Policy. Please try again.\n\nError: ${error?.message || 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      
      {/* Header with Back Button */}
      {!fromAuth && (
        <View style={styles.header}>
          <BackButton iconColor="#000" />
        </View>
      )}

      {/* Hello Banner - Only shown if user hasn't agreed */}
      {showHelloBanner && (
        <View style={styles.helloBanner}>
          <Text style={styles.helloTitle}>Hello</Text>
          <Text style={styles.helloSubtitle}>
            Before you create an account, please read and accept our Privacy Policy.
          </Text>
        </View>
      )}

      {/* Terms Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Privacy Policy</Text>
          <View style={styles.lastUpdateContainer}>
            <Text style={styles.lastUpdate}>Last update: Yesterday</Text>
          </View>

          <View style={styles.termsContent}>
            <Text style={styles.introText}>
              This Privacy Policy explains how ADRYD Marketing Co. ("ADRYD," "we," "our," or "us") collects, uses, and protects your personal information when you use our website{' '}
              <Text style={styles.link}>https://adryd.app</Text> and our mobile application (collectively referred to as the "Platform"). By using our Platform, you agree to the collection and use of your information in accordance with this Privacy Policy.
            </Text>

            {/* Section 1 */}
            <Text style={styles.sectionTitle}>1. Information We Collect</Text>
            <Text style={styles.paragraph}>
              We collect information that you provide directly to us, including:
            </Text>
            <Text style={styles.bulletPoint}>• Personal identification information (name, email address, phone number)</Text>
            <Text style={styles.bulletPoint}>• Business information (company name, registration number, address)</Text>
            <Text style={styles.bulletPoint}>• Payment information (processed securely through third-party payment processors)</Text>
            <Text style={styles.bulletPoint}>• Account credentials and profile information</Text>
            <Text style={styles.bulletPoint}>• Content you submit through our Platform (advertisements, campaigns, etc.)</Text>

            {/* Section 2 */}
            <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
            <Text style={styles.paragraph}>
              We use the information we collect to:
            </Text>
            <Text style={styles.bulletPoint}>• Provide, maintain, and improve our services</Text>
            <Text style={styles.bulletPoint}>• Process transactions and send related information</Text>
            <Text style={styles.bulletPoint}>• Send you technical notices, updates, and support messages</Text>
            <Text style={styles.bulletPoint}>• Respond to your comments, questions, and requests</Text>
            <Text style={styles.bulletPoint}>• Monitor and analyze trends, usage, and activities</Text>
            <Text style={styles.bulletPoint}>• Detect, prevent, and address technical issues and fraudulent activity</Text>

            {/* Section 3 */}
            <Text style={styles.sectionTitle}>3. Information Sharing and Disclosure</Text>
            <Text style={styles.paragraph}>
              We do not sell, trade, or rent your personal information to third parties. We may share your information only:
            </Text>
            <Text style={styles.bulletPoint}>• With your consent</Text>
            <Text style={styles.bulletPoint}>• To comply with legal obligations</Text>
            <Text style={styles.bulletPoint}>• To protect our rights and safety</Text>
            <Text style={styles.bulletPoint}>• With service providers who assist us in operating our Platform (under strict confidentiality agreements)</Text>

            {/* Section 4 */}
            <Text style={styles.sectionTitle}>4. Data Security</Text>
            <Text style={styles.paragraph}>
              We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </Text>

            {/* Section 5 */}
            <Text style={styles.sectionTitle}>5. Data Retention</Text>
            <Text style={styles.paragraph}>
              We retain your personal information for as long as necessary to provide our services and comply with legal obligations. When we no longer need your information, we will securely delete or anonymize it.
            </Text>

            {/* Section 6 */}
            <Text style={styles.sectionTitle}>6. Your Rights</Text>
            <Text style={styles.paragraph}>
              Under Pakistan's Personal Data Protection Bill, you have the right to:
            </Text>
            <Text style={styles.bulletPoint}>• Access your personal information</Text>
            <Text style={styles.bulletPoint}>• Correct inaccurate data</Text>
            <Text style={styles.bulletPoint}>• Request deletion of your data</Text>
            <Text style={styles.bulletPoint}>• Object to processing of your data</Text>
            <Text style={styles.bulletPoint}>• Data portability</Text>
            <Text style={styles.paragraph}>
              To exercise these rights, please contact us at support@adryd.app.
            </Text>

            {/* Section 7 */}
            <Text style={styles.sectionTitle}>7. Cookies and Tracking Technologies</Text>
            <Text style={styles.paragraph}>
              We use cookies and similar tracking technologies to track activity on our Platform and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </Text>

            {/* Section 8 */}
            <Text style={styles.sectionTitle}>8. Third-Party Links</Text>
            <Text style={styles.paragraph}>
              Our Platform may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review the privacy policies of any third-party sites you visit.
            </Text>

            {/* Section 9 */}
            <Text style={styles.sectionTitle}>9. Children's Privacy</Text>
            <Text style={styles.paragraph}>
              Our Platform is not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
            </Text>

            {/* Section 10 */}
            <Text style={styles.sectionTitle}>10. Changes to This Privacy Policy</Text>
            <Text style={styles.paragraph}>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last update" date.
            </Text>

            {/* Section 11 */}
            <Text style={styles.sectionTitle}>11. Contact Us</Text>
            <Text style={styles.paragraph}>
              For any questions about this Privacy Policy, please contact:
            </Text>
            <Text style={styles.bulletPoint}>📧 support@adryd.app</Text>
            <Text style={styles.bulletPoint}>📍 ADRYD Marketing Co., Lahore, Pakistan</Text>
          </View>
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

      {/* Download Button - Always visible at bottom when viewing privacy policy */}
      <View style={styles.downloadButtonContainer}>
        <PrimaryButton
          title="Download"
          onPress={handleDownload}
          buttonStyle={styles.downloadButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingHorizontal: wp(4),
    paddingTop: Platform.OS === 'ios' ? 0 : hp(2),
    zIndex: 10,
    backgroundColor: '#F5F5F5',
  },
  helloBanner: {
    marginLeft: 17, 
    marginTop: hp(1.5),
    marginBottom: hp(2),
    padding: 15, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 17, 
    borderWidth: 0.7, 
    borderColor: '#E5E7EB', 
    width: Math.min(356, width - 34), 
    minHeight: 79,
    alignSelf: 'flex-start',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 17.1,
      },
      android: {
        elevation: 4,
      },
    }),
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
    paddingBottom: hp(15),
  },
  contentContainer: {
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#18181B',
    marginBottom: hp(1),
  },
  lastUpdateContainer: {
    marginBottom: hp(2),
  },
  lastUpdate: {
    fontSize: 12,
    fontWeight: '400',
    color: '#999999',
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
    lineHeight: 22,
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
    paddingBottom: Platform.OS === 'ios' ? hp(3) : hp(4),
    paddingTop: hp(2),
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    overflow: 'hidden',
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
    width: '50%',
  },
  downloadButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: wp(4),
    paddingBottom: Platform.OS === 'ios' ? hp(3) : hp(4),
    paddingTop: hp(2),
    backgroundColor: '#F5F5F5',
    borderTopWidth: 0,
    zIndex: 5,
  },
  downloadButton: {
    width: '60%',
    alignSelf: 'center',
  },
});

export default PrivacyPolicy;


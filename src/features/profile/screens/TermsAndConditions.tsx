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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BackButton from '../../../components/BackButton';
import PrimaryButton from '../../../components/PrimaryButton';
import { getTermsAgreed, setTermsAgreed } from '../../../services/storage';
import { useAuthStore } from '../../../store/authStore';

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

  const [hasAgreed, setHasAgreed] = useState<boolean>(false);
  const [showHelloBanner, setShowHelloBanner] = useState<boolean>(false);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
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
            Before you create an account, please read and accept our Terms and Condition.
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
          <Text style={styles.title}>Terms and Conditions</Text>
          <View style={styles.lastUpdateContainer}>
            <Text style={styles.lastUpdate}>Last update: Yesterday</Text>
          </View>

          <View style={styles.termsContent}>
            <Text style={styles.introText}>
              Welcome to ADRYD Marketing Co. ("ADRYD," "we," "our," or "us"). These Terms and
              Conditions ("Terms") govern your access to and use of our website{' '}
              <Text style={styles.link}>https://adryd.app</Text>, our mobile application, and all
              related services (collectively referred to as the "Platform").
            </Text>
            <Text style={styles.introText}>
              By using ADRYD, you agree to these Terms. Please read them carefully before accessing
              or using our services.
            </Text>

            {/* Section 1 */}
            <Text style={styles.sectionTitle}>1. Company Information</Text>
            <Text style={styles.paragraph}>
              ADRYD Marketing Co. is a registered business in Pakistan under Registration No.{' '}
              <Text style={styles.boldText}>3520028592305</Text>.
            </Text>
            <Text style={styles.paragraph}>Registered Office: Lahore, Pakistan.</Text>
            <Text style={styles.paragraph}>
              All operations comply with applicable Pakistani laws, including digital advertising and
              e-commerce regulations.
            </Text>

            {/* Section 2 */}
            <Text style={styles.sectionTitle}>2. Acceptance of Terms</Text>
            <Text style={styles.paragraph}>
              By accessing or using ADRYD's website, app, or services, you confirm that you:
            </Text>
            <Text style={styles.bulletPoint}>• Are at least 18 years old,</Text>
            <Text style={styles.bulletPoint}>• Agree to comply with these Terms, and</Text>
            <Text style={styles.bulletPoint}>
              • Provide accurate and truthful information when using our services.
            </Text>
            <Text style={styles.paragraph}>
              If you disagree with any part of these Terms, please discontinue using our Platform.
            </Text>

            {/* Section 3 */}
            <Text style={styles.sectionTitle}>3. Services Provided</Text>
            <Text style={styles.paragraph}>
              ADRYD offers branding, marketing, and advertising solutions — including but not
              limited to:
            </Text>
            <Text style={styles.bulletPoint}>• Outdoor and digital advertising campaigns,</Text>
            <Text style={styles.bulletPoint}>• Brand strategy and creative design,</Text>
            <Text style={styles.bulletPoint}>• Business marketing consultancy, and</Text>
            <Text style={styles.bulletPoint}>
              • Technology-driven media placement through our app.
            </Text>
            <Text style={styles.paragraph}>
              We reserve the right to modify, suspend, or discontinue any service at our discretion,
              without prior notice.
            </Text>

            {/* Section 4 */}
            <Text style={styles.sectionTitle}>4. User Accounts</Text>
            <Text style={styles.paragraph}>
              To access certain services, you may need to register an account.
            </Text>
            <Text style={styles.bulletPoint}>
              • You are responsible for maintaining the confidentiality of your login details.
            </Text>
            <Text style={styles.bulletPoint}>
              • You agree to notify ADRYD immediately of any unauthorized use of your account.
            </Text>
            <Text style={styles.bulletPoint}>
              • ADRYD reserves the right to suspend or terminate accounts for fraudulent or unlawful
              activity.
            </Text>

            {/* Section 5 */}
            <Text style={styles.sectionTitle}>5. Payments and Refunds</Text>
            <Text style={styles.bulletPoint}>
              • All payments are made in Pakistani Rupees (PKR) in compliance with the State Bank of
              Pakistan.
            </Text>
            <Text style={styles.bulletPoint}>
              • Service fees and advertising costs are non-refundable once work begins.
            </Text>
            <Text style={styles.bulletPoint}>
              • Refunds (if applicable) are processed only when ADRYD fails to deliver the agreed
              service due to internal issues.
            </Text>

            {/* Section 6 */}
            <Text style={styles.sectionTitle}>6. Intellectual Property Rights</Text>
            <Text style={styles.paragraph}>
              All content, branding, visuals, code, and data on ADRYD are intellectual property of
              ADRYD Marketing Co.
            </Text>
            <Text style={styles.paragraph}>
              Users may not copy, reproduce, or distribute any content without written consent from
              ADRYD.
            </Text>

            {/* Section 7 */}
            <Text style={styles.sectionTitle}>7. User Conduct</Text>
            <Text style={styles.paragraph}>Users agree not to:</Text>
            <Text style={styles.bulletPoint}>
              • Upload or share false, illegal, or misleading information,
            </Text>
            <Text style={styles.bulletPoint}>
              • Attempt unauthorized access to ADRYD systems, or
            </Text>
            <Text style={styles.bulletPoint}>
              • Violate any applicable Pakistani laws, including the Prevention of Electronic Crimes
              Act (PECA) 2016.
            </Text>
            <Text style={styles.paragraph}>
              Any violation may lead to account termination or legal action.
            </Text>

            {/* Section 8 */}
            <Text style={styles.sectionTitle}>8. Data and Privacy</Text>
            <Text style={styles.paragraph}>
              Your privacy is important to us. ADRYD collects only necessary data to operate its
              services, in line with Pakistan's Personal Data Protection Bill.
            </Text>
            <Text style={styles.paragraph}>
              Please review our Privacy Policy to learn more about how your information is collected
              and used.
            </Text>

            {/* Section 9 */}
            <Text style={styles.sectionTitle}>9. Limitation of Liability</Text>
            <Text style={styles.paragraph}>ADRYD is not liable for:</Text>
            <Text style={styles.bulletPoint}>• Any loss of profits or business opportunities,</Text>
            <Text style={styles.bulletPoint}>
              • Errors or interruptions in services caused by third parties, or
            </Text>
            <Text style={styles.bulletPoint}>
              • Unauthorized access or data breaches beyond our control.
            </Text>
            <Text style={styles.paragraph}>
              Our liability shall not exceed the total amount paid by you for the service in
              question.
            </Text>

            {/* Section 10 */}
            <Text style={styles.sectionTitle}>10. Indemnification</Text>
            <Text style={styles.paragraph}>
              You agree to indemnify and hold ADRYD, its directors, employees, and affiliates
              harmless against any claims, losses, or damages arising from your misuse of the
              Platform or violation of these Terms.
            </Text>

            {/* Section 11 */}
            <Text style={styles.sectionTitle}>11. Third-Party Links</Text>
            <Text style={styles.paragraph}>
              Our Platform may contain links to external sites for convenience. ADRYD does not
              endorse or take responsibility for third-party content or services.
            </Text>

            {/* Section 12 */}
            <Text style={styles.sectionTitle}>12. Governing Law and Jurisdiction</Text>
            <Text style={styles.paragraph}>These Terms are governed by the laws of Pakistan.</Text>
            <Text style={styles.paragraph}>
              All disputes shall fall under the exclusive jurisdiction of the courts in Lahore,
              Pakistan.
            </Text>

            {/* Section 13 */}
            <Text style={styles.sectionTitle}>13. Modifications to Terms</Text>
            <Text style={styles.paragraph}>
              ADRYD reserves the right to modify or update these Terms at any time. The updated
              version will be posted on our website. Continued use of our services after any change
              means you accept the revised Terms.
            </Text>

            {/* Section 14 */}
            <Text style={styles.sectionTitle}>14. Refund Policy</Text>
            <Text style={styles.bulletPoint}>
              • If your advertisement is approved and its advertising has started, no refund will be
              issued under any circumstances.
            </Text>
            <Text style={styles.bulletPoint}>
              • If your advertisement is not approved yet and you cancel the ad before approval,
              your payment will be refunded within 7 to 10 business days.
            </Text>
            <Text style={styles.bulletPoint}>
              • Refunds will be made through the same payment method used during the transaction.
            </Text>
            <Text style={styles.bulletPoint}>
              • ADRYD reserves the right to withhold refunds if a user violates any of our Terms
              or submits fraudulent activity.
            </Text>

            {/* Section 15 */}
            <Text style={styles.sectionTitle}>15. Contact Us</Text>
            <Text style={styles.paragraph}>
              For any questions regarding these Terms, please contact:
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    paddingHorizontal: wp(4),
    paddingTop: Platform.OS === 'ios' ? 0 : hp(2),
    zIndex: 10,
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
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: hp(20),
  },
  contentContainer: {
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#000000',
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
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginTop: hp(2.5),
    marginBottom: hp(1),
  },
  paragraph: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
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
});

export default TermsAndConditions;

import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BackButton from '../../../components/BackButton';
import { getTermsAgreed, setTermsAgreed } from '../../../services/storage';

const { width, height } = Dimensions.get('window');

interface TermsAndConditionsProps {
  route?: {
    params?: {
      fromAuth?: boolean;
      user?: any;
    };
  };
}

const TermsAndConditions: React.FC<TermsAndConditionsProps> = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = (route.params as any) || {};
  const fromAuth = params.fromAuth || false;

  const [hasAgreed, setHasAgreed] = useState<boolean>(false);
  const [showHelloBanner, setShowHelloBanner] = useState<boolean>(false);
  const [isChecked, setIsChecked] = useState<boolean>(false);

  useEffect(() => {
    checkTermsAgreement();
  }, []);

  const checkTermsAgreement = async () => {
    try {
      const agreed = await getTermsAgreed();
      setHasAgreed(agreed);
      setShowHelloBanner(!agreed || fromAuth);
      setIsChecked(agreed);
    } catch (error) {
      console.error('Error checking terms agreement:', error);
      setShowHelloBanner(true);
    }
  };

  const handleCheckboxToggle = () => {
    setIsChecked(!isChecked);
  };

  const handleContinue = async () => {
    if (!isChecked) {
      return; // Don't proceed if checkbox is not checked
    }
    try {
      await setTermsAgreed(true);
      setHasAgreed(true);
      setShowHelloBanner(false);
      
      // Just go back after accepting terms
      navigation.goBack();
    } catch (error) {
      console.error('Error saving terms agreement:', error);
    }
  };

  const handleDisagree = () => {
    navigation.goBack();
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
        <LinearGradient
          colors={['#FFF4FD', '#FEF3F9', '#FFFFFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.helloBanner}
        >
          <View style={styles.helloIconContainer}>
            <Ionicons name="document-text" size={28} color="#C539A5" />
          </View>
          <Text style={styles.helloTitle}>Hello</Text>
          <Text style={styles.helloSubtitle}>
            Before you create an account, please read and accept our Terms and Conditions.
          </Text>
        </LinearGradient>
      )}

      {/* Terms Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          <View style={styles.titleContainer}>
            <View style={styles.titleIconContainer}>
              <Ionicons name="shield-checkmark" size={32} color="#C539A5" />
            </View>
            <Text style={styles.title}>Terms and Conditions</Text>
          </View>
          <View style={styles.lastUpdateContainer}>
            <Ionicons name="time-outline" size={14} color="#999999" />
            <Text style={styles.lastUpdate}>Last update: Yesterday</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.termsContent}>
            <Text style={styles.paragraph}>
              Welcome to ADRYD Marketing Co.
            </Text>
            <Text style={styles.paragraph}>
              These Terms and Conditions ("Terms") govern your access and use of our website{' '}
              <Text style={styles.link}>https://adryd.app</Text>, mobile application, and related services
              (collectively referred to as the "Service").
            </Text>
            <Text style={styles.paragraph}>
              Please read them carefully before accessing or using our service: Ammar Hameed
            </Text>

            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>1</Text>
              </View>
              <Text style={styles.sectionTitle}>Company Information</Text>
            </View>
            <Text style={styles.paragraph}>
              ADRYD Marketing Co. is a registered business in Pakistan under Registration No. 3520028592305.
            </Text>
            <Text style={styles.paragraph}>
              Registered Office: Lahore, Pakistan.
            </Text>
            <Text style={styles.paragraph}>
              All operations comply with applicable Pakistani laws, including digital advertising and e-commerce regulations.
            </Text>

            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>2</Text>
              </View>
              <Text style={styles.sectionTitle}>Acceptance of Terms</Text>
            </View>
            <Text style={styles.paragraph}>
              By accessing or using ADRYD's website, app, or services, you confirm that you:
            </Text>
            <Text style={styles.paragraph}>
              • Are at least 18 years of age or have parental/guardian consent
            </Text>
            <Text style={styles.paragraph}>
              • Have the legal capacity to enter into binding agreements
            </Text>
            <Text style={styles.paragraph}>
              • Will comply with all applicable laws and regulations
            </Text>
            <Text style={styles.paragraph}>
              • Will provide accurate and truthful information
            </Text>

            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>3</Text>
              </View>
              <Text style={styles.sectionTitle}>Minors</Text>
            </View>
            <Text style={styles.paragraph}>
              Minors or people below 18 years old are not allowed to use this Website.
            </Text>

            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>4</Text>
              </View>
              <Text style={styles.sectionTitle}>Intellectual Property Rights</Text>
            </View>
            <Text style={styles.paragraph}>
              Other than the content you own, under these Terms, ADRYD Marketing Co. and/or its licensors own all the intellectual property rights and materials contained in this Website.
            </Text>
            <Text style={styles.paragraph}>
              These Terms will be applied fully and affect to your use of this Website. By using this Website, you agreed to accept all terms and conditions written in here.
            </Text>

            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>5</Text>
              </View>
              <Text style={styles.sectionTitle}>Restrictions</Text>
            </View>
            <Text style={styles.paragraph}>
              You are specifically restricted from all of the following:
            </Text>
            <Text style={styles.paragraph}>
              • Publishing any Website material in any other media
            </Text>
            <Text style={styles.paragraph}>
              • Selling, sublicensing and/or otherwise commercializing any Website material
            </Text>
            <Text style={styles.paragraph}>
              • Publicly performing and/or showing any Website material
            </Text>
            <Text style={styles.paragraph}>
              • Using this Website in any way that is or may be damaging to this Website
            </Text>
            <Text style={styles.paragraph}>
              • Using this Website in any way that impacts user access to this Website
            </Text>

            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>6</Text>
              </View>
              <Text style={styles.sectionTitle}>Your Content</Text>
            </View>
            <Text style={styles.paragraph}>
              In these Terms and Conditions, "Your Content" shall mean any audio, video text, images or other material you choose to display on this Website. By displaying Your Content, you grant ADRYD Marketing Co. a non-exclusive, worldwide irrevocable, sub-licensable license to use, reproduce, adapt, publish, translate and distribute it in any and all media.
            </Text>

            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>7</Text>
              </View>
              <Text style={styles.sectionTitle}>No Warranties</Text>
            </View>
            <Text style={styles.paragraph}>
              This Website is provided "as is," with all faults, and ADRYD Marketing Co. express no representations or warranties, of any kind related to this Website or the materials contained on this Website.
            </Text>

            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>8</Text>
              </View>
              <Text style={styles.sectionTitle}>Limitation of Liability</Text>
            </View>
            <Text style={styles.paragraph}>
              In no event shall ADRYD Marketing Co., nor any of its officers, directors and employees, shall be held liable for anything arising out of or in any way connected with your use of this Website whether such liability is under contract.
            </Text>

            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>9</Text>
              </View>
              <Text style={styles.sectionTitle}>Indemnification</Text>
            </View>
            <Text style={styles.paragraph}>
              You hereby indemnify to the fullest extent ADRYD Marketing Co. from and against any and/or all liabilities, costs, demands, causes of action, damages and expenses arising in any way related to your breach of any of the provisions of these Terms.
            </Text>

            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>10</Text>
              </View>
              <Text style={styles.sectionTitle}>Severability</Text>
            </View>
            <Text style={styles.paragraph}>
              If any provision of these Terms is found to be invalid under any applicable law, such provisions shall be deleted without affecting the remaining provisions herein.
            </Text>

            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>11</Text>
              </View>
              <Text style={styles.sectionTitle}>Variation of Terms</Text>
            </View>
            <Text style={styles.paragraph}>
              ADRYD Marketing Co. is permitted to revise these Terms at any time as it sees fit, and by using this Website you are expected to review these Terms on a regular basis.
            </Text>

            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>12</Text>
              </View>
              <Text style={styles.sectionTitle}>Assignment</Text>
            </View>
            <Text style={styles.paragraph}>
              ADRYD Marketing Co. is allowed to assign, transfer, and subcontract its rights and/or obligations under these Terms without any notification. However, you are not allowed to assign, transfer, or subcontract any of your rights and/or obligations under these Terms.
            </Text>

            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>13</Text>
              </View>
              <Text style={styles.sectionTitle}>Entire Agreement</Text>
            </View>
            <Text style={styles.paragraph}>
              These Terms constitute the entire agreement between ADRYD Marketing Co. and you in relation to your use of this Website, and supersede all prior agreements and understandings.
            </Text>

            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>14</Text>
              </View>
              <Text style={styles.sectionTitle}>Governing Law & Jurisdiction</Text>
            </View>
            <Text style={styles.paragraph}>
              These Terms will be governed by and interpreted in accordance with the laws of Pakistan, and you submit to the non-exclusive jurisdiction of the state and federal courts located in Pakistan for the resolution of any disputes.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkbox and Continue Button - Only shown if user hasn't agreed or from auth */}
      {showHelloBanner && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={handleCheckboxToggle}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
              {isChecked && (
                <Ionicons name="checkmark" size={20} color="#FFFFFF" style={styles.checkmarkIcon} />
              )}
            </View>
            <Text style={styles.checkboxText}>I agree with terms and conditions</Text>
          </TouchableOpacity>
          
          <LinearGradient
            colors={isChecked ? ['#C539A5', '#E91E63'] : ['#D0D0D0', '#D0D0D0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.continueButton, !isChecked && styles.continueButtonDisabled]}
          >
            <TouchableOpacity
              onPress={handleContinue}
              activeOpacity={0.8}
              disabled={!isChecked}
              style={styles.continueButtonTouchable}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.continueIcon} />
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    paddingHorizontal: width * 0.04,
    paddingTop: Platform.OS === 'ios' ? 0 : height * 0.02,
    zIndex: 10,
  },
  helloBanner: {
    marginHorizontal: width * 0.04,
    marginTop: height * 0.015,
    marginBottom: height * 0.02,
    padding: width * 0.06,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(197, 57, 165, 0.15)',
    shadowColor: '#C539A5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  helloIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(197, 57, 165, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  helloTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  helloSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#555555',
    lineHeight: 24,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: height * 0.2,
  },
  contentContainer: {
    paddingHorizontal: width * 0.04,
    paddingTop: height * 0.02,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(197, 57, 165, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#000000',
    flex: 1,
    letterSpacing: 0.3,
  },
  lastUpdateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  lastUpdate: {
    fontSize: 13,
    fontWeight: '500',
    color: '#999999',
    marginLeft: 6,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginBottom: 24,
  },
  termsContent: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  sectionNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#C539A5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  sectionNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
    letterSpacing: 0.3,
  },
  paragraph: {
    fontSize: 15,
    fontWeight: '400',
    color: '#444444',
    lineHeight: 26,
    marginBottom: 20,
    letterSpacing: 0.1,
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
    paddingHorizontal: width * 0.04,
    paddingBottom: Platform.OS === 'ios' ? height * 0.03 : height * 0.04,
    paddingTop: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2.5,
    borderColor: '#C539A5',
    backgroundColor: '#FFFFFF',
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C539A5',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  checkboxChecked: {
    backgroundColor: '#C539A5',
    borderColor: '#C539A5',
  },
  checkmarkIcon: {
    fontWeight: 'bold',
  },
  checkboxText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
    letterSpacing: 0.2,
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#C539A5',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.8,
    marginRight: 8,
  },
  continueIcon: {
    marginLeft: 4,
  },
});

export default TermsAndConditions;


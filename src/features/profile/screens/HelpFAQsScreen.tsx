import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { AppStackParamList } from '../../../app/navigation/AppNavigator';
import BackButton from '../../../components/BackButton';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const { width, height } = Dimensions.get('window');

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

const HelpFAQsScreen: React.FC = () => {
  // const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const scrollViewRef = useRef<ScrollView>(null);
  const faqAnimations = useRef<{ [key: string]: Animated.Value }>({});
  const navigation = useNavigation<NavigationProp>();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const handleBackPress = () => {
    navigation.goBack();
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const faqData: FAQItem[] = [
    {
      id: '1',
      category: 'account',
      question: 'How do I create an account?',
      answer:
        'To create an account, click on the "Register" button on the login screen. You will need to provide your phone number, username, company name, and password. After registration, you will receive an OTP code to verify your account.',
    },
    {
      id: '2',
      category: 'account',
      question: 'How do I reset my password?',
      answer:
        'If you forgot your password, click on "Forgot Password" on the login screen. Enter your phone number and you will receive an OTP code to reset your password.',
    },
    {
      id: '3',
      category: 'boards',
      question: 'How do I create an advertisement board?',
      answer:
        'To create an advertisement board, navigate to the "Add" tab in the bottom navigation. Select your company, fill in the board details including title, description, location, size, and price. Upload images and submit your advertisement.',
    },
    {
      id: '4',
      category: 'boards',
      question: 'How do I edit or delete my board?',
      answer:
        'Go to your board details page and tap the edit icon. You can modify any information or delete the board if needed. Changes will be reflected immediately.',
    },
    {
      id: '5',
      category: 'payment',
      question: 'What payment methods do you accept?',
      answer:
        'We accept various payment methods including credit cards, debit cards, and bank transfers. All transactions are secure and encrypted.',
    },
    {
      id: '6',
      category: 'payment',
      question: 'Are there any fees for using the platform?',
      answer:
        'ADRYD offers competitive fee structures. For detailed information about our fees, please check the "Fees & Charges" section in your account settings or contact our support team.',
    },
    {
      id: '7',
      category: 'general',
      question: 'How do I contact customer support?',
      answer:
        'You can contact our support team through the "Contact Support" option in the drawer menu, or by sending us a message directly from the app. We respond to all inquiries within 24 hours.',
    },
    {
      id: '8',
      category: 'general',
      question: 'How do I report a problem or complaint?',
      answer:
        'You can lodge a complaint by contacting our support team through the "Contact Support" option, or by calling our customer service hotline. We take all complaints seriously and will respond within 24 hours.',
    },
    {
      id: '9',
      category: 'general',
      question: 'Is my data secure?',
      answer:
        'Yes, we take data security seriously. All your personal information and data are encrypted and stored securely. We comply with all applicable data protection regulations.',
    },
    {
      id: '10',
      category: 'account',
      question: 'How do I update my profile information?',
      answer:
        'Go to your profile section, tap on the edit icon, and update your information. You can change your name, phone number, and profile picture. Changes are saved automatically.',
    },
  ];

  const highlightCards = [
    {
      id: 'payment',
      category: 'payment',
      leadingLabel: 'Questions about',
      title: 'Payment',
      icon: 'card-outline',
      backgroundColor: '#C8EFDB',
      borderColor: '#FFFFFF',
      iconColor: '#36BD79',
    },
    {
      id: 'account',
      category: 'account',
      leadingLabel: 'Questions about',
      title: 'Getting Started',
      icon: 'rocket-outline',
      backgroundColor: '#FDE7FB',
      borderColor: '#FFFFFF',
      iconColor: '#C539A5',
    },
    {
      id: 'general',
      category: 'general',
      leadingLabel: 'Questions about',
      title: 'How To Invest',
      icon: 'trending-up-outline',
      backgroundColor: '#FEEFC9',
      borderColor: '#FFFFFF',
      iconColor: '#BD8700',
    },
    {
      id: 'all',
      category: 'all',
      leadingLabel: 'Browse all',
      title: 'Help Topics',
      icon: 'help-circle-outline',
      backgroundColor: '#D6E5FD',
      borderColor: '#FFFFFF',
      iconColor: '#0046B7',
    },
    {
      id: 'blocked',
      category: 'blocked',
      leadingLabel: 'Questions about',
      title: 'Blocked Accounts',
      icon: 'lock-closed-outline',
      backgroundColor: '#EB9A9B',
      borderColor: '#FFFFFF',

      iconColor: '#E61215',
    },
    {
      id: 'terms',
      category: 'terms',
      leadingLabel: 'Learn about',
      title: 'Terms & Conditions',
      icon: 'document-text-outline',
      backgroundColor: '#E5E7EB',
      borderColor: '#FFFFFF',

      iconColor: '#00000033',
    },
  ];

  const filteredFAQ = faqData.filter(item => {
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFAQPress = (id: string) => {
    if (!faqAnimations.current[id]) {
      faqAnimations.current[id] = new Animated.Value(0);
    }

    const isExpanding = expandedFAQ !== id;
    setExpandedFAQ(isExpanding ? id : null);

    Animated.timing(faqAnimations.current[id], {
      toValue: isExpanding ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleContactSupport = () => {
    navigation.navigate('ContactSupportScreen' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Back Button */}

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={['#FDF4FB', '#FDF1F7', '#FFF3F9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.heroSection}
        >
          <BackButton />
          <Text style={styles.greetingTitle}>Hi</Text>
          <Text style={styles.heroSubtitle}>How can we help you?</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.highlightRow}
            style={styles.highlightScrollView}
            bounces={false}
          >
            {highlightCards.map(card => (
              <TouchableOpacity
                key={card.id}
                style={[
                  styles.highlightCard,
                  {
                    backgroundColor: card.backgroundColor,
                    borderColor: card.borderColor,
                  },
                  selectedCategory === card.category &&
                    styles.highlightCardActive,
                ]}
                onPress={() => navigation.navigate('FAQsScreen', { card })}
                activeOpacity={0.85}
              >
                <View style={styles.highlightIconBackground}>
                  <Ionicons
                    name={card.icon as any}
                    size={18}
                    color={card.iconColor}
                  />
                </View>
                <View>
                  <Text style={styles.highlightLabel}>{card.leadingLabel}</Text>
                  <Text style={styles.highlightTitle}>{card.title}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </LinearGradient>
        <TouchableOpacity
          onPress={() => navigation.navigate('ChatScreen' as never)}
          activeOpacity={0.8}
        >
          <View style={styles.messageBubble}>
            <Text style={styles.messageLabel}>Message</Text>
            <View
              style={{
                width: 'auto',
                height: 0,
                borderWidth: 0.4,
                borderColor: '#E5E7EB',
              }}
            />
            <Text style={styles.messageText}>Help</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionHeading}>Top Questions</Text>
        <Animated.View
          style={[
            styles.faqSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.searchWrapper}>
            <Ionicons
              name="search"
              size={15}
              color="#AEB0C8"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for help..."
              placeholderTextColor="#70737D"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={18} color="#AEB0C8" />
              </TouchableOpacity>
            )}
          </View>
          {filteredFAQ.length === 0 ? (
            <View style={styles.noResultsContainer}>
              <Ionicons name="search" size={60} color="#E0E0E0" />
              <Text style={styles.noResultsText}>No results found</Text>
              <Text style={styles.noResultsSubtext}>
                Try searching with different keywords or select another category
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                style={styles.clearSearchButton}
              >
                <Text style={styles.clearSearchText}>Clear Filters</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.faqList}>
              {filteredFAQ.map((item, index) => {
                const isExpanded = expandedFAQ === item.id;

                return (
                  <Animated.View
                    key={item.id}
                    style={[
                      styles.faqCard,
                      {
                        backgroundColor: isExpanded ? '#FFFFFF' : '#F5F5F5', // ← CHANGE
                        opacity: fadeAnim,
                        transform: [
                          {
                            translateY: slideAnim.interpolate({
                              inputRange: [0, 30],
                              outputRange: [0, 30 + index * 4],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.faqQuestionContainer}
                      onPress={() => handleFAQPress(item.id)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={styles.faqQuestion}
                        numberOfLines={isExpanded ? 0 : 2}
                      >
                        {item.question}
                      </Text>
                      <View
                        style={[
                          styles.faqIconContainer,
                          isExpanded && styles.faqIconContainerExpanded,
                        ]}
                      >
                        <Ionicons
                          name={isExpanded ? 'remove' : 'add'}
                          size={24}
                          color={isExpanded ? '#70737D' : '#70737D'}
                        />
                      </View>
                    </TouchableOpacity>

                    {isExpanded && (
                      <Animated.View
                        style={[
                          styles.faqAnswerContainer,
                          {
                            opacity: faqAnimations.current[item.id] || 0,
                            transform: [
                              {
                                translateY:
                                  faqAnimations.current[item.id]?.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-10, 0],
                                  }) || -10,
                              },
                            ],
                          },
                        ]}
                      >
                        <View style={styles.faqAnswerDivider} />
                        <Text style={styles.faqAnswer}>{item.answer}</Text>
                      </Animated.View>
                    )}
                  </Animated.View>
                );
              })}
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },

  scrollView: {
    flex: 1,
    overflow: 'visible',
  },
  scrollContent: {
    paddingBottom: height * 0.1,
  },
  heroSection: {
    paddingHorizontal: 25,
    paddingTop: 70,
    paddingBottom: 10,
    // borderBottomLeftRadius: 36,
    // borderBottomRightRadius: 36,
    overflow: 'visible',
  },

  greetingTitle: {
    fontFamily: 'Inter',
    fontSize: 22,
    fontWeight: '800',
    color: '#000000',
    lineHeight: 28,
    letterSpacing: 0,
    marginTop: 12,
  },
  heroSubtitle: {
    fontFamily: 'Inter',
    fontSize: 22,
    fontWeight: '900',
    color: '#000000',
    lineHeight: 24,
    letterSpacing: 0,
    marginTop: 4,
  },
  highlightScrollView: {
    marginLeft: -32,
    paddingLeft: 32,
    marginRight: -32,
    overflow: 'visible',
  },
  highlightRow: {
    marginTop: 18,
    paddingVertical: 6,
    paddingRight: 40,
    paddingLeft: 0,
  },
  highlightCard: {
    width: 141,
    minHeight: 126,
    borderRadius: 12,
    borderWidth: 0.7,
    padding: 10,
    marginRight: 10,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    // marginBottom: 5,
  },
  highlightCardActive: {
    borderColor: '#C8EFDB',
  },
  highlightIconBackground: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  highlightLabel: {
    fontSize: 10,
    fontWeight: '400',
    color: '#000000',
  },
  highlightTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000000',
  },
  messageBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 16,
    marginTop: 20,
    borderWidth: 0.3,
    borderColor: '#E5E7EB',
    width: width * 0.88,
    alignSelf: 'center',
    marginBottom: 20,
  },
  messageLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#18181B',
    marginBottom: 10,
  },
  messageText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#18181B',
    marginTop: 10,
  },
  contentWrapper: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    marginTop: 0,
    paddingTop: 24,
    paddingHorizontal: width * 0.06,
    paddingBottom: 8,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#141414',
    marginBottom: 2,
    paddingHorizontal: 27,
  },

  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: height * 0.052,
    backgroundColor: '#FFFFFF',
    borderRadius: 7,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: width * 0.03,
    gap: width * 0.02,
    marginBottom: height * 0.019,
    marginTop: height * 0.01,
  },
  searchIcon: {
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    fontWeight: '300',
    height: '100%',
  },
  clearButton: {
    padding: 2,
  },
  faqSection: {
    width: width * 0.88,
    height: 'auto',
    paddingHorizontal: width * 0.06,
    marginTop: 12,
    paddingTop: 12,
    paddingBottom: 12,
    borderWidth: 1,
    backgroundColor: 'white',
    borderRadius: 15,
    borderColor: '#E5E7EB',
    alignSelf: 'center',
  },
  faqList: {
    marginTop: 0,
  },
  faqCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    borderWidth: 0.7,
    marginBottom: 12,
    overflow: 'hidden',
    borderColor: '#E5E7EB',
  },
  faqQuestionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 56,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: '#18181B',
    lineHeight: 20,
    marginRight: 12,
  },
  faqIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 0,
  },
  faqIconContainerExpanded: {
    backgroundColor: 'transparent',
  },
  faqAnswerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: 0,
  },
  faqAnswerDivider: {
    height: 0,
    backgroundColor: 'transparent',
  },
  faqAnswer: {
    fontSize: 12,
    fontWeight: '400',
    color: '#70737D',
    lineHeight: 20,
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  noResultsText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 18,
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 15,
    fontWeight: '400',
    color: '#8E8E99',
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 22,
  },
  clearSearchButton: {
    backgroundColor: '#C539A5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  clearSearchText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default HelpFAQsScreen;

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  TextInput,
  Animated,
} from 'react-native';
import Header from '../../../components/Header';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BackButton from '../../../components/BackButton';

const { width, height } = Dimensions.get('window');

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

const HelpFAQsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const scrollViewRef = useRef<ScrollView>(null);
  const faqAnimations = useRef<{ [key: string]: Animated.Value }>({});

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
      answer: 'To create an account, click on the "Register" button on the login screen. You will need to provide your phone number, username, company name, and password. After registration, you will receive an OTP code to verify your account.',
    },
    {
      id: '2',
      category: 'account',
      question: 'How do I reset my password?',
      answer: 'If you forgot your password, click on "Forgot Password" on the login screen. Enter your phone number and you will receive an OTP code to reset your password.',
    },
    {
      id: '3',
      category: 'boards',
      question: 'How do I create an advertisement board?',
      answer: 'To create an advertisement board, navigate to the "Add" tab in the bottom navigation. Select your company, fill in the board details including title, description, location, size, and price. Upload images and submit your advertisement.',
    },
    {
      id: '4',
      category: 'boards',
      question: 'How do I edit or delete my board?',
      answer: 'Go to your board details page and tap the edit icon. You can modify any information or delete the board if needed. Changes will be reflected immediately.',
    },
    {
      id: '5',
      category: 'payment',
      question: 'What payment methods do you accept?',
      answer: 'We accept various payment methods including credit cards, debit cards, and bank transfers. All transactions are secure and encrypted.',
    },
    {
      id: '6',
      category: 'payment',
      question: 'Are there any fees for using the platform?',
      answer: 'ADRYD offers competitive fee structures. For detailed information about our fees, please check the "Fees & Charges" section in your account settings or contact our support team.',
    },
    {
      id: '7',
      category: 'general',
      question: 'How do I contact customer support?',
      answer: 'You can contact our support team through the "Contact Support" option in the drawer menu, or by sending us a message directly from the app. We respond to all inquiries within 24 hours.',
    },
    {
      id: '8',
      category: 'general',
      question: 'How do I report a problem or complaint?',
      answer: 'You can lodge a complaint by contacting our support team through the "Contact Support" option, or by calling our customer service hotline. We take all complaints seriously and will respond within 24 hours.',
    },
    {
      id: '9',
      category: 'general',
      question: 'Is my data secure?',
      answer: 'Yes, we take data security seriously. All your personal information and data are encrypted and stored securely. We comply with all applicable data protection regulations.',
    },
    {
      id: '10',
      category: 'account',
      question: 'How do I update my profile information?',
      answer: 'Go to your profile section, tap on the edit icon, and update your information. You can change your name, phone number, and profile picture. Changes are saved automatically.',
    },
  ];

  const highlightCards = [
    {
      id: 'payment',
      category: 'payment',
      leadingLabel: 'Questions about',
      title: 'Payment',
      icon: 'card',
      backgroundColor: '#E4F6EB',
      borderColor: '#CFEFDF',
      iconBackground: 'rgba(37, 186, 122, 0.16)',
      iconColor: '#1F9E74',
    },
    {
      id: 'account',
      category: 'account',
      leadingLabel: 'Questions about',
      title: 'Getting Started',
      icon: 'rocket',
      backgroundColor: '#FFE7F4',
      borderColor: '#FFDAED',
      iconBackground: 'rgba(241, 94, 150, 0.18)',
      iconColor: '#D13A9E',
    },
    {
      id: 'general',
      category: 'general',
      leadingLabel: 'Questions about',
      title: 'How To Invest',
      icon: 'trending-up',
      backgroundColor: '#FFF5DB',
      borderColor: '#FFE7C0',
      iconBackground: 'rgba(243, 176, 52, 0.2)',
      iconColor: '#D27B21',
    },
    {
      id: 'all',
      category: 'all',
      leadingLabel: 'Browse all',
      title: 'Help Topics',
      icon: 'help-circle',
      backgroundColor: '#F4F4F9',
      borderColor: '#E8E8F2',
      iconBackground: 'rgba(106, 112, 255, 0.14)',
      iconColor: '#525BFF',
    },
  ];

  const filteredFAQ = faqData.filter(item => {
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
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

       <BackButton/>

      {/* Hero Banner */}
      <LinearGradient
        colors={['#FFF4FD', '#FEF3F9', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroBanner}
      >
        <View style={styles.heroIconContainer}>
          <Ionicons name="help-circle" size={40} color="#C539A5" />
        </View>
        <Text style={styles.heroTitle}>Help & FAQs</Text>
        <Text style={styles.heroSubtitle}>
          Find answers to common questions and get the help you need
        </Text>
      </LinearGradient>

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
          end={{ x: 1, y: 1 }}
          style={styles.heroSection}
        >
          <Text style={styles.greetingTitle}>Hi Umair</Text>
          <Text style={styles.heroSubtitle}>How can we help you?</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.highlightRow}
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
                  selectedCategory === card.category && styles.highlightCardActive,
                ]}
                onPress={() => setSelectedCategory(card.category)}
                activeOpacity={0.85}
              >
                <View
                  style={[
                    styles.highlightIconBackground,
                    { backgroundColor: card.iconBackground },
                  ]}
                >
                  <Ionicons name={card.icon as any} size={18} color={card.iconColor} />
                </View>
                <Text style={styles.highlightLabel}>{card.leadingLabel}</Text>
                <Text style={styles.highlightTitle}>{card.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        <View style={styles.messageBubble}>
          <Text style={styles.messageLabel}>Message</Text>
          <Text style={styles.messageText}>Help</Text>
        </View>
        </LinearGradient>

        <Animated.View
          style={[
            styles.contentWrapper,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.sectionHeading}>Top Questions</Text>
          <Text style={styles.sectionSubheading}>
            Browse curated answers or search for help instantly.
          </Text>
          <View style={styles.searchWrapper}>
            <Ionicons name="search" size={18} color="#AEB0C8" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for help..."
              placeholderTextColor="#C8CAD7"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={18} color="#AEB0C8" />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.faqSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
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
                      <Text style={styles.faqQuestion} numberOfLines={isExpanded ? 0 : 2}>
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
                          size={20}
                          color={isExpanded ? '#4F2D6C' : '#C539A5'}
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

        <Animated.View
          style={[
            styles.ctaSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['#C539A5', '#E91E63']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaCard}
          >
            <View style={styles.ctaIconContainer}>
              <Ionicons name="chatbubble-ellipses" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.ctaTitle}>Still need help?</Text>
            <Text style={styles.ctaSubtitle}>
              Our support team is here to assist you 24/7
            </Text>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={handleContactSupport}
              activeOpacity={0.8}
            >
              <Text style={styles.ctaButtonText}>Contact Support</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={styles.ctaIcon} />
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },

  heroBanner: {
    marginHorizontal: width * 0.04,
    marginTop: height * 0.11,
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
    alignItems: 'center',
  },
  heroIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(197, 57, 165, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: height * 0.1,
  },
  heroSection: {
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 36,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
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
  highlightRow: {
    marginTop: 18,
    paddingVertical: 6,
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
    marginBottom: 20,
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
    fontSize: 12,
    fontWeight: '500',
    color: '#5C5C62',
    marginBottom: 4,
  },
  highlightTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1A1F',
  },
  messageBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 16,
    marginTop: 20,
    borderWidth: 0.3,
    borderColor: '#E5E7EB',
  },
  messageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8A8A96',
    marginBottom: 10,
  },
  messageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8A8A96',
  },
  contentWrapper: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    paddingTop: 32,
    paddingHorizontal: width * 0.06,
    paddingBottom: 8,
  },
  sectionHeading: {
    fontSize: 24,
    fontWeight: '800',
    color: '#141414',
    marginBottom: 6,
  },
  sectionSubheading: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6A6D78',
    marginBottom: 18,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 300,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 7,
    borderWidth: 0.7,
    borderColor: '#E5E7EB',
    paddingHorizontal: 10,
    gap: 5,
    marginBottom: 8,
  },
  searchIcon: {
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1E1E1E',
    height: '100%',
  },
  clearButton: {
    padding: 2,
  },
  faqSection: {
    paddingHorizontal: width * 0.04,
    marginTop: 12,
  },
  faqList: {
    marginTop: 12,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ECECF5',
    marginBottom: 14,
    overflow: 'hidden',
  },
  faqQuestionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
    lineHeight: 22,
  },
  faqIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F3F3F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  faqIconContainerExpanded: {
    backgroundColor: '#EFD7EC',
  },
  faqAnswerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 18,
  },
  faqAnswerDivider: {
    height: 1,
    backgroundColor: '#E4E4EC',
    marginBottom: 14,
  },
  faqAnswer: {
    fontSize: 15,
    fontWeight: '400',
    color: '#4C4C54',
    lineHeight: 22,
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
  ctaSection: {
    paddingHorizontal: width * 0.04,
    marginTop: 24,
    marginBottom: height * 0.05,
  },
  ctaCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#C539A5',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  ctaSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 8,
    letterSpacing: 0.5,
  },
  ctaIcon: {
    marginLeft: 4,
  },
});

export default HelpFAQsScreen;


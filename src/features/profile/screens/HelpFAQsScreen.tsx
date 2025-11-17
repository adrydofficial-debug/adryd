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
  Platform,
  TextInput,
  Animated,
} from 'react-native';
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

  const categories = [
    { id: 'all', label: 'All', icon: 'apps' },
    { id: 'account', label: 'Account', icon: 'person' },
    { id: 'boards', label: 'Boards', icon: 'grid' },
    { id: 'payment', label: 'Payment', icon: 'card' },
    { id: 'general', label: 'General', icon: 'help-circle' },
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

      {/* Header with Back Button */}
      <View style={styles.header}>
        <BackButton iconColor="#000" />
      </View>

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
        {/* Search Section */}
        <Animated.View
          style={[
            styles.searchSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={22} color="#C539A5" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for help..."
              placeholderTextColor="#999999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#999999" />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* Category Filter */}
        <Animated.View
          style={[
            styles.categorySection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryContainer}
          >
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(category.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={category.icon as any}
                  size={18}
                  color={selectedCategory === category.id ? '#FFFFFF' : '#C539A5'}
                  style={styles.categoryIcon}
                />
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category.id && styles.categoryTextActive,
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* FAQ Section */}
        <Animated.View
          style={[
            styles.faqSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Ionicons name="document-text" size={24} color="#C539A5" />
            </View>
            <Text style={styles.sectionTitle}>
              {filteredFAQ.length} {filteredFAQ.length === 1 ? 'Question' : 'Questions'} Found
            </Text>
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
                        opacity: fadeAnim,
                        transform: [
                          {
                            translateY: slideAnim.interpolate({
                              inputRange: [0, 30],
                              outputRange: [0, 30 + index * 5],
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
                      <View style={styles.faqQuestionLeft}>
                        <View style={styles.faqNumberBadge}>
                          <Text style={styles.faqNumberText}>{index + 1}</Text>
                        </View>
                        <Text style={styles.faqQuestion} numberOfLines={isExpanded ? 0 : 2}>
                          {item.question}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.faqIconContainer,
                          isExpanded && styles.faqIconContainerExpanded,
                        ]}
                      >
                        <Ionicons
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={20}
                          color="#C539A5"
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
                                translateY: faqAnimations.current[item.id]?.interpolate({
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

        {/* Contact Support CTA */}
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
  header: {
    paddingHorizontal: width * 0.04,
    paddingTop: Platform.OS === 'ios' ? 0 : height * 0.02,
    zIndex: 10,
  },
  heroBanner: {
    marginHorizontal: width * 0.04,
    marginTop: height * 0.01,
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
  heroSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666666',
    lineHeight: 22,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: height * 0.1,
  },
  searchSection: {
    paddingHorizontal: width * 0.04,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#E8E8E8',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryContainer: {
    paddingHorizontal: width * 0.04,
    paddingVertical: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#C539A5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
  },
  categoryChipActive: {
    backgroundColor: '#C539A5',
    borderColor: '#C539A5',
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C539A5',
    letterSpacing: 0.2,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  faqSection: {
    paddingHorizontal: width * 0.04,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(197, 57, 165, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 0.3,
  },
  faqList: {
    gap: 16,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  faqQuestionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  faqQuestionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  faqNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#C539A5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  faqNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  faqIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(197, 57, 165, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  faqIconContainerExpanded: {
    backgroundColor: 'rgba(197, 57, 165, 0.2)',
  },
  faqAnswerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  faqAnswerDivider: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginBottom: 16,
  },
  faqAnswer: {
    fontSize: 15,
    fontWeight: '400',
    color: '#555555',
    lineHeight: 24,
    letterSpacing: 0.1,
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  noResultsText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 20,
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 15,
    fontWeight: '400',
    color: '#999999',
    textAlign: 'center',
    marginBottom: 24,
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
    marginTop: 32,
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
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


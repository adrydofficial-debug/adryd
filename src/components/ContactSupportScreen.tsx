import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Platform,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAuthStore } from '../store/authStore';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface UserMetadata {
  full_name?: string;
  name?: string;
  username?: string;
  avatar_url?: string;
}

const { width } = Dimensions.get('window');

const ContactSupportScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, loading } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const faqAnimations = useRef<{ [key: string]: Animated.Value }>({});
  
  // Animation values for enhanced UI
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const userName = user?.user_metadata?.full_name || 
                   user?.user_metadata?.name || 
                   user?.user_metadata?.username || 
                   user?.email?.split('@')[0] || 
                   'MUHAMMAD';

  // Debug log to help with development
  console.log('ContactSupport - User data:', { user, loading, userName });

  // Enhanced animations on component mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const faqData: FAQItem[] = [
    {
      id: "1",
      question: "How do I lodge a complaint?",
      answer: "You can lodge a complaint by contacting our support team through the 'Send us a message' option below, or by calling our customer service hotline. We take all complaints seriously and will respond within 24 hours."
    },
    {
      id: "2", 
      question: "Where can I use my Adryd Visa debit card?",
      answer: "Your Adryd Visa debit card can be used at millions of locations worldwide wherever Visa is accepted, including online purchases, ATMs, and point-of-sale terminals."
    },
    {
      id: "3",
      question: "What fees do you charge?",
      answer: "Adryd offers competitive fee structures. For detailed information about our fees, please check the 'Fees & Charges' section in your account settings or contact our support team."
    },
    {
      id: "4",
      question: "Can I use my Adryd debit card for international payments?",
      answer: "Yes, your Adryd debit card supports international transactions. However, please ensure you have sufficient funds and check for any applicable international transaction fees."
    }
  ];

  const filteredFAQ = faqData.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFAQPress = (id: string) => {
    // Initialize animation value if not exists
    if (!faqAnimations.current[id]) {
      faqAnimations.current[id] = new Animated.Value(0);
    }

    const isExpanding = expandedFAQ !== id;
    setExpandedFAQ(isExpanding ? id : null);

    // Animate FAQ expansion
    Animated.timing(faqAnimations.current[id], {
      toValue: isExpanding ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleSendMessage = () => {
    navigation.navigate('ChatScreen' as never);
  };

  const handleMessagesPress = () => {
    navigation.navigate('ChatScreen' as never);
  };

  const handleHelpPress = () => {
    // Scroll to FAQ section
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSearchFocus = () => {
    // Scroll to search section when focused
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#C539A5" />
      
      {/* Enhanced Header Section */}
      <View style={styles.header}>
        <View>
          <View style={styles.headerTop}>
            {/* Enhanced Profile Avatars */}
            <View style={styles.avatarGroup}>
              <View style={[styles.avatar, styles.avatar1]}>
                <Ionicons name="person" size={16} color="#fff" />
              </View>
              <View style={[styles.avatar, styles.avatar2]}>
                <Ionicons name="person" size={16} color="#fff" />
              </View>
              <View style={[styles.avatar, styles.avatar3]}>
                <Ionicons name="person" size={16} color="#fff" />
              </View>
            </View>
            
            {/* Enhanced Close Button */}
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {/* Enhanced Greeting */}
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingText}>
              Hi {userName} 👋
            </Text>
          </View>
          <Text style={styles.helpText}>How can we help you today?</Text>
        </View>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {/* Enhanced Navigation Cards */}
        <Animated.View 
          style={[
            styles.card,
            styles.navigationCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.navItem}
            onPress={handleMessagesPress}
            activeOpacity={0.7}
          >
            <View style={styles.navItemLeft}>
              <View style={styles.navIconContainer}>
                <Ionicons name="chatbubble-outline" size={20} color="#000" />
              </View>
              <Text style={styles.navText}>Messages</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#666" />
          </TouchableOpacity>
          
          <View style={styles.navDivider} />
          
          <TouchableOpacity 
            style={styles.navItem}
            onPress={handleHelpPress}
            activeOpacity={0.7}
          >
            <View style={styles.navItemLeft}>
              <View style={styles.navIconContainer}>
                <Ionicons name="help-circle-outline" size={20} color="#000" />
              </View>
              <Text style={styles.navText}>Help</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#666" />
          </TouchableOpacity>
        </Animated.View>

        {/* Enhanced Recent Message Card */}
        <Animated.View 
          style={[
            styles.card,
            styles.messageCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.cardTitle}>Recent message</Text>
          <TouchableOpacity style={styles.messageItem} activeOpacity={0.7}>
            <View style={styles.messageIcon}>
              <Text style={styles.messageIconText}>AD</Text>
            </View>
            <View style={styles.messageContent}>
              <Text style={styles.messageText}>What are you looking for? 🤔</Text>
              <Text style={styles.messageMeta}>Adryd • 11m ago</Text>
            </View>
            <View style={styles.messageArrow}>
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Enhanced Send Message Card */}
        <Animated.View 
          style={[
            styles.card,
            styles.sendMessageCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.sendMessageItem}
            onPress={handleSendMessage}
            activeOpacity={0.7}
          >
            <Text style={styles.sendMessageText}>Send us a message</Text>
            <Ionicons name="chevron-forward" size={16} color="#666" />
          </TouchableOpacity>
        </Animated.View>

        {/* Enhanced Search and FAQ Section */}
        <Animated.View 
          style={[
            styles.card,
            styles.faqCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search for help"
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={handleSearchFocus}
                returnKeyType="search"
              />
              <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            </View>
          </View>
          
          <View style={styles.faqContainer}>
            {filteredFAQ.length === 0 && searchQuery ? (
              <View style={styles.noResultsContainer}>
                <Ionicons name="search" size={40} color="#ddd" />
                <Text style={styles.noResultsText}>No results found</Text>
                <Text style={styles.noResultsSubtext}>Try searching with different keywords</Text>
                <TouchableOpacity 
                  onPress={() => setSearchQuery('')}
                  style={styles.clearSearchButton}
                >
                  <Text style={styles.clearSearchText}>Clear search</Text>
                </TouchableOpacity>
              </View>
            ) : (
              filteredFAQ.map((item, index) => {
                const isExpanded = expandedFAQ === item.id;

                return (
                  <Animated.View 
                    key={item.id} 
                    style={[
                      styles.faqItem,
                      { 
                        opacity: fadeAnim,
                        transform: [{ 
                          translateY: slideAnim.interpolate({
                            inputRange: [0, 50],
                            outputRange: [0, 50 + (index * 10)],
                          })
                        }]
                      }
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.faqQuestionContainer}
                      onPress={() => handleFAQPress(item.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.faqQuestion}>{item.question}</Text>
                      <Ionicons 
                        name={isExpanded ? "chevron-up" : "chevron-forward"} 
                        size={16} 
                        color="#666" 
                      />
                    </TouchableOpacity>
                    
                    {isExpanded && (
                      <Animated.View 
                        style={[
                          styles.faqAnswerContainer,
                          { 
                            opacity: faqAnimations.current[item.id] || 0,
                            transform: [{
                              translateY: faqAnimations.current[item.id]?.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-10, 0],
                              }) || -10
                            }]
                          }
                        ]}
                      >
                        <Text style={styles.faqAnswer}>{item.answer}</Text>
                      </Animated.View>
                    )}
                  </Animated.View>
                );
              })
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F7", // Light gray background like in the image
  },
  header: {
    backgroundColor: "#C539A5",
    paddingTop: Platform.OS === "ios" ? 0 : 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  avatarGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -10,
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar1: {
    marginLeft: 0,
    backgroundColor: "#E91E63",
  },
  avatar2: {
    backgroundColor: "#9C27B0",
  },
  avatar3: {
    backgroundColor: "#673AB7",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  greetingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)", // Temporary background for debugging
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF", // Pure white for better visibility
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  helpText: {
    fontSize: 16,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12, // Slightly rounded corners like in the image
    marginTop: 16,
    padding: 16, // Reduced padding for cleaner look
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navigationCard: {
    paddingVertical: 8,
  },
  messageCard: {
    paddingVertical: 16,
  },
  sendMessageCard: {
    paddingVertical: 16,
  },
  faqCard: {
    paddingVertical: 20,
  },
  navItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    backgroundColor: "#fff", // White background for each nav item
  },
  navItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  navIconContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  navText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000", // Black text like in the image
  },
  navDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 0,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 12,
  },
  messageItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  messageIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#C539A5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#C539A5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  messageIconText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  messageContent: {
    flex: 1,
  },
  messageText: {
    fontSize: 15,
    color: "#2C3E50",
    marginBottom: 4,
    fontWeight: "500",
  },
  messageMeta: {
    fontSize: 12,
    color: "#7F8C8D",
    fontWeight: "500",
  },
  messageArrow: {
    padding: 8,
  },
  sendMessageItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  sendMessageText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000", // Black text like in the image
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F7", // Light gray background like in the image
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E5E5E7",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    paddingVertical: 0,
  },
  searchIcon: {
    marginLeft: 12,
  },
  faqContainer: {
    marginTop: 8,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    backgroundColor: "#fff", // White background for each FAQ item
  },
  faqQuestionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  faqQuestion: {
    fontSize: 14,
    color: "#000", // Black text like in the image
    fontWeight: "500",
    flex: 1,
  },
  faqAnswerContainer: {
    paddingBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  faqAnswer: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  noResultsContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#7F8C8D",
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: "#BDC3C7",
    marginBottom: 20,
  },
  clearSearchButton: {
    backgroundColor: "#C539A5",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  clearSearchText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  debugText: {
    color: "#FFFFFF",
    fontSize: 12,
    marginTop: 5,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
});

export default ContactSupportScreen;

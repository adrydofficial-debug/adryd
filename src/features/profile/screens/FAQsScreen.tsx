import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Header from '../../../components/Header';
// ✅ Update navigation type
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../../app/navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<AppStackParamList, 'FAQsScreen'>;


type RouteParams = {
    card: {
        id: string;
        category: string;
        title: string;
        icon: string;
        backgroundColor: string;
        iconColor: string;
    };
};
const getLightColor = (hex: string) => {
    try {
        let c = hex.replace('#', '');
        const r = parseInt(c.substring(0, 2), 16);
        const g = parseInt(c.substring(2, 4), 16);
        const b = parseInt(c.substring(4, 6), 16);

        // Lighten by 80% for soft pastel color
        const newR = Math.min(255, r + (255 - r) * 0.75);
        const newG = Math.min(255, g + (255 - g) * 0.75);
        const newB = Math.min(255, b + (255 - b) * 0.75);

        return `rgb(${newR}, ${newG}, ${newB})`;
    } catch {
        return "#F2F2F2";
    }
};
const { width, height } = Dimensions.get("window");

const HelpDetailScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
    const { card } = route.params;

    const faqDetails: { [key: string]: any } = {
  payment: {
    title: 'Payment',
    content: `
Manage your payments seamlessly on ADRYD with full transparency and support.

**Supported Payment Methods**
- Credit/Debit Cards (Visa, MasterCard)
- Bank Transfers
- Digital Wallets (e.g., JazzCash, EasyPaisa)

**Billing & Invoices**
- View transaction history anytime in your dashboard
- Download invoices for accounting or record-keeping
- Receive instant confirmation after successful payment

**Troubleshooting & Support**
- Failed transactions: Retry the payment or update your payment method
- Contact support for disputes or issues
- Ensure sufficient balance and correct account details for smooth processing
`
  },

  account: {
    title: 'Getting Started',
    content: `
A step-by-step guide to creating and managing your ADRYD account.

**Account Setup**
- Register using your email or mobile number
- Verify your account via OTP/email confirmation
- Complete your profile with company details and preferred payment method

**Navigating the Platform**
- Dashboard overview: View ad campaigns, analytics, and account balance
- Ad booking: Browse available locations and select digital/outdoor billboards
- Notifications: Get timely alerts for approvals, payments, or updates

**Tips for New Users**
- Start with a small campaign to understand ROI
- Use targeted locations to maximize audience reach
- Regularly update your profile to stay compliant
`
  },

  general: {
  title: 'How To Advertise',
  content: `
Learn how to create and manage successful advertising campaigns on ADRYD.

**Step 1: Choose Your Advertising Location**
- Browse available digital billboards and outdoor advertising spaces.
- Select the location that best matches your target audience.
- Review pricing, availability, and audience reach before booking.

**Step 2: Upload Your Advertisement**
- Upload your advertisement creative such as images or videos.
- Ensure the content follows ADRYD advertising guidelines.
- High-quality visuals improve engagement and campaign performance.

**Step 3: Set Campaign Details**
- Select the campaign start and end dates.
- Define your advertising budget.
- Confirm the duration and display frequency of your ad.

**Step 4: Launch Your Campaign**
- Review your campaign details before publishing.
- Once approved, your advertisement will start running on the selected screens or locations.

**Step 5: Track Performance**
- Monitor campaign performance directly from your dashboard.
- View analytics such as impressions, reach, and engagement.
- Optimize future campaigns based on performance insights.

**Best Practices**
- Use clear messaging and strong visuals.
- Target high-traffic locations for maximum visibility.
- Regularly review campaign analytics to improve results.
`
},

  blocked: {
    title: 'Blocked Accounts',
    content: `
Information regarding blocked or restricted accounts.

**Common Reasons for Blocking**
- Policy violations (prohibited content or misuse)
- Pending payments or unpaid dues
- Suspicious account activity detected by system

**Recovery Process**
- Follow on-screen instructions to resolve issues
- Contact ADRYD support with verification documents if needed
- Once resolved, your account will be restored promptly

**Prevention Tips**
- Ensure all payments are completed timely
- Follow platform guidelines for ad content
- Keep account information updated
`
  },

  terms: {
    title: 'Terms & Conditions',
    content: `
Understand your rights and responsibilities while using ADRYD.

**Platform Access**
- ADRYD grants non-exclusive rights to access and use the platform
- All content, designs, and services are owned by ADRYD

**Payments & Refunds**
- All campaigns are prepaid unless stated otherwise
- Refunds are processed according to policy for failed or cancelled campaigns

**Privacy & Data Security**
- ADRYD collects necessary data to provide services
- All user data is securely stored and handled according to privacy regulations

**User Responsibilities**
- Ensure ad content complies with laws and platform rules
- Do not attempt to misuse or exploit the platform
`
  },

  all: {
    title: 'Help Topics',
    content: `
Welcome to ADRYD Help Center! Explore our comprehensive support topics.

**Getting Started**
- Account creation, verification, and profile setup
- Dashboard navigation and notifications

**Payments**
- Supported methods, billing, invoices, and troubleshooting
- How to resolve failed transactions

**Advertising**
- Booking and managing digital and outdoor ad campaigns
- Analytics and performance tracking
- Best practices for effective campaigns

**Account & Compliance**
- Blocked accounts and recovery procedures
- Privacy, security, and policy compliance

**Support**
- How to contact ADRYD support
- FAQs for common issues and step-by-step solutions
`
  }
};

    const currentData = faqDetails[card.id] || faqDetails['all'];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
            <Header
                title="FAQS"
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <View style={styles.cardHeader}>
                    <View
                        style={{
                            width: width * 0.115,
                            height: height * 0.055,
                            borderRadius: width * 0.03,
                            backgroundColor: getLightColor(card.iconColor),  
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Ionicons name={card.icon} size={28} color={card.iconColor} />
                    </View>


                    <View style={{ marginLeft: 12 }}>
                        <Text style={styles.cardTitle}>{currentData.title}</Text>


                        <Text style={styles.updatedText}>Last update: Yesterday</Text>
                    </View>
                </View>
                <Text style={styles.sectionHeading}>Welcome to ADRYD Marketing Co.</Text>

                <Text style={styles.cardContent}>
                    {currentData.content.replace("Welcome to ADRYD Marketing Co.", "").trim()}
                </Text>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
        marginTop:20,

    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#18181B',
    },
    cardContent: {
        fontSize: 12,
        fontWeight: '400',
        color: '#18181B',
        lineHeight: 22,
    },
    updatedText: {
        fontSize: 10,
        color: '#70737D',
        marginTop: 2,
    },
    sectionHeading: {
        fontSize: 14,
        fontWeight: "700",
        color: "#18181B",
        marginBottom: 5,
    },


});

export default HelpDetailScreen;


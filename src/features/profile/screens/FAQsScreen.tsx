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
1. What payment methods are accepted on ADRYD?

ADRYD supports secure online payment methods including bank transfers, debit/credit cards, and other approved digital payment options available within the app.

2. When do I need to make the payment for my campaign?

Payment must be completed at the time of campaign booking to confirm your selected advertising location and campaign dates.

3. Is my payment secure on the ADRYD platform?

Yes. ADRYD uses secure payment systems and encrypted transactions to ensure all payments made through the platform are safe and protected.

4. Can I get an invoice or payment receipt?

Yes. Once your payment is successfully processed, ADRYD provides a digital invoice or receipt for your campaign booking.

5. Can I reserve a billboard without making a payment?

No. Advertising locations and campaign dates are only reserved after the payment is successfully completed.

6. What happens if my payment fails?

If your payment fails, your campaign booking will not be confirmed. You can retry the payment using another method to secure your selected location and dates.

7. Are there any additional charges apart from the campaign cost?

The total campaign cost displayed in the ADRYD app includes the advertising placement cost. Any applicable taxes or service charges will be clearly shown before payment confirmation.

8. Can I get a refund after making a payment?

Refunds may only be applicable in specific situations such as unsuccessful bookings, system errors, or campaign issues as per ADRYD’s refund policy.
`
  },

  account: {
    title: 'Getting Started',
    content: `
1. What is ADRYD?

ADRYD is Pakistan’s first mobile app that allows businesses and brands to easily book outdoor advertising campaigns by selecting locations, campaign dates, and available billboards directly through the platform.

2. How do I get started with ADRYD?

To get started, simply download the ADRYD app, create an account, and explore available advertising locations. You can then select your campaign area, dates, and confirm your booking.

3. Do I need an account to use ADRYD?

Yes. You need to create an account to book campaigns, manage your advertising activities, and track your campaign details through the app.

4. Who can use the ADRYD platform?

ADRYD can be used by businesses, brands, marketing agencies, startups, and individuals who want to run outdoor advertising campaigns in different locations.

5. Is ADRYD available across Pakistan?

ADRYD is expanding its outdoor advertising network across multiple cities in Pakistan, offering advertising opportunities in high-traffic and premium locations.

6. Do I need marketing experience to use ADRYD?

No. ADRYD is designed to be simple and user-friendly, allowing anyone to easily plan and book outdoor advertising campaigns without prior marketing experience.

7. How long does it take to launch a campaign?

Once you select your location, dates, and complete the payment, your campaign booking can be confirmed quickly through the ADRYD platform.

8. Can I manage multiple campaigns on ADRYD?

Yes. ADRYD allows users to create and manage multiple advertising campaigns from a single account.
`
  },

  general: {
  title: 'How To Advertise',
  content: `
1. How can I advertise using ADRYD?

You can advertise by downloading the ADRYD app, selecting your desired location, choosing campaign dates, reviewing availability, and confirming your booking through the platform.

2. How do I choose the right location for my advertisement?

ADRYD allows you to explore different advertising locations. You can select areas based on city, traffic visibility, and target audience to maximize your campaign reach.

3. Can I run ads in multiple locations at the same time?

Yes. ADRYD allows advertisers to select and book multiple locations simultaneously to expand their campaign visibility across different areas.

4. How do I select campaign dates?

While creating a campaign, you can choose your preferred start and end dates. The app will show available dates for the selected advertising location.

5. What type of advertisements can I run on ADRYD?

You can run outdoor advertising campaigns such as billboard ads, LED screen displays, and other outdoor media placements available on the platform.

6. Do I need to upload my advertisement design?

Yes. Advertisers typically need to provide their advertisement design or creative to be displayed on the selected outdoor media.

7. How do I confirm my advertising campaign?

Once you finalize your location, dates, and campaign details, you can confirm your campaign by completing the payment through the ADRYD platform.

8. Can I track my advertising campaign?

Yes. ADRYD allows users to manage and monitor their campaigns through the platform after booking.
`
},

  blocked: {
    title: 'Blocked Accounts',
    content: `
1. Why has my ADRYD account been blocked?

Your account may be blocked due to suspicious activity, violation of platform policies, incorrect information, or misuse of the ADRYD services.

2. How will I know if my account has been blocked?

If your account is blocked, you may receive a notification in the app or see a message when attempting to log in.

3. Can I still access my campaigns if my account is blocked?

If your account is blocked, access to certain features may be restricted until the issue is resolved by the ADRYD support team.

4. How can I unblock my ADRYD account?

You can contact ADRYD support through the help section or official contact channels to request a review of your account.

5. How long does it take to unblock an account?

The time required to review and unblock an account depends on the nature of the issue. The ADRYD team will review the case and respond accordingly.

6. Can my account be permanently blocked?

Yes. Accounts that repeatedly violate ADRYD policies or misuse the platform may be permanently blocked.

7. What should I do if I think my account was blocked by mistake?

If you believe your account was blocked in error, you should contact ADRYD support and provide the necessary details for review.

8. How can I avoid getting my account blocked?

To avoid account restrictions, ensure that you follow ADRYD’s terms and policies, provide accurate information, and use the platform responsibly.
`
  },

  terms: {
    title: 'Terms & Conditions',
    content: `
1. Company Information
ADRYD Marketing Co. is a registered business in Pakistan under Registration No. 3520028592305.
Registered Office: Lahore, Pakistan.
All operations comply with applicable Pakistani laws, including digital advertising and e-commerce regulations.

2. Acceptance of Terms
By accessing or using ADRYD’s website, app, or services, you confirm that you:

Are at least 18 years old,
Agree to comply with these Terms, and
Provide accurate and truthful information when using our services.
If you disagree with any part of these Terms, please discontinue using our Platform.

3. Services Provided
ADRYD offers branding, marketing, and advertising solutions — including but not limited to:

Outdoor and digital advertising campaigns,
Brand strategy and creative design,
Business marketing consultancy, and
Technology-driven media placement through our app.
We reserve the right to modify, suspend, or discontinue any service at our discretion, without prior notice.

4. User Accounts
To access certain services, you may need to register an account.

You are responsible for maintaining the confidentiality of your login details.
You agree to notify ADRYD immediately of any unauthorized use of your account.
ADRYD reserves the right to suspend or terminate accounts for fraudulent or unlawful activity.
5. Payments and Refunds
All payments are made in Pakistani Rupees (PKR) in compliance with the State Bank of Pakistan.
Service fees and advertising costs are non-refundable once work begins.
Refunds (if applicable) are processed only when ADRYD fails to deliver the agreed service due to internal issues.
 

6. Intellectual Property Rights
All content, branding, visuals, code, and data on ADRYD are intellectual property of ADRYD Marketing Co.
Users may not copy, reproduce, or distribute any content without written consent from ADRYD.

7. User Conduct
Users agree not to:

Upload or share false, illegal, or misleading information,
Attempt unauthorized access to ADRYD systems, or
Violate any applicable Pakistani laws, including the Prevention of Electronic Crimes Act (PECA) 2016.
 

Any violation may lead to account termination or legal action.

Data and Privacy
Your privacy is important to us. ADRYD collects only necessary data to operate its services, in line with Pakistan’s Personal Data Protection Bill.
Please review our Privacy Policy to learn more about how your information is collected and used.

9. Limitation of Liability
ADRYD is not liable for:

Any loss of profits or business opportunities,
Errors or interruptions in services caused by third parties, or
Unauthorized access or data breaches beyond our control.
 

Our liability shall not exceed the total amount paid by you for the service in question.

10. Indemnification
You agree to indemnify and hold ADRYD, its directors, employees, and affiliates harmless against any claims, losses, or damages arising from your misuse of the Platform or violation of these Terms.

11. Third-Party Links
Our Platform may contain links to external sites for convenience. ADRYD does not endorse or take responsibility for third-party content or services.

12. Governing Law and Jurisdiction
These Terms are governed by the laws of Pakistan.
All disputes shall fall under the exclusive jurisdiction of the courts in Lahore, Pakistan.

13. Modifications to Terms
ADRYD reserves the right to modify or update these Terms at any time. The updated version will be posted on our website. Continued use of our services after any change means you accept the revised Terms.

14. Refund Policy
If your advertisement is approved and its advertising has started, no refund will be issued under any circumstances.
If your advertisement is not approved yet and you cancel the ad before approval, your payment will be refunded within 7 to 10 business days.
Refunds will be made through the same payment method used during the transaction.
ADRYD reserves the right to withhold refunds if a user violates any of our Terms or submits fraudulent activity.
`
  },

  all: {
    title: 'Help Topics',
    content: `
1. How can I contact ADRYD support?

You can contact ADRYD support through the help section in the app or by reaching out through the contact details provided on the ADRYD website.

2. What should I do if I face an issue while booking a campaign?

If you experience any issues during the booking process, you can contact ADRYD support through the help center for assistance.

3. How long does it take to receive a response from support?

The ADRYD support team aims to respond to all queries as quickly as possible, usually within a short period during working hours.

4. What should I do if the app is not working properly?

If the app is not functioning correctly, try restarting the app or checking your internet connection. If the issue continues, contact ADRYD support for help.

5. Can ADRYD help me choose the right advertising location?

Yes. If you need guidance selecting the best advertising locations for your campaign, the ADRYD support team can assist you.

6. What information should I provide when contacting support?

When contacting support, it’s helpful to include your account details, campaign information, and a brief description of the issue so the team can assist you quickly.

7. Can I report a technical problem through the app?

Yes. ADRYD users can report technical issues or problems through the help or support section available in the app.

8. Where can I find updates or announcements from ADRYD?

Important updates, announcements, and information about the platform may be shared through the ADRYD app, website, or official communication channels.
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


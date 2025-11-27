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
(“ADRYD,” “we,” “our,” or “us”). These Terms and  Conditions (“Terms”) govern your access to and use of our website https://adryd.app, our  mobile application, and all related services (collectively referred to as the “Platform”).  By using ADRYD, you agree to these Terms. Please read them carefully before accessing or  using our services..`
        },
        account: {
            title: 'Getting Started',
            content: `
(“ADRYD,” “we,” “our,” or “us”). These Terms and  Conditions (“Terms”) govern your access to and use of our website https://adryd.app, our  mobile application, and all related services (collectively referred to as the “Platform”).  By using ADRYD, you agree to these Terms. Please read them carefully before accessing or  using our services..`
        },
        general: {
            title: 'How To Invest',
            content: `
(“ADRYD,” “we,” “our,” or “us”). These Terms and  Conditions (“Terms”) govern your access to and use of our website https://adryd.app, our  mobile application, and all related services (collectively referred to as the “Platform”).  By using ADRYD, you agree to these Terms. Please read them carefully before accessing or  using our services..`
        },
        blocked: {
            title: 'Blocked Accounts',
            content: `
(“ADRYD,” “we,” “our,” or “us”). These Terms and  Conditions (“Terms”) govern your access to and use of our website https://adryd.app, our  mobile application, and all related services (collectively referred to as the “Platform”).  By using ADRYD, you agree to these Terms. Please read them carefully before accessing or  using our services..`
        },
        terms: {
            title: 'Terms & Conditions',
            content: `
(“ADRYD,” “we,” “our,” or “us”). These Terms and  Conditions (“Terms”) govern your access to and use of our website https://adryd.app, our  mobile application, and all related services (collectively referred to as the “Platform”).  By using ADRYD, you agree to these Terms. Please read them carefully before accessing or  using our services.`
        },
        all: {
            title: 'Help Topics',
            content: `
(“ADRYD,” “we,” “our,” or “us”). These Terms and  Conditions (“Terms”) govern your access to and use of our website https://adryd.app, our  mobile application, and all related services (collectively referred to as the “Platform”).  By using ADRYD, you agree to these Terms. Please read them carefully before accessing or  using our services.`
        },
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


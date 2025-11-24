import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from "react-native";
import { useFocusEffect, useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import Card from "../../../assets/images/Card.svg";
import JazzCash from "../../../assets/images/JazzCash.svg";
import EasyPaisa from "../../../assets/images/EasyPaisa.svg";
import Header from "../../../components/Header";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../../app/navigation/AppNavigator';
import ProgressBar from "../../../components/ProgressBar";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;



const { width, height } = Dimensions.get("window");


const PaymentMethodScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const handleBackPress = () => {
        navigation.goBack();
    };
    return (
        <View style={{ flex: 1, backgroundColor: "#F8F8F8" }}>

            {/* Header */}
            <Header
                title='Choose Payment Method'
                onBackPress={handleBackPress}
                showRightIcon={false}
            />
            <View style={{ marginTop: 20 }}>
                <ProgressBar currentStep={4} />
            </View>
            <Text style={styles.title}>Please Add Payment Method</Text>
            <Text style={styles.subtitle}>
                Add a payment method to complete payments
            </Text>

            {/* Payment Cards */}
            <View style={{ alignItems: "center", marginTop: height * 0.03, gap: 15 }}>
                <TouchableOpacity style={styles.card}>
                    <View style={styles.iconCircle}>
                        <Card
                            width={width * 0.09}
                            height={height * 0.02}
                            style={{ alignSelf: "center", marginTop: height * 0.016 }}
                        />
                    </View>

                    <View>
                        <Text style={styles.cardTitle}>Credit or Debit Card</Text>
                        <Text style={styles.cardSubtitle}>
                            Use a credit or debit card to pay with automatic {"\n"}payments
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.card}>
                    <View style={styles.iconCircle}>
                        <JazzCash
                            width={width * 0.07}
                            height={width * 0.07}
                            style={{ alignSelf: "center", marginTop: height * 0.01 }}
                        />
                    </View>

                    <View>
                        <Text style={styles.cardTitle}>Jazzcash</Text>
                        <Text style={styles.cardSubtitle}>
                            Use your Jazzcash account to make payments
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.card}>
                    <View style={styles.iconCircle}>
                        <EasyPaisa
                            width={width * 0.1}
                            height={width * 0.1}
                            style={{ alignSelf: "center" }}
                        />
                    </View>

                    <View>
                        <Text style={styles.cardTitle}>Easypaisa</Text>
                        <Text style={styles.cardSubtitle}>
                            Use your Easypaisa account to make payments
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default PaymentMethodScreen;

const styles = StyleSheet.create({
    header: {
        justifyContent: "center",
        alignItems: "center",
        width: width,
        height: height * 0.14, // 114 → dynamic
        backgroundColor: "white",
    },

    headerTitle: {
        fontSize: 13,
        fontWeight: "600",
    },

    title: {
        marginTop: height * 0.03,
        textAlign: "center",
        fontSize: 17,
        fontWeight: "500",
        color: "#000",
    },


    subtitle: {
        marginTop: height * 0.007,
        textAlign: "center",
        fontSize: 10,
        color: "#70737D",
        fontWeight: "400",
    },

    card: {
        width: width * 0.885,
        height: height * 0.095,
        borderRadius: width * 0.025,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        padding: width * 0.04,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: "#fff",
    },

    cardTitle: {
        fontSize: 14,
        fontWeight: "500",
    },

    cardSubtitle: {
        fontSize: 10,
        color: "#777",
        marginTop: 3,
    },

    iconCircle: {
        width: width * 0.12,
        height: width * 0.12,
        borderRadius: width * 0.06,
        borderWidth: 1,
        backgroundColor: "#FFF",
        borderColor: "#E5E7EB",
    },
});


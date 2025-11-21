import React, { useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Header from "../../../components/Header";
import CustomInput from "../../../components/CustomInput";
import PrimaryButton from "../../../components/PrimaryButton";
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../../app/navigation/AppNavigator';

// SVG Imports
import EasyPaisa from "../../../assets/images/EasyPaisa.svg";

const { width, height } = Dimensions.get("window");
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const EasyPaisaPaymentForm: React.FC = () => {
    const [phoneNumber, setPhoneNumber] = useState("");
    const navigation = useNavigation<NavigationProp>();

    const handleBackPress = () => {
        navigation.goBack();
    };

    const handleDone = () => {
        // Do something on Done
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#F8F8F8" }}>
            {/* Header */}
            <Header
                title="Payment Method"
                onBackPress={handleBackPress}
                showRightIcon={false}
            />

            {/* Card */}
            <View style={styles.card}>
                {/* Top Icons */}
                <View style={styles.topIcons}>
                    <View style={styles.iconCircle}>
                        <EasyPaisa width={wp(6.7)} height={wp(6.7)} />
                    </View>
                </View>

                <View style={{ justifyContent: "center", alignItems: "center", marginBottom: hp(2), marginTop: hp(4) }}>
                    <Text style={styles.title}>Please add Number</Text>
                    <Text style={styles.SubTitle}>
                        We have sent OTP Code! Please check number.
                    </Text>
                </View>

                <CustomInput
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    isPhoneNumber
                    containerStyle={{ width: wp(76) }}
                    placeholderTextColor="#70737D"
                />
            </View>

            {/* Pay Button */}
            <PrimaryButton
                title="Done"
                onPress={handleDone}
                buttonStyle={{
                    width: wp(65),
                    height: hp(6),
                    borderRadius: wp(4),
                    borderWidth: 1,
                    borderColor: '#C12C9F',
                    opacity: 1,
                    alignSelf: "center",
                    marginTop: hp(11),
                }}
                textStyle={{
                    fontSize: 14,
                    fontWeight: '600',
                    textAlign: 'center',
                    color: '#FFFFFF',
                }}
            />
        </View>
    );
};

export default EasyPaisaPaymentForm;

const styles = StyleSheet.create({
    title: {
        fontSize: 12,
        fontWeight: "600",
    },
    SubTitle: {
        fontSize: 10,
        fontWeight: "400",
        marginTop: hp(1),
        color: "#18181B"
    },
    card: {
        width: wp(86),
        height: hp(24),
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: wp(4),
        marginTop: hp(5),
        alignSelf: "center",
        paddingHorizontal: wp(1),
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    topIcons: {
        width: wp(11.5),
        height: wp(11.5),
        top: -hp(2.5),
        position: "absolute",
        flexDirection: "row",
    },
    iconCircle: {
        width: wp(11.5),
        height: wp(11.5),
        borderRadius: wp(6),
        borderWidth: 1,
        backgroundColor: "#FFFFFF",
        borderColor: "#E5E7EB",
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: wp(2),
    },
});

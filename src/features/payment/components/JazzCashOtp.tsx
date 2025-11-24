import React, { useState } from "react";
import { View, Text, StyleSheet, Dimensions, TextInput, TouchableOpacity } from "react-native";
import Header from "../../../components/Header";
import PrimaryButton from "../../../components/PrimaryButton";
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../../app/navigation/AppNavigator';
import JazzCash from "../../../assets/images/JazzCash.svg";

const { width, height } = Dimensions.get("window");
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const JazzCashOtpForm: React.FC = () => {
  const [otp, setOtp] = useState("");
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={{ flex: 1, backgroundColor: "#F8F8F8" }}>
      <Header
        title="Payment Method"
        onBackPress={() => navigation.goBack()}
        showRightIcon={false}
      />

      <View style={styles.card}>
        <View style={styles.topIcons}>
          <View style={styles.iconCircle}>
            <JazzCash width={wp(6.7)} height={wp(6.7)} />
          </View>
        </View>

        <View style={{ justifyContent: "center", alignItems: "center", marginBottom: hp(2), marginTop: hp(4) }}>
          <Text style={styles.title}>Enter Code</Text>
          <Text style={styles.SubTitle}>
            We have sent a verification code to your phone number
          </Text>
        </View>

        <TextInput
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="------"
          placeholderTextColor="#70737D"
          style={{
            width: wp(76),
            height: hp(6),
            borderWidth: 1,
            borderColor: "#E5E7EB",
            borderRadius: wp(3),
            textAlign: "center",
            fontSize: 18,
            letterSpacing: 27, // keep spacing for OTP
          }}
        />

        <View style={styles.footer}>
          <Text style={styles.text}>Didn’t get your code?</Text>
          <TouchableOpacity>
            <Text style={styles.subText}>Send new code</Text>
          </TouchableOpacity>
        </View>


      </View>

      <PrimaryButton
        title="Done"
        onPress={() => {}}
        buttonStyle={{
          width: wp(65),
          height: hp(6),
          borderRadius: wp(4),
          borderWidth: 1,
          borderColor: '#C12C9F',
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

export default JazzCashOtpForm;

const styles = StyleSheet.create({
  title: { fontSize: 12, fontWeight: "600" },
  SubTitle: { fontSize: 10, fontWeight: "400", marginTop: hp(1), color: "#18181B" },
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
  topIcons: { width: wp(11.5), height: wp(11.5), top: -hp(2.5), position: "absolute", flexDirection: "row" },
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
  footer: {
    flexDirection: "row",
    gap: 3,
    marginTop: 10,
  },
  text: {
    fontSize: 10,
    fontWeight: "400"
  },
  subText: {
    fontSize: 10,
    fontWeight: "600"
  },
});

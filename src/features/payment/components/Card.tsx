import React, { useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Header from "../../../components/Header";
import CustomInput from "../../../components/CustomInput";
import PrimaryButton from "../../../components/PrimaryButton";
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../../app/navigation/AppNavigator';

// SVG Imports
import Card from "../../../assets/images/Card.svg";

const { width, height } = Dimensions.get("window");
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const CardPaymentForm: React.FC = () => {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const navigation = useNavigation<NavigationProp>();
  const handleBackPress = () => navigation.goBack();
  const handleDone = () => { /* Handle payment submission */ };

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
        {/* Top Icon */}
        <View style={styles.topIcons}>
          <View style={styles.iconCircle}>
            <Card width={wp(6.7)} height={wp(6.7)} />
          </View>
        </View>


        {/* Inputs */}
        <CustomInput
          label="Card Number"
          value={cardNumber}
          onChangeText={setCardNumber}
          containerStyle={{ width: wp(76), height: hp(9.5), marginBottom: hp(2) }}
        />

        <View style={styles.row}>
          <CustomInput
            label="Expiry"
            value={expiry}
            onChangeText={setExpiry}
            containerStyle={{
              width: wp(32),
              height: hp(7),
              marginRight: wp(3)
            }}
          />
          <CustomInput
            label="CVV"
            value={cvv}
            onChangeText={setCvv}
            containerStyle={{
              width: wp(38),
              height: hp(7)
            }}
          />
        </View>
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
          marginTop: hp(5),
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

export default CardPaymentForm;

const styles = StyleSheet.create({
  title: {
    fontSize: 12,
    fontWeight: "600",
  },
  SubTitle: {
    fontSize: 10,
    fontWeight: "400",
    marginTop: hp(1),
    color:"#18181B"
  },
  card: {
    width: wp(86),
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: wp(4),
    marginTop: hp(5),
    alignSelf: "center",
    paddingHorizontal: wp(2),
    paddingVertical: hp(3),
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
  row: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
  },
});

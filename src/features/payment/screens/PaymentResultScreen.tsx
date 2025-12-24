// src/features/payment/screens/PaymentResultScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  BackHandler,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../../app/navigation/AppNavigator';
import PrimaryButton from '../../../components/PrimaryButton';

const { width, height } = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;
type PaymentResultRouteProp = RouteProp<AppStackParamList, 'PaymentResultScreen'>;

const PaymentResultScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PaymentResultRouteProp>();
  const { status, transactionId, amount, orderId, errorMessage } = route.params;

  const isSuccess = status === 'success';

  // Prevent back button on Android
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // Navigate to home instead of going back
        navigation.reset({
          index: 0,
          routes: [{ name: 'BottomTab' }],
        });
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => {
        if (BackHandler && BackHandler.removeEventListener) {
          BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }
      };
    }, [navigation])
  );

  const handleContinue = () => {
    if (isSuccess) {
      // Navigate to InboxScreen after successful payment
      navigation.reset({
        index: 0,
        routes: [
          { name: 'BottomTab' },
          { name: 'InboxScreen' },
        ],
      });
    } else {
      // Go back to try again
      navigation.goBack();
    }
  };

  const handleGoHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'BottomTab' }],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Status Icon */}
        <View style={[styles.iconContainer, isSuccess ? styles.successBg : styles.failureBg]}>
          {isSuccess ? (
            <Image
              source={require('../../../assets/images/greenTick.png')}
              style={styles.icon}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.failureIcon}>✕</Text>
          )}
        </View>

        {/* Status Title */}
        <Text style={[styles.title, isSuccess ? styles.successText : styles.failureText]}>
          {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
        </Text>

        {/* Status Message */}
        <Text style={styles.message}>
          {isSuccess
            ? 'Your campaign is paid. Thank you for your payment!'
            : errorMessage || 'We were unable to process your payment. Please try again.'}
        </Text>

        {/* Transaction Details */}
        <View style={styles.detailsCard}>
          {amount && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount</Text>
              <Text style={styles.detailValue}>Rs. {amount.toLocaleString()}</Text>
            </View>
          )}

          {transactionId && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transaction ID</Text>
              <Text style={styles.detailValueSmall}>{transactionId}</Text>
            </View>
          )}

          {orderId && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Order ID</Text>
              <Text style={styles.detailValueSmall}>{orderId}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <Text style={[styles.statusBadge, isSuccess ? styles.statusSuccess : styles.statusFailure]}>
              {isSuccess ? 'Completed' : 'Failed'}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <PrimaryButton
            title={isSuccess ? 'Continue' : 'Try Again'}
            onPress={handleContinue}
            buttonStyle={styles.primaryButton}
            textStyle={styles.primaryButtonText}
          />

          {!isSuccess && (
            <PrimaryButton
              title="Go to Home"
              onPress={handleGoHome}
              buttonStyle={styles.secondaryButton}
              textStyle={styles.secondaryButtonText}
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default PaymentResultScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(5),
    paddingTop: hp(10),
    alignItems: 'center',
  },
  iconContainer: {
    width: wp(25),
    height: wp(25),
    borderRadius: wp(12.5),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(3),
  },
  successBg: {
    backgroundColor: '#ECFDF5',
  },
  failureBg: {
    backgroundColor: '#FEF2F2',
  },
  icon: {
    width: wp(12),
    height: wp(12),
  },
  failureIcon: {
    fontSize: 40,
    color: '#EF4444',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: hp(1.5),
    textAlign: 'center',
  },
  successText: {
    color: '#059669',
  },
  failureText: {
    color: '#DC2626',
  },
  message: {
    fontSize: 14,
    color: '#70737D',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: hp(4),
    paddingHorizontal: wp(5),
  },
  detailsCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: wp(5),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: hp(4),
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(1.2),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#70737D',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#18181B',
  },
  detailValueSmall: {
    fontSize: 12,
    fontWeight: '500',
    color: '#18181B',
    maxWidth: wp(50),
    textAlign: 'right',
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: 20,
    overflow: 'hidden',
  },
  statusSuccess: {
    backgroundColor: '#ECFDF5',
    color: '#059669',
  },
  statusFailure: {
    backgroundColor: '#FEF2F2',
    color: '#DC2626',
  },
  buttonContainer: {
    width: '100%',
    gap: hp(1.5),
  },
  primaryButton: {
    width: '100%',
    height: hp(6.5),
    borderRadius: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    width: '100%',
    height: hp(6.5),
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#70737D',
  },
});

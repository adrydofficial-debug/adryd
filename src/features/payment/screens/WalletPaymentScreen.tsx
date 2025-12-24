// src/features/payment/screens/WalletPaymentScreen.tsx
// Updated: Uses PayFast form POST model for secure wallet payments

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../../app/navigation/AppNavigator';
import Header from '../../../components/Header';
import PrimaryButton from '../../../components/PrimaryButton';
import { initiatePayment, getPaymentStatus, PayFastFormData } from '../services/paymentService';
import JazzCashIcon from '../../../assets/images/JazzCash.svg';
import EasyPaisaIcon from '../../../assets/images/EasyPaisa.svg';

const { width, height } = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;
type WalletPaymentRouteProp = RouteProp<AppStackParamList, 'WalletPaymentScreen'>;

/**
 * Generate HTML form that auto-submits to PayFast
 * This is the correct way to integrate with PayFast - POST form data to their checkout URL
 */
const generatePayFastFormHtml = (checkoutUrl: string, formData: PayFastFormData): string => {
  const formFields = Object.entries(formData)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}" />`)
    .join('\n');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background-color: #F8F8F8;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .loading {
          text-align: center;
          color: #70737D;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #E5E7EB;
          border-top-color: #C539A5;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div class="loading">
        <div class="spinner"></div>
        <p>Redirecting to secure payment...</p>
      </div>
      <form id="payfast-form" action="${checkoutUrl}" method="POST">
        ${formFields}
      </form>
      <script>
        document.getElementById('payfast-form').submit();
      </script>
    </body>
    </html>
  `;
};

/**
 * Parse query params from callback URL
 */
const parseCallbackParams = (url: string): Record<string, string> => {
  const params: Record<string, string> = {};
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });
  } catch (error) {
    // Try to parse manually if URL constructor fails
    const queryString = url.split('?')[1];
    if (queryString) {
      queryString.split('&').forEach(pair => {
        const [key, value] = pair.split('=');
        if (key) {
          params[decodeURIComponent(key)] = decodeURIComponent(value || '');
        }
      });
    }
  }
  return params;
};

const WalletPaymentScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<WalletPaymentRouteProp>();
  const { campaignId, amount, walletType, customerEmail } = route.params;

  const [loading, setLoading] = useState(false);
  const [paymentHtml, setPaymentHtml] = useState<string | null>(null);
  const [webViewLoading, setWebViewLoading] = useState(true);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const isJazzCash = walletType === 'jazzcash';
  const walletName = isJazzCash ? 'JazzCash' : 'Easypaisa';
  const WalletIcon = isJazzCash ? JazzCashIcon : EasyPaisaIcon;

  const handleBackPress = () => {
    if (paymentHtml) {
      Alert.alert(
        'Cancel Payment',
        'Are you sure you want to cancel this payment?',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes',
            style: 'destructive',
            onPress: () => {
              setPaymentHtml(null);
              navigation.goBack();
            },
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  // Initiate payment and get form data for PayFast
  const handleInitiatePayment = useCallback(async () => {
    setLoading(true);
    try {
      const response = await initiatePayment({
        campaignId: campaignId ? parseInt(campaignId) : undefined,
        amount,
        paymentMethod: walletType,
        customerEmail,
        customerPhone: '+923001234567', // Default for redirect model
      });

      console.log('📥 Payment initiation response:', response);

      // New flow: Use checkoutUrl and formData for form POST
      if (response.success && response.checkoutUrl && response.formData) {
        setTransactionId(response.transactionId);
        // Generate HTML form that will auto-submit to PayFast
        const html = generatePayFastFormHtml(response.checkoutUrl, response.formData);
        setPaymentHtml(html);
      }
      // Fallback: Legacy redirectUrl support
      else if (response.success && response.redirectUrl) {
        setTransactionId(response.transactionId);
        // For legacy redirectUrl, create a simple redirect HTML
        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta http-equiv="refresh" content="0;url=${response.redirectUrl}">
          </head>
          <body>
            <p>Redirecting to payment...</p>
          </body>
          </html>
        `;
        setPaymentHtml(html);
      } else {
        Alert.alert('Error', response.message || 'Failed to initiate payment');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          'Failed to initiate payment. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [campaignId, amount, walletType, customerEmail]);

  // Check payment status after callback
  const checkPaymentStatus = useCallback(async () => {
    if (!transactionId) return;

    try {
      const statusResponse = await getPaymentStatus(transactionId);
      
      if (statusResponse.status === 'completed') {
        navigation.replace('PaymentResultScreen', {
          status: 'success',
          transactionId,
          amount,
          orderId: statusResponse.orderId,
          campaignId: campaignId,
        });
      } else if (statusResponse.status === 'failed' || statusResponse.status === 'cancelled') {
        navigation.replace('PaymentResultScreen', {
          status: 'failure',
          transactionId,
          amount,
          errorMessage: statusResponse.message || 'Payment failed',
          campaignId: campaignId,
        });
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  }, [transactionId, amount, navigation]);

  const handleNavigationChange = useCallback(
    (navState: any) => {
      const { url } = navState;
      
      console.log('🔗 WebView navigation:', url);

      // Parse query params from callback URL
      const params = parseCallbackParams(url);
      console.log('📋 Callback params:', params);

      // Success callback
      if (url.includes('/callback/success') ||
          url.includes('/payment/success') || 
          url.includes('status=success') ||
          url.includes('/payments/callback/success')) {
        setPaymentHtml(null);
        
        // Extract relevant params from callback
        const basketId = params.basket_id || params.m_payment_id;
        const pfPaymentId = params.pf_payment_id;
        
        console.log('✅ Payment success callback received:', { basketId, pfPaymentId });
        
        checkPaymentStatus();
      }

      // Failure callback
      if (url.includes('/callback/failure') ||
          url.includes('/payment/failure') || 
          url.includes('status=failure') ||
          url.includes('/payments/callback/failure')) {
        setPaymentHtml(null);
        
        // Extract error info from callback params
        const errorCode = params.err_code || params.error_code;
        const errorMessage = params.err_msg || params.error_message || 'Payment failed';
        
        console.log('❌ Payment failure callback received:', { errorCode, errorMessage });
        
        navigation.replace('PaymentResultScreen', {
          status: 'failure',
          transactionId: transactionId || params.basket_id || params.m_payment_id || '',
          amount,
          errorMessage: errorMessage,
          campaignId: campaignId,
        });
      }

      // Cancel callback
      if (url.includes('/callback/cancel') ||
          url.includes('/payment/cancel') || 
          url.includes('status=cancel')) {
        setPaymentHtml(null);
        console.log('🚫 Payment cancelled by user');
        navigation.goBack();
      }
    },
    [navigation, transactionId, amount, checkPaymentStatus, campaignId]
  );

  // Show WebView for PayFast payment page (with form POST)
  if (paymentHtml) {
    return (
      <View style={styles.container}>
        <Header
          title={`${walletName} Payment`}
          onBackPress={handleBackPress}
          showRightIcon={false}
        />
        {webViewLoading && (
          <View style={styles.webViewLoader}>
            <ActivityIndicator size="large" color="#C539A5" />
            <Text style={styles.loadingText}>Loading payment page...</Text>
          </View>
        )}
        <WebView
          source={{ html: paymentHtml }}
          style={styles.webView}
          onLoadStart={() => setWebViewLoading(true)}
          onLoadEnd={() => setWebViewLoading(false)}
          onNavigationStateChange={handleNavigationChange}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          originWhitelist={['*']}
          mixedContentMode="compatibility"
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error:', nativeEvent);
            Alert.alert('Error', 'Failed to load payment page. Please try again.');
            setPaymentHtml(null);
          }}
        />
      </View>
    );
  }

  // Show initial payment screen
  return (
    <View style={styles.container}>
      <Header
        title={`${walletName} Payment`}
        onBackPress={handleBackPress}
        showRightIcon={false}
      />

      <View style={styles.content}>
        {/* Wallet Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <WalletIcon width={wp(12)} height={wp(12)} />
          </View>
        </View>

        {/* Amount Card */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Payment Amount</Text>
          <Text style={styles.amountValue}>Rs. {amount.toLocaleString()}</Text>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Secure {walletName} Payment</Text>
          <Text style={styles.infoText}>
            You will be redirected to {walletName} to complete your payment.
          </Text>
          <Text style={styles.infoText}>
            • Enter your {walletName} mobile number
          </Text>
          <Text style={styles.infoText}>
            • Verify with OTP sent to your phone
          </Text>
          <Text style={styles.infoText}>
            • Complete payment with your PIN
          </Text>
        </View>

        <PrimaryButton
          title={loading ? 'Processing...' : 'Proceed to Payment'}
          onPress={handleInitiatePayment}
          loading={loading}
          disabled={loading}
          buttonStyle={styles.payButton}
          textStyle={styles.payButtonText}
        />
      </View>
    </View>
  );
};

export default WalletPaymentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(5),
    paddingTop: hp(3),
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: hp(3),
  },
  iconCircle: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(10),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  amountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: wp(5),
    alignItems: 'center',
    marginBottom: hp(3),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  amountLabel: {
    fontSize: 14,
    color: '#70737D',
    marginBottom: hp(1),
  },
  amountValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#C539A5',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: wp(5),
    marginBottom: hp(4),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#18181B',
    marginBottom: hp(1.5),
  },
  infoText: {
    fontSize: 13,
    color: '#70737D',
    marginBottom: hp(1),
    lineHeight: 20,
  },
  payButton: {
    width: '100%',
    height: hp(6.5),
    borderRadius: 12,
    alignSelf: 'center',
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  webView: {
    flex: 1,
  },
  webViewLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    zIndex: 10,
  },
  loadingText: {
    marginTop: hp(2),
    fontSize: 14,
    color: '#70737D',
  },
});
// src/features/payment/services/paymentService.ts
// All payment API calls go through our backend - NEVER call PayFast directly

import apiClient from '../../../services/apiClient';
import { supabase } from '../../../services/supabase';

/**
 * Check if user is authenticated before making payment requests
 */
const ensureAuthenticated = async (): Promise<void> => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    console.error('❌ User not authenticated - no session found');
    throw new Error('Please login to continue with payment');
  }
  
  console.log('✅ User authenticated:', session.user?.id);
};

// ============ TYPES ============

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'jazzcash' | 'easypaisa' | 'bank';
  icon?: string;
  enabled: boolean;
}

export interface BankInfo {
  bankCode: string;
  bankName: string;
}

export interface InitiatePaymentRequest {
  campaignId?: number;
  amount: number;
  paymentMethod: 'card' | 'jazzcash' | 'easypaisa' | 'bank';
  customerEmail: string;
  customerPhone: string;
  accountDetails?: {
    accountNumber?: string;
    cnic?: string;
    bankCode?: string;
  };
}

export interface PayFastFormData {
  merchant_id: string;
  merchant_key: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  name_first?: string;
  name_last?: string;
  email_address?: string;
  cell_number?: string;
  m_payment_id: string;
  amount: string;
  item_name: string;
  item_description?: string;
  payment_method?: string;
  signature: string;
  [key: string]: string | undefined; // Allow additional fields
}

export interface InitiatePaymentResponse {
  success: boolean;
  paymentId: string;
  transactionId: string;
  otpRequired: boolean;
  redirectUrl?: string; // Legacy - for backward compatibility
  checkoutUrl?: string; // PayFast checkout URL
  formData?: PayFastFormData; // Form data to POST to PayFast
  message?: string;
}

export interface VerifyOTPRequest {
  transactionId: string;
  otp: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  orderId?: string;
  paymentId?: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  transactionId: string;
  orderId?: string;
  amount?: number;
  message?: string;
}

export interface PaymentHistoryItem {
  id: string;
  transactionId: string;
  amount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

// ============ API FUNCTIONS ============

/**
 * Get available payment methods
 * Endpoint: GET /api/payments/methods
 */
export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  try {
    const response = await apiClient.get('/api/payments/methods');
    return response.data.methods || response.data;
  } catch (error) {
    console.error('❌ Error fetching payment methods:', error);
    throw error;
  }
};

/**
 * Get list of supported banks
 * Endpoint: GET /api/payments/banks
 */
export const getBanks = async (): Promise<BankInfo[]> => {
  try {
    const response = await apiClient.get('/api/payments/banks');
    return response.data.banks || response.data;
  } catch (error) {
    console.error('❌ Error fetching banks:', error);
    throw error;
  }
};

/**
 * Initiate a payment transaction
 * Endpoint: POST /api/payments/initiate
 * 
 * For card payments: Returns redirectUrl for 3D Secure WebView
 * For wallet/bank: Returns otpRequired: true
 */
export const initiatePayment = async (
  data: InitiatePaymentRequest
): Promise<InitiatePaymentResponse> => {
  try {
    // Ensure user is logged in before initiating payment
    await ensureAuthenticated();

    console.log('📤 Initiating payment:', {
      ...data,
      customerPhone: data.customerPhone?.replace(/\d(?=\d{4})/g, '*'), // Mask phone for logs
    });

    const response = await apiClient.post('/api/payments/initiate', data);
    
    console.log('📥 Payment initiation response:', {
      success: response.data.success,
      transactionId: response.data.transactionId,
      otpRequired: response.data.otpRequired,
      hasRedirectUrl: !!response.data.redirectUrl,
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error initiating payment:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Verify OTP for wallet/bank payments
 * Endpoint: POST /api/payments/verify-otp
 */
export const verifyOTP = async (
  data: VerifyOTPRequest
): Promise<VerifyOTPResponse> => {
  try {
    // Ensure user is logged in
    await ensureAuthenticated();

    console.log('📤 Verifying OTP for transaction:', data.transactionId);

    const response = await apiClient.post('/api/payments/verify-otp', data);
    
    console.log('📥 OTP verification response:', {
      success: response.data.success,
      orderId: response.data.orderId,
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error verifying OTP:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get payment/transaction status
 * Endpoint: GET /api/payments/status/:transactionId
 */
export const getPaymentStatus = async (
  transactionId: string
): Promise<PaymentStatusResponse> => {
  try {
    console.log('📤 Checking payment status:', transactionId);

    const response = await apiClient.get(`/api/payments/status/${transactionId}`);
    
    console.log('📥 Payment status:', response.data.status);

    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching payment status:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get user's payment history
 * Endpoint: GET /api/payments/history
 */
export const getPaymentHistory = async (): Promise<PaymentHistoryItem[]> => {
  try {
    const response = await apiClient.get('/api/payments/history');
    return response.data.payments || response.data;
  } catch (error: any) {
    console.error('❌ Error fetching payment history:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Cancel a pending payment
 * Endpoint: POST /api/payments/cancel/:transactionId
 */
export const cancelPayment = async (
  transactionId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.post(`/api/payments/cancel/${transactionId}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error cancelling payment:', error.response?.data || error.message);
    throw error;
  }
};

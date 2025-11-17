// src/services/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';
import { User } from '../types/user';

interface AuthPayload {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
}

const AUTH_KEY = 'auth6';

// ✅ Prefer EncryptedStorage, fallback to AsyncStorage
let storage: typeof EncryptedStorage | typeof AsyncStorage = EncryptedStorage;

if (!EncryptedStorage) {
  console.warn(
    '⚠️ EncryptedStorage not available, falling back to AsyncStorage',
  );
  storage = AsyncStorage;
}

// Save tokens + user
export async function setAuth(
  accessToken: string,
  refreshToken: string,
  user: User,
): Promise<void> {
  const payload: AuthPayload = { accessToken, refreshToken, user };

  try {
    await storage.setItem(AUTH_KEY, JSON.stringify(payload));
    console.log('✅ Auth saved');
  } catch (err) {
    console.log('❌ Error saving with EncryptedStorage:', err);
    try {
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(payload));
      console.log('📥 Saved auth using AsyncStorage fallback');
    } catch (fallbackErr) {
      console.log('❌ Error saving with fallback:', fallbackErr);
    }
  }
}

// Get tokens + user
export async function getAuth(): Promise<AuthPayload> {
  try {
    const data = await storage.getItem(AUTH_KEY);
    if (!data) {
      return { accessToken: null, refreshToken: null, user: null };
    }

    return JSON.parse(data) as AuthPayload;
  } catch (err) {
    console.log('❌ Error reading with EncryptedStorage:', err);
    try {
      const data = await AsyncStorage.getItem(AUTH_KEY);
      if (!data) {
        return { accessToken: null, refreshToken: null, user: null };
      }
      console.log('📤 Retrieved auth using AsyncStorage fallback');
      return JSON.parse(data) as AuthPayload;
    } catch (fallbackErr) {
      console.log('❌ Error reading with fallback:', fallbackErr);
      return { accessToken: null, refreshToken: null, user: null };
    }
  }
}

// Clear auth
export async function clearAuth(): Promise<void> {
  try {
    await storage.removeItem(AUTH_KEY);
    console.log('🗑️ Auth cleared');
  } catch (err) {
    console.log('❌ Error clearing with EncryptedStorage:', err);
    try {
      await AsyncStorage.removeItem(AUTH_KEY);
      console.log('🗑️ Auth cleared using AsyncStorage fallback');
    } catch (fallbackErr) {
      console.log('❌ Error clearing with fallback:', fallbackErr);
    }
  }
}

// Terms and Conditions Agreement
const TERMS_AGREED_KEY = 'terms_agreed';

export async function setTermsAgreed(agreed: boolean): Promise<void> {
  try {
    await storage.setItem(TERMS_AGREED_KEY, JSON.stringify(agreed));
    console.log('✅ Terms agreement saved');
  } catch (err) {
    console.log('❌ Error saving terms agreement:', err);
    try {
      await AsyncStorage.setItem(TERMS_AGREED_KEY, JSON.stringify(agreed));
      console.log('📥 Saved terms agreement using AsyncStorage fallback');
    } catch (fallbackErr) {
      console.log('❌ Error saving terms agreement with fallback:', fallbackErr);
    }
  }
}

export async function getTermsAgreed(): Promise<boolean> {
  try {
    const data = await storage.getItem(TERMS_AGREED_KEY);
    if (!data) {
      return false;
    }
    return JSON.parse(data) as boolean;
  } catch (err) {
    console.log('❌ Error reading terms agreement:', err);
    try {
      const data = await AsyncStorage.getItem(TERMS_AGREED_KEY);
      if (!data) {
        return false;
      }
      console.log('📤 Retrieved terms agreement using AsyncStorage fallback');
      return JSON.parse(data) as boolean;
    } catch (fallbackErr) {
      console.log('❌ Error reading terms agreement with fallback:', fallbackErr);
      return false;
    }
  }
}

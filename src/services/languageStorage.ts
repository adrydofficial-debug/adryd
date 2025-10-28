import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = 'user_language';
const LANGUAGE_SELECTED_KEY = 'language_selected';

export const saveLanguage = async (language: 'en' | 'ur'): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
  } catch (error) {
    console.error('Error saving language:', error);
  }
};

export const getLanguage = async (): Promise<'en' | 'ur' | null> => {
  try {
    const language = await AsyncStorage.getItem(LANGUAGE_KEY);
    return language as 'en' | 'ur' | null;
  } catch (error) {
    console.error('Error getting language:', error);
    return null;
  }
};

export const setLanguageSelected = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_SELECTED_KEY, 'true');
  } catch (error) {
    console.error('Error setting language selected flag:', error);
  }
};

export const isLanguageSelected = async (): Promise<boolean> => {
  try {
    const selected = await AsyncStorage.getItem(LANGUAGE_SELECTED_KEY);
    return selected === 'true';
  } catch (error) {
    console.error('Error checking language selected flag:', error);
    return false;
  }
};

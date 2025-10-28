import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

interface LanguageSelectionModalProps {
  visible: boolean;
  onSelectLanguage: (lang: 'en' | 'ur') => void;
}

const LanguageSelectionModal: React.FC<LanguageSelectionModalProps> = ({
  visible,
  onSelectLanguage,
}) => {
  const [selectedLang, setSelectedLang] = useState<'en' | 'ur'>('en');

  const handleLanguageSelect = (lang: 'en' | 'ur') => {
    setSelectedLang(lang);
    onSelectLanguage(lang);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Choose Your Language</Text>
          <Text style={styles.subtitle}>اپنی زبان منتخب کریں</Text>
          
          <View style={styles.languageButtons}>
            <TouchableOpacity
              style={[
                styles.languageButton,
                selectedLang === 'en' && styles.languageButtonSelected,
              ]}
              onPress={() => handleLanguageSelect('en')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  selectedLang === 'en'
                    ? ['#C539A5', '#E91E63']
                    : ['#f5f5f5', '#f5f5f5']
                }
                style={styles.languageButtonGradient}
              >
                <Text style={[
                  styles.languageButtonText,
                  selectedLang === 'en' && styles.languageButtonTextSelected
                ]}>
                  English
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageButton,
                selectedLang === 'ur' && styles.languageButtonSelected,
              ]}
              onPress={() => handleLanguageSelect('ur')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  selectedLang === 'ur'
                    ? ['#C539A5', '#E91E63']
                    : ['#f5f5f5', '#f5f5f5']
                }
                style={styles.languageButtonGradient}
              >
                <Text style={[
                  styles.languageButtonText,
                  selectedLang === 'hi' && styles.languageButtonTextSelected
                ]}>
                  اردو
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => onSelectLanguage(selectedLang)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#C539A5', '#E91E63']}
              style={styles.continueButtonGradient}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: width * 0.05,
    paddingHorizontal: width * 0.08,
    paddingVertical: height * 0.04,
    width: width * 0.85,
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  title: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: '#C539A5',
    marginBottom: height * 0.01,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: width * 0.035,
    color: '#666',
    marginBottom: height * 0.04,
    textAlign: 'center',
  },
  languageButtons: {
    width: '100%',
    gap: height * 0.02,
    marginBottom: height * 0.04,
  },
  languageButton: {
    width: '100%',
    borderRadius: width * 0.03,
    overflow: 'hidden',
  },
  languageButtonSelected: {
    shadowColor: '#C539A5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  languageButtonGradient: {
    paddingVertical: height * 0.025,
    paddingHorizontal: width * 0.05,
    alignItems: 'center',
    borderRadius: width * 0.03,
  },
  languageButtonText: {
    fontSize: width * 0.045,
    fontWeight: '600',
    color: '#666',
  },
  languageButtonTextSelected: {
    color: 'white',
  },
  continueButton: {
    width: '100%',
    borderRadius: width * 0.03,
    overflow: 'hidden',
    shadowColor: '#C539A5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  continueButtonGradient: {
    paddingVertical: height * 0.025,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default LanguageSelectionModal;

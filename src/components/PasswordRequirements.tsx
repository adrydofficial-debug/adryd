import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

interface PasswordRequirementsProps {
  password?: string;
  namespace?: string;
  translationNamespace?: string;
}

const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  password,
  namespace = 'login',
  translationNamespace = 'auth',
}) => {
  const { t } = useTranslation(translationNamespace);

  const passwordValue = password || '';

  const requirements = {
    minChars: passwordValue.length >= 8,
    uppercase: /[A-Z]/.test(passwordValue),
    lowercase: /[a-z]/.test(passwordValue),
    number: /[0-9]/.test(passwordValue),
  };

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.requirement,
          requirements.minChars ? styles.requirementMet : styles.requirementUnmet,
        ]}>
        • {t(`${namespace}.passwordRequirements.minChars`)}
      </Text>
      <Text
        style={[
          styles.requirement,
          requirements.uppercase ? styles.requirementMet : styles.requirementUnmet,
        ]}>
        • {t(`${namespace}.passwordRequirements.uppercase`)}
      </Text>
      <Text
        style={[
          styles.requirement,
          requirements.lowercase ? styles.requirementMet : styles.requirementUnmet,
        ]}>
        • {t(`${namespace}.passwordRequirements.lowercase`)}
      </Text>
      <Text
        style={[
          styles.requirement,
          requirements.number ? styles.requirementMet : styles.requirementUnmet,
        ]}>
        • {t(`${namespace}.passwordRequirements.number`)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: -12,
    marginLeft: 4,
    marginBottom: 15,
  },
  requirement: {
    fontSize: 11,
    marginBottom: 2,
  },
  requirementMet: {
    color: '#18181B',
  },
  requirementUnmet: {
    color: '#E61215',
  },
});

export default PasswordRequirements;


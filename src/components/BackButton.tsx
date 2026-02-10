import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import i18n from '../i18n';
import { useDrawerStore } from '../store/drawerStore';

const { width } = Dimensions.get('window');

interface BackButtonProps {
  style?: StyleProp<ViewStyle>;
  iconColor?: string;
  onPress?: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({
  style,
  iconColor = '#70737D',
  onPress,
}) => {
  const navigation = useNavigation<any>();
  const navigatedFromDrawer = useDrawerStore(s => s.navigatedFromDrawer);
  const setNavigatedFromDrawer = useDrawerStore(s => s.setNavigatedFromDrawer);
  const reopenDrawerCallback = useDrawerStore(s => s.reopenDrawerCallback);

  const getLang = (lang: string) => (lang.startsWith('ur') ? 'ur' : 'en');
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ur'>(
    getLang(i18n.language),
  );

  useEffect(() => {
    const handleLangChange = (lang: string) =>
      setCurrentLanguage(getLang(lang));
    i18n.on('languageChanged', handleLangChange);
    return () => i18n.off('languageChanged', handleLangChange);
  }, []);

  const handleBackPress = () => {
    if (onPress) {
      onPress();
      return;
    }
    try {
      if (navigatedFromDrawer && reopenDrawerCallback) {
        reopenDrawerCallback();
        setNavigatedFromDrawer(false);
        if (navigation.canGoBack()) {
          navigation.goBack();
          return;
        }
        navigation.navigate('BottomTab' as never, { tab: 'Home' } as never);
        return;
      }

      if (navigation.canGoBack()) {
        navigation.goBack();
        return;
      }

      const parentNav: any = (navigation as any).getParent?.();
      if (parentNav && parentNav.canGoBack?.()) {
        parentNav.goBack();
        return;
      }

      navigation.navigate('BottomTab' as never, { tab: 'Home' } as never);
    } catch (error) {
      console.error('Navigation error:', error);
      try {
        navigation.navigate('BottomTab' as never, { tab: 'Home' } as never);
      } catch (fallbackError) {
        console.error('Fallback navigation error:', fallbackError);
      }
    }
  };

  return (
    <TouchableOpacity
      style={[styles.backButton, style]}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      onPress={handleBackPress}
    >
      <Ionicons
        name={currentLanguage === 'ur' ? 'arrow-forward' : 'arrow-back'}
        size={width * 0.06}
        color={iconColor}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backButton: {
    backgroundColor: '#fff',
    width: width * 0.1,
    height: width * 0.1,
    borderRadius: width * 0.07,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.7,
    borderColor: '#E5E7EB',
    position: 'absolute',
    left: 26,
    top: 26,
  },
});

export default BackButton;

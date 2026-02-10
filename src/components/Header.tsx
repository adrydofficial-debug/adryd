import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import i18n from '../i18n';
import { useDrawerStore } from '../store/drawerStore';

const { width } = Dimensions.get('window');

type HeaderProps = {
  title: string;
  onBackPress?: () => void;
  onRightPress?: () => void;
  currentLanguage;
  rightIcon?: string;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  showBackButton?: boolean;
  showRightIcon?: boolean;
  isRTL?: boolean;
};

const Header: React.FC<HeaderProps> = ({
  title,
  onBackPress,
  onRightPress,
  rightIcon = 'help-circle-outline',
  containerStyle,
  titleStyle,
  showBackButton = true,
  showRightIcon = true,
}) => {
  const navigation = useNavigation<any>();
  const navigatedFromDrawer = useDrawerStore(s => s.navigatedFromDrawer);
  const setNavigatedFromDrawer = useDrawerStore(s => s.setNavigatedFromDrawer);
  const reopenDrawerCallback = useDrawerStore(s => s.reopenDrawerCallback);

  const handleBackPress = () => {
    if (onBackPress) {
      if (navigatedFromDrawer && reopenDrawerCallback) {
        reopenDrawerCallback();
        setNavigatedFromDrawer(false);
      }
      onBackPress();
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

  const shouldShowBack = showBackButton;
  const shouldShowRight = showRightIcon && !!onRightPress;

  const getLang = (lang: string) => (lang.startsWith('ur') ? 'ur' : 'en');

  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ur'>(
    getLang(i18n.language),
  );

  useEffect(() => {
    console.log('Current language:', currentLanguage);
  }, [currentLanguage]);

  // useEffect(() => {
  //   if (visible) {
  //     const lang = (i18n.language as 'en' | 'ur') || 'en';
  //     setCurrentLanguage(lang);
  //   }
  // }, [visible]);

  useEffect(() => {
    const handleLangChange = (lang: string) => {
      setCurrentLanguage(getLang(lang));
    };
    i18n.on('languageChanged', handleLangChange);
    return () => i18n.off('languageChanged', handleLangChange);
  }, []);

  return (
    <View style={[styles.container, containerStyle]}>
      {shouldShowBack ? (
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.8}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={currentLanguage === 'ur' ? 'arrow-forward' : 'arrow-back'}
            size={width * 0.06}
            color="#70737D"
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconPlaceholder} />
      )}

      <Text style={[styles.title, titleStyle]} numberOfLines={1}>
        {title}
      </Text>

      {shouldShowRight ? (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onRightPress}
          activeOpacity={0.8}
        >
          <Ionicons name={rightIcon} size={20} color="#5F5F5F" />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconPlaceholder} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 30,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    backgroundColor: '#fff',
    width: width * 0.1,
    height: width * 0.1,
    borderRadius: width * 0.07,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.7,
    borderColor: '#E5E7EB',
    marginHorizontal: 15,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 15,
  },
  iconPlaceholder: {
    width: 36,
    height: 36,
    marginHorizontal: 15,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginHorizontal: 12,
  },
});

export default Header;

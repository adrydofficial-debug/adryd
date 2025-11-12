import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  I18nManager,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Svg, { Circle, Path } from 'react-native-svg';
import { useProfile } from '../features/profile/hooks/useProfile';
import {
  SecurityIcon,
  CompanySvg,
  FavoriteIcon,
  InviteIcon,
  HelpIcon,
  TermsIcon,
  ContactIcon,
  LogoutIcon,
  EditSquareIcon,
} from '../assets/images';
import { useAuthStore } from '../store/authStore';
import messaging from '@react-native-firebase/messaging';
import { deleteFcmToken } from '../features/fcmtoken/api/api';
import i18n from '../i18n';
import { saveLanguage } from '../services/languageStorage';
type DrawerItem = {
  id: number;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  color?: string;
  icon: 'security' | 'companies'  | 'favorite' | 'invite' | 'help' | 'terms' | 'contact' | 'logout';
};

type DrawerComponentProps = {
  visible: boolean;
  onClose: () => void;
};

const { width, height } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(width * 0.82, 340);
// Push the drawer slightly beyond its width to avoid any visible sliver in RTL/layout transitions
const OFFSCREEN_X = DRAWER_WIDTH + 40;

const DrawerComponent: React.FC<DrawerComponentProps> = ({ visible, onClose }) => {
  const navigation = useNavigation();
  const { t } = useTranslation('profile');
  // Only fetch profile when drawer is visible to prevent unnecessary API calls
  const { data: profile } = useProfile(visible);
  const { user } = useAuthStore();
  const logout = useAuthStore(s => s.logout);
  const translateX = useRef(new Animated.Value(-OFFSCREEN_X)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ur'>(
    (i18n.language as 'en' | 'ur') || 'en'
  );

  useEffect(() => {
    if (visible) {
      const lang = (i18n.language as 'en' | 'ur') || 'en';
      setCurrentLanguage(lang);
    }
  }, [visible]);

  useEffect(() => {
    const handleLangChange = (lang: string) => {
      setCurrentLanguage((lang as 'en' | 'ur') || 'en');
    };
    i18n.on('languageChanged', handleLangChange);
    return () => {
      i18n.off('languageChanged', handleLangChange);
    };
  }, []);

  const handleLanguageToggle = async (lang: 'en' | 'ur') => {
    try {
      await saveLanguage(lang);
      const isRTL = lang === 'ur';
      
      // Update I18nManager BEFORE changing language to ensure proper layout direction
      if (I18nManager.isRTL !== isRTL) {
        I18nManager.forceRTL(isRTL);
        I18nManager.allowRTL(isRTL);
      }
      
      // Change language - this will trigger languageChanged event
      await i18n.changeLanguage(lang);
      setCurrentLanguage(lang);
      
      // On Android, RN Native may require a reload for RTL changes, but we try without first
      // The languageChanged listener in i18n/index.ts will also apply layout direction
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0.35,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -OFFSCREEN_X,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateX, backdropOpacity]);

  const menuItems: DrawerItem[] = [
    {
      id: 1,
      title: t('drawer.security'),
      subtitle: t('drawer.securitySubtitle'),
      onPress: () => {
        onClose();
        try {
          navigation.navigate('ChangePassword' as never);
          console.log('✅ Navigation to ChangePassword successful');
        } catch (error) {
          console.error('❌ Navigation error:', error);
        }
      },
      // color: '#E91E63',
      icon: 'security',
    },
    {
      id: 2,
      title: t('drawer.companies'),
      subtitle: t('drawer.companiesSubtitle'),
      onPress: () => {
        onClose(); // Close the drawer first
        try {
          (navigation as any).navigate('PreviousCompanyScreen', {
            isSelectable: true,
          });
          console.log('✅ Navigation to CompanyListScreen successful');
        } catch (error) {
          console.error('❌ Navigation error:', error);
        }
      },
      // color: '#9C27B0',
      icon: 'companies',
    },

    {
      id: 4,
      title: t('drawer.favorite'),
      subtitle: t('drawer.favoriteSubtitle'),
       onPress: () => {
        onClose(); // Close the drawer first
        try {
          navigation.navigate('FavouritesScreen' as never);
          console.log('✅ Navigation to FavouritesScreen successful');
        } catch (error) {
          console.error('❌ Navigation error:', error);
        }
      },
      // color: '#FF5722',
      icon: 'favorite',
    },
    {
      id: 5,
      title: t('drawer.invite'),
      subtitle: t('drawer.inviteSubtitle'),
      onPress: () => {},
      // color: '#4CAF50',
      icon: 'invite',
    },
  ];

  const supportItems: DrawerItem[] = [
    { id: 6, title: t('drawer.help'), onPress: () => {},
    //  color: '#607D8B', 
    icon: 'help' },
    { id: 7, title: t('drawer.terms'), onPress: () => {},
    //  color: '#795548',
      icon: 'terms' },
      { id: 8, title: t('drawer.contact'), onPress: () => {
        onClose();
        try {
          navigation.navigate('ContactSupportScreen' as never);
          console.log('✅ Navigation to ContactSupportScreen successful');
        } catch (error) {
          console.error('❌ Navigation error:', error);
        }
      },
    //  color: '#009688',
      icon: 'contact' },
  ];

  const iconMap: Record<DrawerItem['icon'], React.ComponentType<any>> = {
    security: SecurityIcon,
    companies: CompanySvg,
    favorite: FavoriteIcon,
    invite: InviteIcon,
    help: HelpIcon,
    terms: TermsIcon,
    contact: ContactIcon,
    logout: LogoutIcon,
  };

  const renderMenuItem = (item: DrawerItem, hasSubtitle: boolean = true) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <View style={styles.iconContainer}>
          {(() => {
            const IconComp = iconMap[item.icon];
            return <IconComp width={22} height={22} />;
          })()}
        </View>
      </View>
      <View style={styles.menuItemCenter}>
        <Text style={styles.menuItemTitle}>{item.title}</Text>
        {hasSubtitle && item.subtitle ? (
          <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
        ) : null}
      </View>
      <View style={styles.menuItemRight}>
        <Svg width={18} height={18} viewBox="0 0 24 24">
          <Path d="M8 4l8 8-8 8" stroke="#BDBDBD" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </View>
    </TouchableOpacity>
  );

  return (
    <View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[StyleSheet.absoluteFill, ({ direction: 'ltr' } as any)]}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateX }],
            // Force drawer to always be on the left, even in RTL mode
            left: 0,
            right: undefined,
            zIndex: visible ? 1 : -1,
          },
        ]}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.profileCard}>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImage}>
                {(profile?.avatar_url || user?.user_metadata?.avatar_url) ? (
                  <Image 
                    source={{ uri: profile?.avatar_url || user?.user_metadata?.avatar_url }} 
                    style={styles.profileImageAvatar}
                  />
                ) : (
                  <Text style={styles.profileImageText}>
                    {(profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.user_metadata?.username || user?.email?.split('@')[0] || 'U')?.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.profileCenter}>
              <Text style={styles.profileName}>
                {profile?.full_name ||
                 user?.user_metadata?.full_name || 
                 user?.user_metadata?.name || 
                 user?.user_metadata?.username || 
                 user?.email?.split('@')[0] || 
                 'User'}
              </Text>
              <Text style={styles.profilePhone}>
                {profile?.phone || t('drawer.noPhone')}
              </Text>
            </View>
             <TouchableOpacity 
               style={styles.editButton} 
               activeOpacity={0.7} 
               onPress={() => {
                
                 onClose(); // Close the drawer first
                 try {
                   navigation.navigate('UpdateProfile' as never);
                   console.log('✅ Navigation to UpdateProfile successful');
                 } catch (error) {
                   console.error('❌ Navigation error:', error);
                 }
               }}
             >
               <EditSquareIcon width={22} height={22} />
             </TouchableOpacity>
            {/* <TouchableOpacity style={styles.editButton} activeOpacity={0.7}>
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity> */}
          </View>

          <View style={styles.menuCard}>{menuItems.map(i => renderMenuItem(i, true))}</View>

          <View style={styles.menuCard}>{supportItems.map(i => renderMenuItem(i, false))}</View>

          {/* Language Toggle */}
          <View style={styles.menuCard}>
            <View style={styles.languageToggleContainer}>
              <Text style={styles.languageToggleLabel}>Language</Text>
              <View style={styles.languageToggle}>
                <TouchableOpacity
                  style={[
                    styles.languageOption,
                    currentLanguage === 'en' && styles.languageOptionActive,
                  ]}
                  onPress={() => handleLanguageToggle('en')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.languageOptionText,
                      currentLanguage === 'en' && styles.languageOptionTextActive,
                    ]}
                  >
                    ENG
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.languageOption,
                    currentLanguage === 'ur' && styles.languageOptionActive,
                  ]}
                  onPress={() => handleLanguageToggle('ur')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.languageOptionText,
                      currentLanguage === 'ur' && styles.languageOptionTextActive,
                    ]}
                  >
                    URDU
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.menuCard}>
            <TouchableOpacity
              style={[styles.menuItem, styles.logoutItem]}
              onPress={async () => {
                try {
                  onClose();
                  // Best-effort delete FCM token before logout
                  try {
                    const token = await messaging().getToken();
                    if (token) {
                      await deleteFcmToken(token);
                    }
                  } catch (e) {
                    console.warn('[FCM] delete on logout failed:', e);
                  }
                  await logout();
                  // AuthGate will switch to AuthNavigator; for safety, attempt nav
                  navigation.navigate('LoginScreen' as never);
                } catch (e) {
                  console.error('Logout error:', e);
                }
              }}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                <LogoutIcon width={22} height={22} />
                </View>
              </View>
              <View style={styles.menuItemCenter}>
                <Text style={styles.menuItemTitle}>{t('drawer.logout')}</Text>
              </View>
              <View style={styles.menuItemRight} />
            </TouchableOpacity>
          </View>

          <View style={{ height: height * 0.05 }} />
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: undefined,
    width: DRAWER_WIDTH,
    backgroundColor: '#FFFFFF',
    // paddingTop: 16,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    // Force drawer to always open from left, ignore RTL
    ...({ writingDirection: 'ltr' } as any),
  },
  profileCard: {
    backgroundColor: '#BF349E',
    marginHorizontal: width * 0.04,
    marginBottom: 14,
    borderRadius: 16,
    padding: width * 0.04,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical:30
 
  },
  profileImageContainer: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: width * 0.075,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    marginRight: 12,
  },
  profileImage: {
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: width * 0.06,
    backgroundColor: '#9C27B0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  profileImageAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: width * 0.06,
  },
  profileCenter: { flex: 1 },
  profileName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profilePhone: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.9,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: { fontSize: 14 },
  menuCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: width * 0.04,
    marginBottom: 10,
    borderRadius: 12,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.045,
    paddingVertical: 10,
  },
  logoutItem: { borderBottomWidth: 0 },
  menuItemLeft: { marginRight: width * 0.04 },
  iconContainer: {
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: width * 0.06,
    backgroundColor: '#FCD9F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemCenter: { flex: 1 },
  menuItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3D3D3D',
    marginBottom: 2,
  },
  menuItemSubtitle: { fontSize: 11, color: '#9E9E9E' },
  menuItemRight: { width: width * 0.06, alignItems: 'center' },
  arrowIcon: { fontSize: 20, color: '#BDBDBD', fontWeight: '300' },
  languageToggleContainer: {
    paddingHorizontal: width * 0.045,
    paddingVertical: 12,
  },
  languageToggleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3D3D3D',
    marginBottom: 8,
  },
  languageToggle: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 4,
  },
  languageOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageOptionActive: {
    backgroundColor: '#C539A5',
  },
  languageOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  languageOptionTextActive: {
    color: '#FFFFFF',
  },
});

export default DrawerComponent;



import messaging from '@react-native-firebase/messaging';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Dimensions,
  Easing,
  I18nManager,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import {
  CompanySvg,
  ContactIcon,
  EditSquareIcon,
  FavoriteIcon,
  HelpIcon,
  InviteIcon,
  LogoutIcon,
  SecurityIcon,
  TermsIcon,
  Images,
} from '../assets/images';
import { deleteFcmToken } from '../features/fcmtoken/api/api';
import { useProfile } from '../features/profile/hooks/useProfile';
import i18n from '../i18n';
import { saveLanguage } from '../services/languageStorage';
import { useAuthStore } from '../store/authStore';
import { useDrawerStore } from '../store/drawerStore';
import { useCampaignFlowStore } from '../store/campaignFlowStore';
type DrawerItem = {
  id: number;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  color?: string;
  icon:
    | 'security'
    | 'companies'
    | 'favorite'
    | 'invite'
    | 'help'
    | 'terms'
    | 'contact'
    | 'logout';
};

type DrawerComponentProps = {
  visible: boolean;
  onClose: () => void;
};

const { width, height } = Dimensions.get('window');
const DRAWER_WIDTH = width; // Fullscreen drawer
// Push the drawer slightly beyond its width to avoid any visible sliver in RTL/layout transitions
const OFFSCREEN_X = DRAWER_WIDTH + 40;

const DrawerComponent: React.FC<DrawerComponentProps> = ({
  visible,
  onClose,
}) => {
  const navigation = useNavigation();
  const { t } = useTranslation('profile');
  // Only fetch profile when drawer is visible to prevent unnecessary API calls
  const { data: profile } = useProfile(visible);
  const { user } = useAuthStore();
  const logout = useAuthStore(s => s.logout);
  const setIsVisible = useDrawerStore(s => s.setIsVisible);
  const setNavigatedFromDrawer = useDrawerStore(s => s.setNavigatedFromDrawer);
  const reopenDrawerCallback = useDrawerStore(s => s.reopenDrawerCallback);
  const resetCampaignFlow = useCampaignFlowStore(s => s.resetCampaignFlow);
  const translateX = useRef(new Animated.Value(-OFFSCREEN_X)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [isContactModalVisible, setIsContactModalVisible] = useState(false);
  const contactEntries = [
    { id: 'primaryPhone', display: '(+92) 307 4074031', link: 'tel:+923074074031' },
    { id: 'secondaryPhone', display: '4256945486466', link: 'tel:4256945486466' },
    { id: 'email', display: 'adryd@app', link: 'mailto:adryd@app?subject=Support%20Request&body=Hi%20Adryd%20Team,' },
  ];
  const closeContactModal = () => setIsContactModalVisible(false);
  const handleContactPress = async (link?: string) => {
    if (!link) {
      return;
    }
    try {
      await Linking.openURL(link);
    } catch (error) {
      console.error('Contact link error:', error);
    }
  };
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ur'>(
    (i18n.language as 'en' | 'ur') || 'en',
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
      I18nManager.forceRTL(isRTL);
      I18nManager.allowRTL(isRTL);

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
    setIsVisible(visible);
    if (!visible) {
      setIsContactModalVisible(false);
    } else {
      setNavigatedFromDrawer(false);
    }
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
  }, [visible, translateX, backdropOpacity, setIsVisible]);

  const menuItems: DrawerItem[] = [
    {
      id: 1,
      title: t('drawer.security'),
      subtitle: t('drawer.securitySubtitle'),
      onPress: () => {
        try {
          setNavigatedFromDrawer(true);
          navigation.navigate('ChangePassword' as never);
          console.log('✅ Navigation to ChangePassword successful');
          setTimeout(() => onClose(), 100);
        } catch (error) {
          console.error('❌ Navigation error:', error);
          onClose();
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
        try {
          setNavigatedFromDrawer(true);
          resetCampaignFlow();          
          (navigation as any).navigate('PreviousCompanyScreen', {
            isSelectable: true,
          });
          console.log('✅ Navigation to CompanyListScreen successful');
          setTimeout(() => onClose(), 100);
        } catch (error) {
          console.error('❌ Navigation error:', error);
          onClose();
        }
      },
      // color: '#9C27B0',
      icon: 'companies',
    },

    {
      id: 5,
      title: t('drawer.invite'),
      subtitle: t('drawer.inviteSubtitle'),
      onPress: () => {
        try {
          setNavigatedFromDrawer(true);
          navigation.navigate('InviteLink' as never);
          console.log('✅ Navigation to InviteLink successful');
          setTimeout(() => onClose(), 100);
        } catch (error) {
          console.error('❌ Navigation to InviteLink failed:', error);
          onClose();
        }
      },
      // color: '#4CAF50',
      icon: 'invite',
    },
  ];

  const supportItems: DrawerItem[] = [
    {
      id: 6,
      title: t('drawer.help'),
      onPress: () => {
        try {
          setNavigatedFromDrawer(true);
          navigation.navigate('HelpFAQsScreen' as never);
          console.log('✅ Navigation to HelpFAQsScreen successful');
          setTimeout(() => onClose(), 100);
        } catch (error) {
          console.error('❌ Navigation error:', error);
          onClose();
        }
      },
      //  color: '#607D8B',
      icon: 'help',
    },
    {
      id: 7,
      title: t('drawer.terms'),
      onPress: () => {
        try {
          setNavigatedFromDrawer(true);
          navigation.navigate('TermsPrivacyOptions' as never);
          console.log('✅ Navigation to TermsPrivacyOptions successful');
          setTimeout(() => onClose(), 100);
        } catch (error) {
          console.error('❌ Navigation error:', error);
          onClose();
        }
      },
      //  color: '#795548',
      icon: 'terms',
    },
    {
      id: 8,
      title: t('drawer.contact'),
      onPress: () => {
        setIsContactModalVisible(true);
      },
      //  color: '#009688',
      icon: 'contact',
    },
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
          <Path
            d="M8 4l8 8-8 8"
            stroke="#BDBDBD"
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      {visible && (
        <View
          pointerEvents={visible ? 'auto' : 'none'}
          style={[StyleSheet.absoluteFill, { direction: 'ltr', zIndex: 9999 } as any]}
        >
          <TouchableWithoutFeedback onPress={onClose}>
            <Animated.View
              style={[styles.backdrop, { opacity: backdropOpacity, zIndex: 9998 }]}
            />
          </TouchableWithoutFeedback>

          <Animated.View
            style={[
              styles.drawerWrapper,
              {
                transform: [{ translateX }],
                // Force drawer to always be on the left, even in RTL mode
                left: 0,
                right: undefined,
                zIndex: visible ? 10000 : -1,
              },
            ]}
          >
            <View style={styles.drawer}>
              {/* Android Shadow - Right Side Only */}
              {Platform.OS === 'android' && (
                <LinearGradient
                  colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.1)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.androidShadow}
                  pointerEvents="none"
                />
              )}
              <SafeAreaView style={styles.safeArea} edges={['top']}>
              {/* Header with Back Arrow and Help Icon */}
              <View style={styles.headerContainer}>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={onClose}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="arrow-back" size={width * 0.06} color="#70737D" />
                </TouchableOpacity>
                <View style={styles.headerSpacer} />
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={() => {
                    try {
                      setNavigatedFromDrawer(true);
                      navigation.navigate('HelpFAQsScreen' as never);
                      console.log('✅ Navigation to HelpFAQsScreen successful');
                      setTimeout(() => onClose(), 100);
                    } catch (error) {
                      console.error('❌ Navigation error:', error);
                      onClose();
                    }
                  }}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="help-circle-outline" size={24} color="#3D3D3D" />
                </TouchableOpacity>
              </View>

              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                <View style={styles.profileCard}>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImage}>
                {profile?.avatar_url || user?.user_metadata?.avatar_url ? (
                  <Image
                    source={{
                      uri:
                        profile?.avatar_url || user?.user_metadata?.avatar_url,
                    }}
                    style={styles.profileImageAvatar}
                  />
                ) : (
                  <Image
                    source={Images.frame}
                    style={styles.profileImageAvatar}
                    resizeMode="cover"
                  />
                )}
              </View>
            </View>
            <View style={styles.profileCenter}>
              <Text style={styles.profileName} numberOfLines={1} ellipsizeMode="tail">
                {profile?.full_name ||
                  user?.user_metadata?.full_name ||
                  user?.user_metadata?.name ||
                  user?.user_metadata?.username ||
                  user?.email?.split('@')[0] ||
                  'User'}
              </Text>
              <Text style={styles.profileID} numberOfLines={1} ellipsizeMode="middle">
                ID {user?.id || profile?.id || 'N/A'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              activeOpacity={0.7}
              onPress={() => {
                try {
                  setNavigatedFromDrawer(true);
                  navigation.navigate('UpdateProfile' as never);
                  console.log('✅ Navigation to UpdateProfile successful');
                  setTimeout(() => onClose(), 100);
                } catch (error) {
                  console.error('❌ Navigation error:', error);
                  onClose();
                }
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Image 
                source={Images.editSquare} 
                style={styles.editIconImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
            {/* <TouchableOpacity style={styles.editButton} activeOpacity={0.7}>
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity> */}
          </View>

          {/* Referral Banner */}
          <TouchableOpacity
            style={styles.referralBanner}
            onPress={() => {
              const inviteItem = menuItems.find(item => item.icon === 'invite');
              inviteItem?.onPress?.();
            }}
            activeOpacity={0.8}
          >
            <Image 
              source={Images.bannerSetting} 
              style={styles.referralBannerImage}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <View style={styles.menuCard}>
            {menuItems.map(i => renderMenuItem(i, true))}
          </View>

          <View style={styles.menuCard}>
            {supportItems.map(i => renderMenuItem(i, false))}
          </View>

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
                  disabled={currentLanguage === 'en'}
                >
                  <Text
                    style={[
                      styles.languageOptionText,
                      currentLanguage === 'en' &&
                        styles.languageOptionTextActive,
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
                  disabled={currentLanguage === 'ur'}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.languageOptionText,
                      currentLanguage === 'ur' &&
                        styles.languageOptionTextActive,
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

                <View style={{ height: Platform.OS === 'ios' ? 40 : 50 }} />
              </ScrollView>
              </SafeAreaView>
            </View>
          </Animated.View>
        </View>
      )}
      <Modal
        visible={isContactModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeContactModal}
      >
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback onPress={closeContactModal}>
            <View style={styles.modalOverlay} />
          </TouchableWithoutFeedback>
          <View style={styles.contactSheet}>
            <View style={styles.sheetHandle} />
            {contactEntries.map(entry => (
              <View key={entry.id}>
                <TouchableOpacity
                  style={styles.contactRow}
                  activeOpacity={0.8}
                  onPress={() => handleContactPress(entry.link)}
                >
                  <Text style={styles.contactValue}>{entry.display}</Text>
                </TouchableOpacity>
                <View style={styles.contactDivider} />
              </View>
            ))}
           
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 9998,
  },
  drawerWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: DRAWER_WIDTH,
    overflow: 'hidden',
  },
  drawer: {
    flex: 1,
    width: DRAWER_WIDTH,
    backgroundColor: '#FFFFFF',
    paddingTop: 0,
    paddingBottom: 0,
    // Shadow only on the right side (where drawer opens from) - iOS
    ...(Platform.OS === 'ios' && {
      shadowColor: '#000',
      shadowOffset: { width: -2, height: 0 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    }),
    // No elevation for Android to prevent bottom shadow
    elevation: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    // Force drawer to always open from left, ignore RTL
    ...({ writingDirection: 'ltr' } as any),
  },
  androidShadow: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: 10,
    zIndex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    zIndex: 2,
  },
  headerContainer: {
    paddingHorizontal: width * 0.04,
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  headerButton: {
    width: width * 0.10,
    height: width * 0.10,
    borderRadius: width * 0.07,
    backgroundColor: '#fff',
    borderWidth: 0.7,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSpacer: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: width * 0.04,
    marginBottom: 14,
    borderRadius: 15,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 0.7,
    borderColor: '#E5E7EB',
  },
  profileImageContainer: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: width * 0.075,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    marginRight: 12,
  },
  profileImage: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: width * 0.075,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  profileImageAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: width * 0.06,
  },
  profileCenter: { 
    flex: 1,
    marginRight: 12,
    minWidth: 0, // Allow flex to shrink properly
    flexShrink: 1, // Allow it to shrink if needed
  },
  profileName: {
    color: '#3D3D3D',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileID: {
    color: '#9E9E9E',
    fontSize: 13,
    lineHeight: 18,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    marginLeft: 8,
    flexShrink: 0, // Prevent button from shrinking
    backgroundColor: 'transparent',
  },
  editIcon: { fontSize: 14 },
  editIconImage: {
    width: 22,
    height: 22,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: width * 0.04,
    marginBottom: 10,
    borderRadius: 15,
    paddingVertical: 4,
    borderWidth: 0.7,
    borderColor: '#E5E7EB',
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
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Inter',
    lineHeight: 19.5,
    letterSpacing: 0,
    color: '#18181B',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 10,
    fontWeight: '300',
    fontFamily: 'Inter',
    lineHeight: 16,
    letterSpacing: 0,
    color: '#70737D',
  },
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
  referralBanner: {
    marginHorizontal: width * 0.04,
    marginBottom: -6,
    marginTop: -18,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  referralBannerImage: {
    width: width * 1,
    height: undefined,
    aspectRatio: 3.2, 
    borderRadius: 16,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    flexGrow: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    flex: 1,
  },
  contactSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
  },
  sheetHandle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 20,
  },
  contactRow: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  contactDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
  },
  contactCloseButton: {
    marginTop: 18,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    alignItems: 'center',
  },
  contactCloseText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4B5563',
  },
});

export default DrawerComponent;

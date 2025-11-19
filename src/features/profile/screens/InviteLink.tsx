import React, { useMemo } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ToastAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Clipboard from '@react-native-clipboard/clipboard';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Image } from 'react-native';
import { Images } from '../../../assets/images';
import BackButton from '../../../components/BackButton';

const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

const statusBadges = [
  { label: 'Active', color: '#3DCC8E' },
  { label: 'Draft', color: '#E5E7EB' },
  { label: 'In Progress', color: '#FDBA74' },
  { label: 'Pending', color: '#FCD34D' },
  { label: 'Complete', color: '#C4B5FD' },
  { label: 'Blocked', color: '#F28EA6' },
];

const InviteLink: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const navigation = useNavigation();
  const { t } = useTranslation('profile');
  const referralLink = 'https://invite.adrydmarketingco.co/invite?';
  const styles = useMemo(() => createStyles(width, height), [width, height]);

  const handleCopyLink = () => {
    Clipboard.setString(referralLink);
    if (Platform.OS === 'android') {
      ToastAndroid.show(t('inviteScreen.copiedToast'), ToastAndroid.SHORT);
    } else {
      Alert.alert(t('inviteScreen.copiedTitle'), t('inviteScreen.copiedMessage'));
    }
  };

  const handleShareInvite = async () => {
    try {
      await Share.share({
        message: `${t('inviteScreen.shareMessage')} ${referralLink}`,
      });
    } catch (error) {
      console.error('Invite share error', error);
    }
  };

  return (
    <LinearGradient
      colors={['#FFE6F3', '#F5ECFF', '#FFFFFF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.headerRow}>
            <BackButton/>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleShareInvite}
              accessibilityRole="button"
              accessibilityLabel={t('inviteScreen.shareA11y')}
            >
               <Ionicons name="help-circle-outline" size={24} color="#70737D" />
            </TouchableOpacity>
          </View>

          <View style={styles.badgeCloud}>
            <Text style={styles.headlineTop}>{t('inviteScreen.headlineTop')}</Text>
            <Text style={styles.headlineBottom}>{t('inviteScreen.headlineBottom')}</Text>
          </View>

          <View style={styles.illustrationCard}>
            <Image
              source={Images.inviteIllustration}
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>

          <View style={styles.textBlock}>
            <Text style={styles.description}>
              <Text style={styles.heroHighlight}>{t('inviteScreen.ctaHighlight')} </Text>
              {t('inviteScreen.ctaText')}
            </Text>
          </View>

          <View style={styles.linkCard}>
            <Text style={styles.linkText} numberOfLines={1}>
              {referralLink}
            </Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyLink}
              accessibilityRole="button"
              accessibilityLabel={t('inviteScreen.copyA11y')}
              activeOpacity={0.8}
            >
              <Ionicons name="copy-outline" size={styles.copyIconSize} color="#D946EF" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleShareInvite}
            activeOpacity={0.9}
          >
            <Text style={styles.ctaText}>{t('inviteScreen.primaryCta')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const createStyles = (windowWidth: number, windowHeight: number) => {
  const wp = (percentage: number) => (windowWidth * percentage) / 100;
  const hp = (percentage: number) => (windowHeight * percentage) / 100;
  const scaleWidth = (size: number) => (windowWidth / BASE_WIDTH) * size;
  const scaleHeight = (size: number) => (windowHeight / BASE_HEIGHT) * size;
  const radius = Math.min(scaleWidth(28), 36);
  const iconSize = Math.max(20, scaleWidth(22));
  const copyIconSize = Math.max(18, scaleWidth(20));

  const sheet = StyleSheet.create({
    gradient: {
      flex: 1,
    },
    safeArea: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: wp(6),
      paddingBottom: hp(4),
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: hp(2.5),
    },
    iconButton: {
      width: wp(10),
      height: wp(10),
      borderRadius: wp(6),
      // backgroundColor: 'rgba(255,255,255,0.95)',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: hp(1.9),
      
    
    },
    badgeCloud: {
      justifyContent: 'center',
      marginBottom: hp(2.1),
      alignItems: 'center',
    },
    badge: {
      paddingHorizontal: wp(4),
      paddingVertical: hp(0.6),
      borderRadius: radius,
      backgroundColor: '#FEC6D8',
    },
    badgeText: {
      color: '#1F2937',
      fontWeight: '600',
      fontSize: scaleWidth(11),
    },
    illustrationCard: {
      // backgroundColor: '#FFFFFF',
      borderRadius: radius,
      // paddingVertical: hp(2),
      alignItems: 'center',
      marginBottom: hp(3),
      // shadowColor: '#E879F9',
      // shadowOpacity: 0.15,
      // shadowOffset: { width: 0, height: 14 },
      // shadowRadius: 30,
      // elevation: 12,
    },
    illustration: {
      width: wp(150),
      height: hp(42),
    },
    textBlock: {
      alignItems: 'center',
      marginBottom: hp(3),
      paddingHorizontal: wp(4),
    },
    headlineTop: {
      fontSize: 18,
      color: '#1F1F1F',
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: hp(0.1),
    },
    headlineBottom: {
      fontSize: 18,
      color: '#000',
      fontWeight: '600',
      textAlign: 'center',
      marginTop: 0,
    },
    description: {
      fontSize: 16,
      color: '#4B5563',
      textAlign: 'center',
      marginBottom: hp(0.4),
      lineHeight: scaleHeight(20),
      paddingHorizontal: wp(15),
    },
    heroHighlight: {
      color: '#C026D3',
      fontWeight: '700',
      textDecorationLine: 'underline',
    },
    helper: {
      fontSize: scaleWidth(12),
      color: '#6B7280',
      textAlign: 'center',
    },
    linkCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: 15,
      paddingHorizontal: wp(6),
      paddingVertical: hp(1.5),
      borderWidth: 1,
      borderColor: '#E5E7EB',
      marginBottom: hp(2),
      width:"95%",
      justifyContent:"center",
      alignContent:"center",
      alignSelf:"center",
    },
    linkText: {
      flex: 1,
      color: '#111827',
      fontSize: 12,
      fontWeight: '300',
    },
    copyButton: {
      width: wp(10),
      height: wp(8),
      borderRadius: wp(4),
      backgroundColor: '#FDF2F8',
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: wp(2),
    },
    ctaButton: {
      backgroundColor: '#C539A5',
      borderRadius: 12,
      paddingVertical: hp(1.8),
      alignItems: 'center',
     width:"95%",
      alignSelf:"center",
      marginTop: hp(1.8),
    },
    ctaText: {
      color: '#FFFFFF',
      fontSize: scaleWidth(16),
      fontWeight: '700',
    },
  });

  return { ...sheet, iconSize, copyIconSize };
};

export default InviteLink;


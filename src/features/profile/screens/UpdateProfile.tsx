import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomButton from '../../../components/CustomButton';
import CustomInput from '../../../components/CustomInput';
import ProfileUser from '../../../components/ProfileUser';
import { useProfile, useUpdateProfile, useUploadProfileAvatar } from '../hooks';
import NoInternet from '../../../components/NoInternet';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
const { width, height } = Dimensions.get('window');
const wp = (p: number) => (width * p) / 100;
const hp = (p: number) => (height * p) / 100;

const UpdateProfile: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation('profile');
  const [refreshKey, setRefreshKey] = useState(0);
  const [languageKey, setLanguageKey] = useState(0);

  // Profile data from Supabase
  const { data: profile, isLoading: profileLoading, refetch } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadProfileAvatar();

  // State for the editable fields
  const [fullName, setFullName] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | undefined>(undefined);

  // Listen for language changes and force re-render
  useEffect(() => {
    const handleLanguageChange = () => {
      setLanguageKey(prev => prev + 1);
    };
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  // Initialize fields from profile data
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setAvatarUri(profile.avatar_url || undefined);
    }
  }, [profile]);

  // Refetch profile data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setRefreshKey(prev => prev + 1);
      refetch();
      setLanguageKey(prev => prev + 1);
    }, [refetch]),
  );

  const initials = useMemo(() => {
    const u = fullName?.[0] ?? '';
    return u.toUpperCase() || 'U';
  }, [fullName]);

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        full_name: fullName.trim(),
        avatar_url: avatarUri, // include current selected avatar in save
      });

      // Force refresh by updating key and refetching
      setRefreshKey(prev => prev + 1);
      await refetch();

      navigation.goBack();
    } catch (error: any) {
      // Silent error handling - no alerts
      console.error('Profile update error:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      key={languageKey}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={22} color="#111" />
          </TouchableOpacity>
          <Text style={styles.title} key={`title-${languageKey}`}>{t('updateProfile.screenTitle')}</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Avatar / Header card */}
        <ProfileUser
          key={refreshKey}
          username={fullName}
          avatarUri={avatarUri}
          onImageSelected={async imageUri => {
            // Update local state immediately for better UX
            setAvatarUri(imageUri);
          }}
          onImageUploaded={async uploadedImage => {
            // Only stage the selected avatar; actual update will occur on button press
            setAvatarUri(uploadedImage.publicUrl);
          }}
          containerStyle={styles.headerCard}
        />

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.smallLabel}>{t('updateProfile.fullName')}</Text>
          <CustomInput
            value={fullName}
            onChangeText={setFullName}
            placeholder={t('updateProfile.enterFullName')}
            containerStyle={styles.inputContainerFix}
          />

          <Text style={styles.smallLabel}>{t('updateProfile.phoneNumber')}</Text>
          <CustomInput
            value={profile?.phone || ''}
            onChangeText={() => {}} // Read-only
            placeholder={t('updateProfile.phonePlaceholder')}
            containerStyle={styles.inputContainerFix}
          />
          <Text style={styles.noteText}>
            {t('updateProfile.phoneNote')}
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonWrap}>
          <CustomButton
            title={t('updateProfile.cta')}
            onPress={handleSave}
            loading={updateProfile.isPending}
            disabled={updateProfile.isPending}
          />
        </View>
      </ScrollView>
       <NoInternet />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingVertical: 25 },
  content: { paddingHorizontal: wp(6), paddingBottom: hp(6) },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: hp(2.5),
    marginBottom: hp(1),
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 16, fontWeight: '700', color: '#111' },
  headerCard: {
    alignItems: 'center',
    marginTop: hp(1.5),
    marginBottom: hp(2.5),
  },
  form: { marginTop: hp(1) },
  smallLabel: { fontSize: 10, color: '#999', marginBottom: 4, marginTop: 10 },
  inputContainerFix: { marginBottom: hp(0.6) },
  noteText: { fontSize: 10, color: '#999', marginTop: 4 },
  buttonWrap: { marginTop: hp(4) },
});

export default UpdateProfile;

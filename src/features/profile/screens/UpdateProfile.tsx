import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import NoInternet from '../../../components/NoInternet';
import ProfileUser from '../../../components/ProfileUser';
import i18n from '../../../i18n';
import BackButton from '../../../components/BackButton';
import { useProfile, useUpdateUserProfile } from '../hooks';

const { width, height } = Dimensions.get('window');
const wp = (p: number) => (width * p) / 100;
const hp = (p: number) => (height * p) / 100;

const UpdateProfile: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation('profile');
  const [refreshKey, setRefreshKey] = useState(0);
  const [languageKey, setLanguageKey] = useState(0);

  // Profile hooks
  const { data: profile, refetch } = useProfile();
  const updateProfile = useUpdateUserProfile();

  // Local state
  const [fullName, setFullName] = useState('');
  const [avatarFile, setAvatarFile] = useState<
    { uri: string; name: string; type: string } | undefined
  >(undefined);
  const [avatarUri, setAvatarUri] = useState<string | undefined>(undefined);

  // Language change listener
  useEffect(() => {
    const handleLanguageChange = () => {
      setLanguageKey(prev => prev + 1);
    };
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  // Initialize from profile data
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setAvatarUri(profile.avatar_url || undefined);
    }
  }, [profile]);

  // Refetch when focused
  useFocusEffect(
    useCallback(() => {
      setRefreshKey(prev => prev + 1);
      refetch();
      setLanguageKey(prev => prev + 1);
    }, [refetch]),
  );

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        full_name: fullName.trim(),
        avatarFile, // if user picked a new image
      });

      setRefreshKey(prev => prev + 1);
      await refetch();
      navigation.goBack();
    } catch (error: any) {
      console.error('💀 Profile update error:', error);
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
          <BackButton/>
          <Text style={styles.title} key={`title-${languageKey}`}>
            {t('updateProfile.screenTitle')}
          </Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Avatar Section */}
        <ProfileUser
          key={refreshKey}
          username={fullName}
          avatarUri={avatarUri}
          onImageSelected={async image => {
            // image = { uri, name, type }
            setAvatarFile(image);
            setAvatarUri(image.uri);
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

          <Text style={styles.smallLabel}>
            {t('updateProfile.phoneNumber')}
          </Text>
          <CustomInput
            value={profile?.phone || ''}
            onChangeText={() => {}} // Read-only
            placeholder={t('updateProfile.phonePlaceholder')}
            containerStyle={styles.inputContainerFix}
          />
          <Text style={styles.noteText}>{t('updateProfile.phoneNote')}</Text>
        </View>

        {/* Save Button */}
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
    marginBottom: hp(1),
  },
  title: { fontSize: 16, fontWeight: '700', color: '#111',marginTop: hp(3) },
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

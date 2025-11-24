import { useFocusEffect, useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput } from 'react-native';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CustomButton from '../../../components/CustomButton';
import CustomInput from '../../../components/CustomInput';
import NoInternet from '../../../components/NoInternet';
import PrimaryButton from '../../../components/PrimaryButton';
import ProfileUser from '../../../components/ProfileUser';
import i18n from '../../../i18n';
import { useProfile, useUpdateUserProfile } from '../hooks';
import Header from '../../../components/Header';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../../app/navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const { width, height } = Dimensions.get('window');
const wp = (p: number) => (width * p) / 100;
const hp = (p: number) => (height * p) / 100;

const UpdateProfile: React.FC = () => {
  const { t } = useTranslation('profile');
  const [refreshKey, setRefreshKey] = useState(0);
  const [languageKey, setLanguageKey] = useState(0);
  const navigation = useNavigation<NavigationProp>();


  // Profile hooks
  const { data: profile, refetch } = useProfile();
  const updateProfile = useUpdateUserProfile();

  // Local state
  const [fullName, setFullName] = useState('');
  const [originalFullName, setOriginalFullName] = useState('');
  const [avatarFile, setAvatarFile] = useState<
    { uri: string; name: string; type: string } | undefined
  >(undefined);
  const [avatarUri, setAvatarUri] = useState<string | undefined>(undefined);
  const [originalAvatarUri, setOriginalAvatarUri] = useState<string | undefined>(undefined);
  const [isEditMode, setIsEditMode] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const nameInputRef = useRef<TextInput>(null);


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
  const handleBackPress = () => {
    navigation.goBack();
  };

  // Initialize from profile data
  useEffect(() => {
    if (profile) {
      const name = profile.full_name || '';
      const uri = profile.avatar_url || undefined;
      setFullName(name);
      setOriginalFullName(name);
      setAvatarUri(uri);
      setOriginalAvatarUri(uri);
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
      setIsEditMode(false);
      setOriginalFullName(fullName.trim());
      setOriginalAvatarUri(avatarUri);
      setAvatarFile(undefined);
    } catch (error: any) {
      console.error('💀 Profile update error:', error);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    setFullName(originalFullName);
    setAvatarUri(originalAvatarUri);
    setAvatarFile(undefined);
    setIsEditMode(false);
  };

  const handleNameFocus = () => {
    setIsEditMode(true);
    setFocusedField('fullName');
  };

  const handleNameBlur = () => {
    setFocusedField(null);
  };

  const handleAvatarPress = () => {
    setIsEditMode(true);
  };

  const handleEditPress = () => {
    setIsEditMode(true);
    // Focus the name input after a short delay to ensure the edit mode is set
    setTimeout(() => {
      nameInputRef.current?.focus();
    }, 100);
  };

  return (
    <LinearGradient
      colors={['#F8F8F8', '#F8F8F8']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradientContainer}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        key={languageKey}
      >

        {/* Top Bar */}
        <Header
          title={t('updateProfile.screenTitle')}
          onBackPress={handleBackPress}
          showRightIcon={false}
        />
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >


          {/* Avatar Section */}
          <ProfileUser
            key={refreshKey}
            username={fullName}
            avatarUri={avatarUri}
            onAvatarPress={handleAvatarPress}
            onImageSelected={async image => {
              // image = { uri, name, type }
              setAvatarFile(image);
              setAvatarUri(image.uri);
              setIsEditMode(true);
            }}
            containerStyle={styles.headerCard}
          />

          {/* White Card Container */}
          <View style={styles.cardContainer}>
            {/* Form */}
            <View style={styles.form}>
              <Text style={styles.smallLabel}>{t('updateProfile.fullName')}</Text>
              <CustomInput
                ref={nameInputRef}
                value={fullName}
                onChangeText={text => {
                  setFullName(text);
                  setIsEditMode(true);
                }}
                onFocus={handleNameFocus}
                onBlur={handleNameBlur}
                focused={focusedField === 'fullName'}
                placeholder={t('updateProfile.enterFullName')}
                containerStyle={styles.inputContainerFix}
              />

              <Text style={styles.smallLabel}>
                {t('updateProfile.phoneNumber')}
              </Text>
              <CustomInput
                value={profile?.phone || ''}
                onChangeText={() => { }} // Read-only
                placeholder={t('updateProfile.phonePlaceholder')}
                containerStyle={styles.inputContainerFix}
                disabled={true}
                isPhoneNumber={true}
              />
              <Text style={styles.noteText}>{t('updateProfile.phoneNote')}</Text>
            </View>

            {/* Edit Button - Show by default when not in edit mode */}
            {!isEditMode && (
              <View style={styles.buttonWrap}>
                <PrimaryButton
                  title={t('updateProfile.editButton')}
                  onPress={handleEditPress}
                  loading={updateProfile.isPending}
                  disabled={updateProfile.isPending}
                  buttonStyle={styles.editButton}
                />
              </View>
            )}

            {/* Cancel and Save Buttons - Only show when in edit mode */}
            {isEditMode && (
              <View style={styles.buttonWrap}>
                <View style={styles.buttonRow}>
                  <View style={styles.cancelButton}>
                    <CustomButton
                      title={t('updateProfile.cancel')}
                      onPress={handleCancel}
                      variant="outline"
                      buttonStyle={{ width: '100%' }}
                      disabled={updateProfile.isPending}
                    />
                  </View>
                  <View style={styles.saveButton}>
                    <PrimaryButton
                      title={t('updateProfile.cta')}
                      onPress={handleSave}
                      loading={updateProfile.isPending}
                      disabled={updateProfile.isPending}
                      buttonStyle={{ width: '100%', minWidth: 0 }}
                    />
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        <NoInternet />
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: { flex: 1 },
  container: { flex: 1 },
  content: { paddingHorizontal: wp(6), paddingBottom: hp(6) },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: wp(4),
    paddingHorizontal: wp(5),
    paddingVertical: hp(3),
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp(1),
  },
  title: { fontSize: 16, fontWeight: '700', color: '#111', marginTop: hp(3) },
  headerCard: {
    alignItems: 'center',
    marginTop: hp(1.5),
    marginBottom: hp(2.5),
  },
  form: { marginTop: hp(1) },
  smallLabel: { fontSize: 12, color: '#000000', marginBottom: 4, marginTop: 10 },
  inputContainerFix: { marginBottom: hp(0.6) },
  noteText: { fontSize: 12, color: '#999', marginTop: -8 },
  buttonWrap: { marginTop: hp(4) },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
  },
  editButton: {
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    minWidth: 0,
    marginRight: wp(1.5),
  },
  saveButton: {
    flex: 1,
    minWidth: 0,
  },
});

export default UpdateProfile;

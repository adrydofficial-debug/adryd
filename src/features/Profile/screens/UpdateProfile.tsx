
import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState, useEffect } from 'react';
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
import CustomInput from '../../../components/CustomInput';
import CustomButton from '../../../components/CustomButton';
import ProfileUser from '../../../components/ProfileUser';
import { useProfile, useUpdateProfile } from '../hooks';

const { width, height } = Dimensions.get('window');
const wp = (p: number) => (width * p) / 100;
const hp = (p: number) => (height * p) / 100;

const UpdateProfile: React.FC = () => {
  const navigation = useNavigation();

  // Profile data from Supabase
  const { data: profile, isLoading: profileLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  // State for the editable fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | undefined>(undefined);

  // Initialize fields from profile data
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      if (profile.avatar_url) {
        setAvatarUri(profile.avatar_url);
      }
    }
  }, [profile]);

  const initials = useMemo(() => {
    const f = firstName?.[0] ?? '';
    const l = lastName?.[0] ?? '';
    return (f + l).toUpperCase() || 'U';
  }, [firstName, lastName]);

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });
      
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
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#111" />
          </TouchableOpacity>
          <Text style={styles.title}>Profile</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Avatar / Header card */}
        <ProfileUser
          firstName={firstName}
          lastName={lastName}
          avatarUri={avatarUri}
          onImageSelected={async (imageUri) => {
            setAvatarUri(imageUri);
            // Save directly to Supabase
            try {
              await updateProfile.mutateAsync({
                avatar_url: imageUri,
              });
            } catch (error: any) {
              console.error('Avatar update error:', error);
            }
          }}
          containerStyle={styles.headerCard}
        />

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.smallLabel}>First Name</Text>
          <CustomInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First Name"
            containerStyle={styles.inputContainerFix}
          />

          <Text style={styles.smallLabel}>Last Name</Text>
          <CustomInput
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last Name"
            containerStyle={styles.inputContainerFix}
          />

          <Text style={styles.smallLabel}>Phone Number</Text>
          <CustomInput
            value={profile?.phone || ''}
            onChangeText={() => {}} // Read-only
            placeholder="Phone number"
            containerStyle={styles.inputContainerFix}
          />
          <Text style={styles.noteText}>Your phone number is verified and cannot be changed.</Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonWrap}>
          <CustomButton 
            title="Update Profile" 
            onPress={handleSave} 
            loading={updateProfile.isPending}
            disabled={updateProfile.isPending}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff',paddingVertical:25 },
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
  headerCard: { alignItems: 'center', marginTop: hp(1.5), marginBottom: hp(2.5) },
  form: { marginTop: hp(1) },
  smallLabel: { fontSize: 10, color: '#999', marginBottom: 4, marginTop: 10 },
  inputContainerFix: { marginBottom: hp(0.6) },
  noteText: { fontSize: 10, color: '#999', marginTop: 4 },
  buttonWrap: { marginTop: hp(4) },
});

export default UpdateProfile;
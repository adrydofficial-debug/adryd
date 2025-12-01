import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Images,
  PinkLocationIcon,
  PinkNotifyIcon,
} from '../../../assets/images';

const { width } = Dimensions.get('window');

interface ProfileRowProps {
  profile?: any;
  user?: any;
  avatarUrl?: string;
  isValidAvatarUrl?: boolean;
  selectedCity: string;
  hasUnreadNotifications: boolean;
  t: (key: string) => string;
  onProfileClick?: () => void;
  onLocationClick?: () => void;
  onSearchClick?: () => void;
  onNotificationsClick?: () => void;
}

const ProfileRow: React.FC<ProfileRowProps> = ({
  profile,
  user,
  avatarUrl,
  isValidAvatarUrl = false,
  selectedCity,
  hasUnreadNotifications,
  t,
  onProfileClick,
  onLocationClick,
  onSearchClick,
  onNotificationsClick,
}) => {
  const [avatarError, setAvatarError] = useState(false);

  const getFirstName = () => {
    const fullName =
      profile?.full_name ||
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.user_metadata?.username ||
      user?.email?.split('@')[0] ||
      'User';
    return fullName.trim().split(' ')[0];
  };

  return (
    <View style={styles.profileRow}>
      <TouchableOpacity onPress={onProfileClick}>
        {isValidAvatarUrl && !avatarError ? (
          <Image
            source={{ uri: avatarUrl }}
            style={styles.avatar}
            onError={() => setAvatarError(true)}
          />
        ) : (
          <Image
            source={Images.frame}
            style={styles.avatar}
            resizeMode="cover"
          />
        )}
      </TouchableOpacity>
      <View style={styles.nameWrap}>
        <Text style={styles.greeting} numberOfLines={1} ellipsizeMode="tail">
          {t('greetingHi')}
        </Text>
        <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
          {getFirstName()}!
        </Text>
      </View>

      <View style={styles.locationRow}>
        <TouchableOpacity
          style={styles.locationBtnCustom}
          onPress={onLocationClick}
          activeOpacity={0.7}
        >
          <PinkLocationIcon
            width={width * 0.03}
            height={width * 0.03}
            style={{ marginRight: width * 0.011 }}
          />
          <Text
            style={styles.locationBtnText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {selectedCity}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bellBtn} onPress={onSearchClick}>
          <Image source={Images.search} style={styles.FilterIcon} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.bellBtn,
            hasUnreadNotifications && styles.bellBtnActive,
          ]}
          onPress={onNotificationsClick}
        >
          {hasUnreadNotifications ? (
            <>
              <PinkNotifyIcon width={width * 0.05} height={width * 0.047} />
              <View style={styles.notificationBadge} />
            </>
          ) : (
            <Image style={styles.bellIcon} source={Images.pinkBell} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProfileRow;

const styles = StyleSheet.create({
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  nameWrap: { flex: 1, marginLeft: 10 },
  greeting: { fontSize: 14, color: '#999' },
  name: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationBtnCustom: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  locationBtnText: { fontSize: 14, color: '#333', maxWidth: 80 },
  bellBtn: { marginHorizontal: 5 },
  bellBtnActive: {},
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'red',
  },
  bellIcon: { width: 24, height: 24 },
  FilterIcon: { width: 24, height: 24 },
});

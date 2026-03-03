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
import { useCities } from '../../locations/hooks/hooks';
// import { useCityStore } from '../../locations/store/cityStore';
import { useAppStore } from '../../../store/appStore';
import { useNotificationsStore } from '../../notifications/store/notifications';

const { width } = Dimensions.get('window');
// const RIGHT_ACTIONS_WIDTH = width * 0.38;

interface ProfileRowProps {
  profile?: any;
  user?: any;
  avatarUrl?: string;
  isValidAvatarUrl?: boolean;
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
  t,
  onProfileClick,
  onLocationClick,
  onSearchClick,
  onNotificationsClick,
}) => {
  const [avatarError, setAvatarError] = useState(false);
  const { unreadCount } = useNotificationsStore();
  const hasUnread = unreadCount > 0;
  const { selectedCity, setSelectedCity } = useAppStore();
  const { data: cities = [] } = useCities();

  // initialize default city if not set
  React.useEffect(() => {
    if (!selectedCity && cities.length > 7) {
      // pick the first city as default (or apply your own logic)
      setSelectedCity(cities[7]);
    } else if (!selectedCity && cities.length > 0) {
      // pick the first city as default (or apply your own logic)
      setSelectedCity(cities[0]);
    }
  }, [cities, selectedCity, setSelectedCity]);

  const getFirstName = () => {
    const fullName =
      profile?.full_name ||
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.user_metadata?.username ||
      user?.email?.split('@')[0] ||
      'User';
    const firstName = fullName.trim().split(' ')[0];
    const limitedName = firstName.substring(0, 8);
    return limitedName;
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
        <Text
          style={styles.greeting}
          numberOfLines={1}
          ellipsizeMode="tail"
          allowFontScaling={false}
        >
          {t('greetingHi')}
        </Text>
        <Text
          style={styles.name}
          numberOfLines={1}
          ellipsizeMode="tail"
          allowFontScaling={false}
        >
          {getFirstName()}
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
            {selectedCity?.name ?? t('selectCity')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bellBtn} onPress={onSearchClick}>
          <Image source={Images.search} style={styles.FilterIcon} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bellBtn, hasUnread && styles.bellBtnActive]}
          onPress={onNotificationsClick}
        >
          {hasUnread ? (
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
    marginTop: 0,
    marginBottom: -8,
    writingDirection: 'ltr',
    flexShrink: 0,
    minHeight: width * 0.13,
    backgroundColor: '#F8F8F8',
  },
  avatar: {
    width: width * 0.13,
    height: width * 0.13,
    borderRadius: width * 0.085,
    backgroundColor: '#f0f0f0',
    borderWidth: 3,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  nameWrap: { flex: 1, paddingHorizontal: 6, minWidth: 0 },
  greeting: { fontSize: 12, color: '#222', fontWeight: '400' },
  name: { fontSize: 15, color: '#222', fontWeight: 'bold', marginTop: -5 },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexShrink: 0,
  },
  locationBtnCustom: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: width * 0.03,
    paddingVertical: 6,
    marginRight: width * 0.01,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 32,
    alignSelf: 'flex-start', // optional
  },

  locationBtnText: {
    color: '#595959',
    fontWeight: '400',
    fontSize: 12,
    marginRight: width * 0.01,
    // flex: 1,
  },
  bellBtn: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    marginRight: width * 0.01,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: width * 0.09,
    height: width * 0.09,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    position: 'relative',
  },
  bellBtnActive: {
    borderColor: '#C539A5',
  },
  bellIcon: {
    width: width * 0.05,
    height: width * 0.047,
    resizeMode: 'contain',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C539A5',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  FilterIcon: {
    width: width * 0.04,
    height: width * 0.04,
    resizeMode: 'contain',
  },
});

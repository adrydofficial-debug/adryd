import React from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useDispatch} from 'react-redux';
import {logout} from '../../slices/authSlice';
import {AppScreens} from '../../app/navigation/AppNavigator';

const {width, height} = Dimensions.get('window');

interface HomeScreenProps {
  navigation?: any; // You can type this more specifically
}

const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  const navigateToCompanies = () => {
    navigation?.navigate(AppScreens.CompanyList);
  };

  const navigateToCreateCompany = () => {
    navigation?.navigate(AppScreens.CreateCompany);
  };

  const navigateToBusinessCategoriesTest = () => {
    navigation?.navigate(AppScreens.BusinessCategoriesTest);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFF4FD" barStyle="dark-content" />

      <LinearGradient
        colors={['#C539A5', '#fffdffff']}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        style={styles.header}>
        {/* Profile */}
        <View style={styles.profileRow}>
          <TouchableOpacity onPress={handleLogout}>
            <Image
              source={{uri: 'https://randomuser.me/api/portraits/men/1.jpg'}}
              style={styles.avatar}
            />
          </TouchableOpacity>
          <View style={{marginRight: 25}}>
            <Text style={styles.greeting}>Hi</Text>
            <Text style={styles.name}>Welcome!</Text>
          </View>
          <View style={styles.locationRow}>
            <View style={styles.locationBtnCustom}>
              <Text style={styles.locationBtnText}>Lahore Gulberg</Text>
            </View>
          </View>
        </View>

        {/* Banner */}
        <View style={styles.bannerContainer}>
          <View style={styles.bannerPlaceholder}>
            <Text style={styles.bannerText}>Welcome to Adryd!</Text>
            <Text style={styles.bannerSubtext}>Your boards are ready</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Find your Board</Text>
          <Text style={styles.sectionSubtitle}>
            Discover amazing opportunities around you
          </Text>
        </View>

        <View style={styles.featureGrid}>
          <TouchableOpacity style={styles.featureCard}>
            <Text style={styles.featureTitle}>Recommended</Text>
            <Text style={styles.featureDescription}>
              Boards we think you'll love
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureCard}>
            <Text style={styles.featureTitle}>Nearby</Text>
            <Text style={styles.featureDescription}>
              Boards close to your location
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureCard} onPress={navigateToCompanies}>
            <Text style={styles.featureTitle}>Companies</Text>
            <Text style={styles.featureDescription}>
              Manage your companies
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureCard} onPress={navigateToCreateCompany}>
            <Text style={styles.featureTitle}>Create Company</Text>
            <Text style={styles.featureDescription}>
              Add a new company
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureCard} onPress={navigateToBusinessCategoriesTest}>
            <Text style={styles.featureTitle}>Test Categories</Text>
            <Text style={styles.featureDescription}>
              Test business categories API
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  header: {
    width,
    height: height * 0.31,
    paddingTop: height * 0.04,
    paddingHorizontal: width * 0.05,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  avatar: {
    width: width * 0.13,
    height: width * 0.13,
    borderRadius: width * 0.065,
    borderWidth: 1,
    borderColor: '#fff',
  },
  greeting: {fontSize: 12, color: '#fff'},
  name: {fontSize: 18, color: '#fff', fontWeight: 'bold', marginTop: -5},
  locationRow: {flexDirection: 'row', alignItems: 'center'},
  locationBtnCustom: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.008,
  },
  locationBtnText: {color: '#595959', fontSize: 12},
  bannerContainer: {
    width: width * 0.9,
    height: height * 0.18,
    borderRadius: 15,
    overflow: 'hidden',
    alignSelf: 'center',
    marginTop: 20,
  },
  bannerPlaceholder: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  bannerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#C539A5',
    marginBottom: 5,
  },
  bannerSubtext: {
    fontSize: 14,
    color: '#666',
  },
  content: {flex: 1, backgroundColor: '#fff'},
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: width * 0.055,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (width - 60) / 2,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#C539A5',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
});

export default HomeScreen;
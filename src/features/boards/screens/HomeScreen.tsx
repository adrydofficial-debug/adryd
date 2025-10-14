// import React ,{useState}from 'react';
// import {
//   Dimensions,
//   Image,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';
// import {AppScreens} from '../../app/navigation/AppNavigator';
//  import DrawerComponent from '../../components/DrawerComponent'; 
// const {width, height} = Dimensions.get('window');

// interface HomeScreenProps {
//   navigation?: any; // You can type this more specifically
// }

// const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
//   const handleLogout = () => {
//     // Handle logout logic here if needed
//     console.log('Logout pressed');
//   };

//   const navigateToCompanies = () => {
//     navigation?.navigate(AppScreens.CompanyList);
//   };

//   const navigateToCreateCompany = () => {
//     navigation?.navigate(AppScreens.CreateCompany);
//   };

//   const navigateToBusinessCategoriesTest = () => {
//     navigation?.navigate(AppScreens.BusinessCategoriesTest);
//   };
//  const [drawerVisible, setDrawerVisible] = useState(false);
//   return (
//     <View style={styles.container}>
//       <StatusBar backgroundColor="#FFF4FD" barStyle="dark-content" />

//       <LinearGradient
//         colors={['#C539A5', '#fffdffff']}
//         start={{x: 0, y: 0}}
//         end={{x: 0, y: 1}}
//         style={styles.header}>
//         {/* Profile */}
//         <View style={styles.profileRow}>
//           <TouchableOpacity onPress={handleLogout}>
//             <Image
//               source={{uri: 'https://randomuser.me/api/portraits/men/1.jpg'}}
//               style={styles.avatar}
//             />
//           </TouchableOpacity>
//           <View style={{marginRight: 25}}>
//              <TouchableOpacity onPress={() => setDrawerVisible(true)} activeOpacity={0.7}>
//                             <Text style={styles.title}>Login</Text>
//                           </TouchableOpacity>
//             <Text style={styles.greeting}>Hi</Text>
//             <Text style={styles.name}>Welcome!</Text>
//           </View>
//           <View style={styles.locationRow}>
//             <View style={styles.locationBtnCustom}>
//               <Text style={styles.locationBtnText}>Lahore Gulberg</Text>
//             </View>
//           </View>
//         </View>

//         {/* Banner */}
//         <View style={styles.bannerContainer}>
//           <View style={styles.bannerPlaceholder}>
//             <Text style={styles.bannerText}>Welcome to Adryd!</Text>
//             <Text style={styles.bannerSubtext}>Your boards are ready</Text>
//           </View>
//         </View>
//       </LinearGradient>

//       <ScrollView style={styles.content}>
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Find your Board</Text>
//           <Text style={styles.sectionSubtitle}>
//             Discover amazing opportunities around you
//           </Text>
//       </View>

//         <View style={styles.featureGrid}>
//           <TouchableOpacity style={styles.featureCard}>
//             <Text style={styles.featureTitle}>Recommended</Text>
//             <Text style={styles.featureDescription}>
//               Boards we think you'll love
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={styles.featureCard}>
//             <Text style={styles.featureTitle}>Nearby</Text>
//             <Text style={styles.featureDescription}>
//               Boards close to your location
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={styles.featureCard} onPress={navigateToCompanies}>
//             <Text style={styles.featureTitle}>Companies</Text>
//             <Text style={styles.featureDescription}>
//               Manage your companies
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={styles.featureCard} onPress={navigateToCreateCompany}>
//             <Text style={styles.featureTitle}>Create Company</Text>
//             <Text style={styles.featureDescription}>
//               Add a new company
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={styles.featureCard} onPress={navigateToBusinessCategoriesTest}>
//             <Text style={styles.featureTitle}>Test Categories</Text>
//             <Text style={styles.featureDescription}>
//               Test business categories API
//             </Text>
//             </TouchableOpacity>
//           </View>
//          <DrawerComponent visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {flex: 1, backgroundColor: '#fff'},
//   header: {
//     width,
//     height: height * 0.31,
//     paddingTop: height * 0.04,
//     paddingHorizontal: width * 0.05,
//   },
//   profileRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginTop: 30,
//   },
//   avatar: {
//     width: width * 0.13,
//     height: width * 0.13,
//     borderRadius: width * 0.065,
//     borderWidth: 1,
//     borderColor: '#fff',
//   },
//   greeting: {fontSize: 12, color: '#fff'},
//   name: {fontSize: 18, color: '#fff', fontWeight: 'bold', marginTop: -5},
//   locationRow: {flexDirection: 'row', alignItems: 'center'},
//   locationBtnCustom: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     paddingHorizontal: width * 0.03,
//     paddingVertical: height * 0.008,
//   },
//   locationBtnText: {color: '#595959', fontSize: 12},
//   bannerContainer: {
//     width: width * 0.9,
//     height: height * 0.18,
//     borderRadius: 15,
//     overflow: 'hidden',
//     alignSelf: 'center',
//     marginTop: 20,
//   },
//   bannerPlaceholder: {
//     flex: 1,
//     backgroundColor: 'rgba(255,255,255,0.9)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 15,
//   },
//   bannerText: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#C539A5',
//     marginBottom: 5,
//   },
//   bannerSubtext: {
//     fontSize: 14,
//     color: '#666',
//   },
//   content: {flex: 1, backgroundColor: '#fff'},
//   section: {
//     paddingHorizontal: 20,
//     paddingVertical: 20,
//   },
//   sectionTitle: {
//     fontSize: width * 0.055,
//     fontWeight: 'bold',
//     color: '#222',
//     marginBottom: 5,
//   },
//   sectionSubtitle: {
//     fontSize: 14,
//     color: '#666',
//   },
//   featureGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     paddingHorizontal: 20,
//     justifyContent: 'space-between',
//   },
//   featureCard: {
//     width: (width - 60) / 2,
//     backgroundColor: '#f8f9fa',
//     borderRadius: 12,
//     padding: 20,
//     marginBottom: 15,
//     borderWidth: 1,
//     borderColor: '#e9ecef',
//   },
//   featureTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#C539A5',
//     marginBottom: 8,
//   },
//   featureDescription: {
//     fontSize: 12,
//     color: '#666',
//     lineHeight: 16,
//   },
// });

// export default HomeScreen;



// src/features/boards/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  Alert,
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
import BoardTabs from '../../../components/BoardTabs';
import BoardList from '../../../components/BoardList';
import DrawerComponent from '../../../components/DrawerComponent';
import PinkLocation from '../../../assets/images/PinkkLocation.svg';

// ✅ Hooks
import { useGroups, useNearestBoards, useRecommendedBoards } from '../hooks';

// ✅ Shimmer
import LinearGradientLib from 'react-native-linear-gradient';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';

// React Navigation types
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

// Example RootStackParamList (adjust based on your navigator)
type RootStackParamList = {
  LoginScreen: undefined;
  CategoryScreen: {
    categoryId: string;
    categoryName: string;
    subHeading?: string;
    showAllCategories?: boolean;
    selectedTab?: string;
    tabs?: string[];
  };
  CampaignDetail: { item: any };
};

type Props = {
  navigation: any;
};

const { width, height } = Dimensions.get('window');

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState<string>('See All');

  // Banner state
  const [currentBannerIndex, setCurrentBannerIndex] = useState<number>(0);

  // Filter dropdown state
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState<boolean>(false);

  // Drawer state
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);

  // Banner images
  const bannerImages = [
    require('../../../assets/images/BannerOne.png'),
    require('../../../assets/images/BannerTwo.png'),
  ];

  // Auto-slide banners
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex(prevIndex => (prevIndex + 1) % bannerImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [bannerImages.length]);

  // Open drawer
  const handleProfilePress = () => {
    setDrawerVisible(true);
  };

  // Close drawer
  const handleCloseDrawer = () => {
    setDrawerVisible(false);
  };

  // Logout
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'LoginScreen' }],
            });
          },
        },
      ],
      { cancelable: true },
    );
  };

  // Data hooks
  const {
    data: recommendedData,
    isLoading: isRecommendedLoading,
    error: recommendedError,
    refetch: refetchRecommended,
  } = useRecommendedBoards({ limit: 10 });

  const {
    data: nearestData,
    isLoading: isNearestLoading,
    error: nearestError,
    refetch: refetchNearest,
  } = useNearestBoards({ latitude: 31.582, longitude: 74.329, limit: 10 });

  const {
    data: groupsData,
    isLoading: isGroupsLoading,
    error: groupsError,
    refetch: refetchGroups,
  } = useGroups({ boardLimit: 5 });

  // Dynamic tabs
  const tabs: string[] = [
    'See All',
    'Recommend',
    'Near',
    ...(groupsData?.flatMap(group => [
      group.name,
      ...(group.categories?.map(cat => cat.name) || []),
    ]) || []),
  ];

  // Handle tab press
  const handleTabPress = (tabName: string) => {
    setSelectedTab(tabName);

    switch (tabName) {
      case 'See All':
        navigation.navigate('CategoryScreen', {
          categoryId: 'all',
          categoryName: 'All Categories',
          showAllCategories: true,
          selectedTab: tabName,
          tabs,
        });
        break;
      case 'Recommend':
        navigation.navigate('CategoryScreen', {
          categoryId: 'recommend',
          categoryName: 'Recommended',
          subHeading: 'Boards',
          selectedTab: tabName,
          tabs,
        });
        break;
      case 'Near':
        navigation.navigate('CategoryScreen', {
          categoryId: 'near',
          categoryName: 'Nearest Board',
          subHeading: 'Boards',
          selectedTab: tabName,
          tabs,
        });
        break;
      default:
        navigation.navigate('CategoryScreen', {
          categoryId: tabName.toLowerCase(),
          categoryName: tabName,
          subHeading: 'Boards',
          selectedTab: tabName,
          tabs,
        });
    }
  };

  const handleDetailPress = (item: any) => {
    navigation.navigate('CampaignDetail', { item });
  };

  const isLoading = isRecommendedLoading || isNearestLoading || isGroupsLoading;
  const hasError = recommendedError || nearestError || groupsError;

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFF4FD" barStyle="dark-content" />
      {isFilterDropdownOpen && (
        <TouchableOpacity
          style={styles.dropdownOverlay}
          onPress={() => setIsFilterDropdownOpen(false)}
          activeOpacity={1}
        />
      )}
      <LinearGradient
        colors={['#C539A5', '#fffdffff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}
      >
        {/* Profile */}
        <View style={styles.profileRow}>
          <TouchableOpacity onPress={handleProfilePress}>
            <Image
              source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }}
              style={styles.avatar}
            />
          </TouchableOpacity>
          <View style={{ marginRight: 25 }}>
            <Text style={styles.greeting}>Hi</Text>
            <Text style={styles.name}>Umair!</Text>
          </View>
          <View style={styles.locationRow}>
            <View style={styles.locationBtnCustom}>
              <PinkLocation
                width={width * 0.03}
                height={width * 0.03}
                style={{ marginRight: width * 0.011 }}
              />
              <Text style={styles.locationBtnText}>Lahore Gulberg</Text>
            </View>
            <TouchableOpacity
              style={styles.bellBtn}
              onPress={() =>
                navigation.navigate('CategoryScreen', {
                  categoryId: 'all',
                  categoryName: 'All Categories',
                  showAllCategories: true,
                })
              }
            >
              <Image
                source={require('../../../assets/images/Search.png')}
                style={styles.FilterIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.bellBtn}>
              <Image
                style={styles.bellIcon}
                source={require('../../../assets/images/PinkBell.png')}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Banner */}
        <View style={styles.bannerContainer}>
          <Image
            source={bannerImages[currentBannerIndex]}
            style={styles.bannerImage}
            resizeMode="contain"
          />
        </View>
      </LinearGradient>

      <View style={styles.boardSection}>
        <Text style={styles.boardTitle}>Find your Board</Text>
        <BoardTabs
          tabs={tabs}
          selectedTab={selectedTab}
          onTabPress={handleTabPress}
        />
      </View>

      <ScrollView style={{ flex: 1, backgroundColor: '#fff', marginBottom: 110 }}>
        {isLoading ? (
          [...Array(3)].map((_, idx) => (
            <ShimmerPlaceholder
              key={idx}
              LinearGradient={LinearGradientLib}
              style={{
                height: 150,
                borderRadius: 12,
                marginBottom: 16,
                marginHorizontal: 20,
              }}
            />
          ))
        ) : hasError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Failed to load boards. Please try again.
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                refetchRecommended();
                refetchNearest();
                refetchGroups();
              }}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <BoardList
              data={recommendedData?.pages?.flatMap(p => p.data ?? []) || []}
              onPressDetail={handleDetailPress}
              heading="Recommended"
              navigation={navigation}
            />
            <BoardList
              data={nearestData?.pages?.flatMap(p => p.data ?? []) || []}
              onPressDetail={handleDetailPress}
              heading="Nearest Board"
              navigation={navigation}
            />
            {groupsData?.map(group =>
              group.categories?.map(category => (
                <BoardList
                  key={category.id}
                  data={category.boards || []}
                  onPressDetail={handleDetailPress}
                  heading={`${group.name} - ${category.name}`}
                  navigation={navigation}
                />
              )),
            )}
          </>
        )}
      </ScrollView>

      {/* Drawer Component */}
      <DrawerComponent
        visible={drawerVisible}
        onClose={handleCloseDrawer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
 container: { flex: 1, backgroundColor: '#fff' },
  header: { width, height: height * 0.31, paddingTop: height * 0.04, paddingHorizontal: width * 0.05, marginBottom: 2, }, 
  profileRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 30, }, 
  avatar: { width: width * 0.13, height: width * 0.13, borderRadius: width * 0.065, borderWidth: 1, borderColor: '#fff', },
   greeting: { fontSize: 12, color: '#fff', fontWeight: '400' }, 
   name: { fontSize: 18, color: '#fff', fontWeight: 'bold', marginTop: -5 },
    locationRow: { flexDirection: 'row', alignItems: 'center', marginLeft: width * -0.001, }, 
    locationBtnCustom: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: width * 0.03, paddingVertical: height * 0.008, marginRight: width * 0.01, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 1, borderWidth: 1, borderColor: '#E5E7EB', },
     locationBtnText: { color: '#595959', fontWeight: '400', fontSize: 12, marginRight: width * 0.01, }, 
     bellBtn: { backgroundColor: '#fff', borderRadius: 20, padding: 8, marginRight: width * 0.01, borderWidth: 1, borderColor: '#E5E7EB', width: width * 0.09, height: width * 0.09, justifyContent: 'center', alignItems: 'center', textAlign: 'center', },
      bellIcon: { width: width * 0.05, height: width * 0.047, resizeMode: 'contain', }, 
      FilterIcon: { width: width * 0.04, height: width * 0.04, resizeMode: 'contain', }, 
      searchRow: { flexDirection: 'row', alignItems: 'center', marginTop: height * 0.02, backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: width * 0.04, paddingVertical: height * 0.01, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, }, searchIcon: { width: width * 0.06, height: width * 0.06, marginRight: width * 0.02, tintColor: '#D9D9D9', }, 
      searchInput: { flex: 1, fontSize: width * 0.04, color: '#333', backgroundColor: '#fff', borderRadius: 20, paddingVertical: height * 0.008, paddingHorizontal: width * 0.02, }, 
      filterBtn: { marginLeft: width * 0.02, borderRadius: 20, padding: width * 0.02, }, 
      filterIcon: { width: width * 0.06, height: width * 0.06 }, 
      bannerContainer: { width: width * 0.9, height: height * 0.18, borderRadius: 15, overflow: 'hidden', alignSelf: 'center', }, 
      bannerImage: { width: '100%', height: '100%', borderRadius: 15, resizeMode: 'cover', justifyContent: 'center', alignItems: 'center', }, 
      boardSection: { marginTop: height * 0.03, marginHorizontal: width * 0.01 },
       boardTitle: { fontSize: width * 0.055, fontWeight: 'bold', color: '#222', marginBottom: height * 0.015, paddingHorizontal: 20, }, 
       errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50, paddingHorizontal: 20, }, 
       errorText: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 20, }, 
       retryButton: { backgroundColor: '#C539A5', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, }, 
       retryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' }, 
       filterDropdown: { position: 'absolute', top: 50, right: 10, backgroundColor: '#fff', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, zIndex: 1000, minWidth: 260, }, 
       dropdownHeaderAllBtn: { paddingHorizontal: 12, paddingVertical: 6, }, 
       dropdownHeaderAll: { color: '#C539A5', fontSize: 16, fontWeight: '700', }, 
       dropdownSectionTitle: { fontSize: 16, color: '#4B5563', fontWeight: '700', paddingHorizontal: 12, paddingTop: 12, paddingBottom: 6, }, 
       dropdownDivider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 8, marginHorizontal: 12, },
        dropdownBulletRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 8, }, 
        bulletDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#6B7280', marginRight: 10, }, 
        bulletText: { fontSize: 14, color: '#374151', }, 
        dropdownItem: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', }, 
        dropdownItemText: { fontSize: 14, color: '#333', fontWeight: '500', }, 
        dropdownOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999, }, });
export default HomeScreen;

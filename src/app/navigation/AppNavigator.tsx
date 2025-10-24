// src/app/navigation/AppNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { CreateCompanyScreen } from '../../features/companies/screens';
import HomeScreen from '../../features/boards/screens/HomeScreen';
import UpdateProfile from '../../features/Profile/screens/UpdateProfile';
import ChangePassword from '../../features/Profile/screens/ChangePassword';
import PreviousCompanyScreen from '../../features/Profile/screens/PreviousCompany';
import CurrentLocationMinimalMap from '../../features/Location/CurrentLocationMinimalMap'
import AdvertismentCreateScreen from '../../features/advertisments/screens/AdvertismentCreateScreen';
import CampaignScreen from '../../features/advertisments/screens/CompaignScreen';
import CampaignUploadFiles from '../../features/advertisments/screens/AdvertismentUploadsScreen';
import SingleBoardDetail from '../../features/boards/screens/SingleBoardDetail';
import FilterCategoryList from '../../features/boards/screens/FilterCategoryList';
import FavouritesScreen from '../../features/favourites/screens/FavouritesScreen';
import ChatScreen from '../../components/ChatScreen';
import ContactSupportScreen from '../../components/ContactSupportScreen';
// 🔹 Define navigation param types
export type AppStackParamList = {
  CampaignScreen: undefined;
  AdvertismentCreateScreen: undefined;
  CampaignUploadFiles: undefined;
  CurrentLocation: undefined;
  CurrentLocationMinimalMap: undefined;
  HomeScreen: undefined;
  CompaniesScreen: undefined;
  CreateCompanyScreen: undefined;
  UpdateProfile: undefined;
    PreviousCompanyScreen:undefined;
    ChangePassword: undefined;
    FavouritesScreen: undefined;
    FilterCategoryList: {
      categoryId?: string;
      categoryName?: string;
      selectedTab?: string;
      filter?: string;
      tabType?: string;
    };
    SingleBoardDetail: { item: any };
    ChatScreen: undefined;
    ContactSupportScreen: undefined;
};
const Stack = createNativeStackNavigator<AppStackParamList>();
const AppNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
 {/* <Stack.Screen name="CampaignUploadFiles" component={CampaignUploadFiles} /> */}
{/* <Stack.Screen name="CreateCompanyScreen" component={CreateCompanyScreen} /> */}

 <Stack.Screen name="HomeScreen" component={HomeScreen} />
 <Stack.Screen name='FavouritesScreen' component={FavouritesScreen}/>
 <Stack.Screen name="SingleBoardDetail" component={SingleBoardDetail} />
 <Stack.Screen name="CampaignScreen" component={CampaignScreen} />
 <Stack.Screen name="AdvertismentCreateScreen" component={AdvertismentCreateScreen} />
 <Stack.Screen name="FilterCategoryList" component={FilterCategoryList} />
 <Stack.Screen name="CompaniesScreen" component={CreateCompanyScreen} />
 <Stack.Screen name="ChangePassword" component={ChangePassword} />
 <Stack.Screen name="PreviousCompanyScreen" component={PreviousCompanyScreen}/>
 <Stack.Screen name="CurrentLocation" component={CurrentLocationMinimalMap} />
 <Stack.Screen name="UpdateProfile" component={UpdateProfile} />
 <Stack.Screen name="CurrentLocationMinimalMap" component={CurrentLocationMinimalMap} />
 <Stack.Screen name="ChatScreen" component={ChatScreen} />
 <Stack.Screen name="ContactSupportScreen" component={ContactSupportScreen} />
  </Stack.Navigator>

);

export default AppNavigator;

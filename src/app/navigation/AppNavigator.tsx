// src/app/navigation/AppNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import AdvertismentCreateScreen from '../../features/advertisments/screens/AdvertismentCreateScreen';
import CampaignUploadFiles from '../../features/advertisments/screens/AdvertismentUploadsScreen';
import FilterCategoryList from '../../features/boards/screens/FilterCategoryList';
import HomeScreen from '../../features/boards/screens/HomeScreen';
import SingleBoardDetail from '../../features/boards/screens/SingleBoardDetail';
import CreateCompanyScreen from '../../features/companies/screens/CreateCompanyScreen';
import FavouritesScreen from '../../features/favourites/screens/FavouritesScreen';
import BottomTab from './BottomTab';
import UpdateProfile from '../../features/profile/screens/UpdateProfile';
// import CurrentLocationMinimalMap from '../../features/location/CurrentLocationMinimalMap';
// import ChangePassword from '../../features/profile/screens/ChangePassword';
// import PreviousCompanyScreen from '../../features/profile/screens/PreviousCompany';
// import UpdateProfile from '../../features/profile/screens/UpdateProfile';

// 🔹 Define navigation param types
export type AppStackParamList = {
  BottomTab: undefined;
  CampaignScreen: undefined;
  AdvertismentCreateScreen: undefined;
  CampaignUploadFiles: { uploadUrl: string };
  CurrentLocation: undefined;
  CurrentLocationMinimalMap: undefined;
  HomeScreen: undefined;
  CompaniesScreen: undefined;
  CreateCompanyScreen: undefined;
  UpdateProfile: undefined;
  PreviousCompanyScreen: undefined;
  ChangePassword: undefined;
  FavouritesScreen: undefined;
  FilterCategoryList: { slug?: string };
  SingleBoardDetail: { item: any };
};
const Stack = createNativeStackNavigator<AppStackParamList>();
const AppNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="BottomTab" component={BottomTab} />
    <Stack.Screen
      name="AdvertismentCreateScreen"
      component={AdvertismentCreateScreen}
    />
    <Stack.Screen name="CampaignUploadFiles" component={CampaignUploadFiles} />
    <Stack.Screen name="CreateCompanyScreen" component={CreateCompanyScreen} />
    <Stack.Screen name="HomeScreen" component={HomeScreen} />
    <Stack.Screen name="FavouritesScreen" component={FavouritesScreen} />
    <Stack.Screen name="SingleBoardDetail" component={SingleBoardDetail} />
    {/* <Stack.Screen name="CampaignScreen" component={CampaignScreen} /> */}
    <Stack.Screen name="FilterCategoryList" component={FilterCategoryList} />
    {/* <Stack.Screen name="ChangePassword" component={ChangePassword} /> */}
    {/* <Stack.Screen
      name="PreviousCompanyScreen"
      component={PreviousCompanyScreen}
    /> */}
    {/* <Stack.Screen
      name="CurrentLocation"
      component={CurrentLocationMinimalMap}
    /> */}
    <Stack.Screen name="UpdateProfile" component={UpdateProfile} />
    {/* <Stack.Screen
      name="CurrentLocationMinimalMap"
      component={CurrentLocationMinimalMap}
    /> */}
  </Stack.Navigator>
);

export default AppNavigator;

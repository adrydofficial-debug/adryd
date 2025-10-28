// src/app/navigation/AppNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import AdvertismentCreateScreen from '../../features/advertisments/screens/AdvertismentCreateScreen';
import CampaignUploadFiles from '../../features/advertisments/screens/CampaignUploadFiles';
import FilterCategoryList from '../../features/boards/screens/FilterCategoryList';
import HomeScreen from '../../features/boards/screens/HomeScreen';
import SingleBoardDetail from '../../features/boards/screens/SingleBoardDetail';
import CreateCompanyScreen from '../../features/companies/screens/CreateCompanyScreen';
import FavouritesScreen from '../../features/favourites/screens/FavouritesScreen';
import BottomTab from './BottomTab';
import CompaignStatus from '../../features/advertisments/screens/CompaignStatus';
import UpdateProfile from '../../features/profile/screens/UpdateProfile';
// import CurrentLocationMinimalMap from '../../features/location/CurrentLocationMinimalMap';
  import ChangePassword from '../../features/profile/screens/ChangePassword';
  import PreviousCompanyScreen from '../../features/profile/screens/PreviousCompany';
//  import UpdateProfile from '../../features/profile/screens/UpdateProfile';
import AdvertismentConfirmationScreen from '../..//features/advertisments/screens/AdvertismentConfirmationScreen';
import AdvertismentCongratulateScreen from '../../features/advertisments/screens/AdvertismentCongratulateScreen';
// 🔹 Define navigation param types
export type AppStackParamList = {
  BottomTab: undefined;
  CompaignStatus: undefined;
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
  AdvertismentConfirmationScreen: { campaignId: string };
  AdvertismentCongratulateScreen: { campaignId: string};
};
const Stack = createNativeStackNavigator<AppStackParamList>();
const AppNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
     <Stack.Screen name="BottomTab" component={BottomTab} /> 
    <Stack.Screen name="CreateCompanyScreen" component={CreateCompanyScreen} />
    <Stack.Screen name="CampaignUploadFiles" component={CampaignUploadFiles} /> 
    <Stack.Screen name="HomeScreen" component={HomeScreen} />
    <Stack.Screen name="FavouritesScreen" component={FavouritesScreen} />
    <Stack.Screen name="SingleBoardDetail" component={SingleBoardDetail} /> 
    <Stack.Screen name="CompaignStatus" component={CompaignStatus} />
    <Stack.Screen name="FilterCategoryList" component={FilterCategoryList} />
    <Stack.Screen  name="AdvertismentCreateScreen"  component={AdvertismentCreateScreen}/> 
    <Stack.Screen name="AdvertismentCongratulateScreen" component={AdvertismentCongratulateScreen}/>
    <Stack.Screen name="AdvertismentConfirmationScreen" component={AdvertismentConfirmationScreen}/>
    <Stack.Screen name="ChangePassword" component={ChangePassword} />
    <Stack.Screen
      name="PreviousCompanyScreen"
      component={PreviousCompanyScreen}
    />
    {/* <Stack.Screen
      name="CurrentLocation"
      component={CurrentLocationMinimalMap}
    /> */}
    {/* <Stack.Screen name="UpdateProfile" component={UpdateProfile} /> */}
   
  </Stack.Navigator>
);

export default AppNavigator;

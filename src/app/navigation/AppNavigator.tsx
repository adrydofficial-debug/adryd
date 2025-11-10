// src/app/navigation/AppNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import AdvertismentCreateScreen from '../../features/advertisments/screens/AdvertismentCreateScreen';
import CampaignUploadFiles from '../../features/advertisments/screens/CampaignUploadFiles';
import FilterCategoryList from '../../features/boards/screens/FilterCategoryList';
import HomeScreen from '../../features/boards/screens/HomeScreen';
import SingleBoardDetail from '../../features/boards/screens/SingleBoardDetail';
import CreateCompanyScreen from '../../features/companies/screens/CreateCompanyScreen';
import CompanyListScreen from '../../features/companies/screens/CompanyListScreen';
import FavouritesScreen from '../../features/favourites/screens/FavouritesScreen';
import BottomTab from './BottomTab';
import CompaignStatus from '../../features/advertisments/screens/CompaignStatus';
import UpdateProfile from '../../features/profile/screens/UpdateProfile';
import ChatScreen from '../../features/chat/screens/ChatScreen';  
  import ChangePassword from '../../features/profile/screens/ChangePassword';
  import PreviousCompanyScreen from '../../features/profile/screens/PreviousCompany';
//  import UpdateProfile from '../../features/profile/screens/UpdateProfile';
import AdvertismentConfirmationScreen from '../..//features/advertisments/screens/AdvertismentConfirmationScreen';
import AdvertismentCongratulateScreen from '../../features/advertisments/screens/AdvertismentCongratulateScreen';
import GetAllNotification from '../../features/notifications/screens/GetAllNotification';
import SearchLocation from '../../features/locations/screens/SearchLocation';
import ContactSupportScreen from '../../components/ContactSupportScreen';
// 🔹 Define navigation param types
export type AppStackParamList = {
  BottomTab: undefined;
  CompaignStatus: undefined;
  AdvertismentCreateScreen: undefined;
  CampaignUploadFiles: { uploadUrl: string };
  CurrentLocation: undefined;
  HomeScreen: undefined;
  CompaniesScreen: undefined;
  CompanyListScreen: undefined;
  CreateCompanyScreen: undefined;
  UpdateProfile: undefined;
  PreviousCompanyScreen: undefined;
  ChangePassword: undefined;
  FavouritesScreen: undefined;
  FilterCategoryList: { slug?: string };
  SingleBoardDetail: { item: any };
  AdvertismentConfirmationScreen: { campaignId: string };
  AdvertismentCongratulateScreen: { campaignId: string};
  ChatScreen: { chatId: string; userName: string };
  Notifications: undefined;
  SearchLocation: undefined;
  ContactSupportScreen: undefined;
};
const Stack = createNativeStackNavigator<AppStackParamList>();
const AppNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
     <Stack.Screen name="BottomTab" component={BottomTab} /> 
    <Stack.Screen name="CompanyListScreen" component={CompanyListScreen} />
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
    <Stack.Screen name="ContactSupportScreen" component={ContactSupportScreen} />
       <Stack.Screen name="ChatScreen" component={ChatScreen} />

    {/* <Stack.Screen
      name="CurrentLocation"
      component={CurrentLocationMinimalMap}
    /> */}
    <Stack.Screen name="UpdateProfile" component={UpdateProfile} />
    <Stack.Screen name="Notifications" component={GetAllNotification} />
    <Stack.Screen name="SearchLocation" component={SearchLocation} />
   
  </Stack.Navigator>
);

export default AppNavigator;

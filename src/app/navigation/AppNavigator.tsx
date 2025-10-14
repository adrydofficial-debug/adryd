// src/app/navigation/AppNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import CreateCompanyScreen from '../../features/companies/screens/CreateCompanyScreen';
import HomeScreen from '../../features/boards/screens/HomeScreen';
import UpdateProfile from '../../features/Profile/screens/UpdateProfile';
import ChangePassword from '../../features/Profile/screens/ChangePassword';
import PreviousCompanyScreen from '../../features/Profile/screens/PreviousCompany';
import CurrentLocationMinimalMap from '../../features/Location/CurrentLocationMinimalMap'
import AdvertismentCreateScreen from '../../features/advertisments/screens/AdvertismentCreateScreen';
import CampaignScreen from '../../features/compaignStatus/CompaignScreen';
import CampaignUploadFiles from '../../features/advertisments/screens/AdvertismentUploadsScreen';
import SingleBoardDetail from '../../features/boards/screens/SingleBoardDetail';
// 🔹 Define navigation param types
export type AppStackParamList = {
  CampaignScreen: undefined;
  AdvertismentCreateScreen: undefined;
  CampaignUploadFiles: undefined;
  CurrentLocation: undefined;
  HomeScreen: undefined;
  CompaniesScreen: undefined;
  CreateCompanyScreen: undefined;
  UpdateProfile: undefined;
    PreviousCompanyScreen:undefined;
    ChangePassword: undefined;

};

const Stack = createNativeStackNavigator<AppStackParamList>();
const AppNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>

<Stack.Screen name="CreateCompanyScreen" component={CreateCompanyScreen} />
  {/* <Stack.Screen name="SingleBoardDetail" component={SingleBoardDetail} /> */}
  <Stack.Screen name="HomeScreen" component={HomeScreen} />
  <Stack.Screen name="CampaignScreen" component={CampaignScreen} />
   <Stack.Screen name="AdvertismentCreateScreen" component={AdvertismentCreateScreen} />
   <Stack.Screen name="CampaignUploadFiles" component={CampaignUploadFiles} />
  <Stack.Screen name="CompaniesScreen" component={CreateCompanyScreen} />
  <Stack.Screen name="ChangePassword" component={ChangePassword} />
  <Stack.Screen name="PreviousCompanyScreen" component={PreviousCompanyScreen}/>
  <Stack.Screen name="CurrentLocation" component={CurrentLocationMinimalMap} />
   <Stack.Screen name="UpdateProfile" component={UpdateProfile} />
   <Stack.Screen name="CurrentLocationMinimalMap" component={CurrentLocationMinimalMap} />
  

  </Stack.Navigator>

);

export default AppNavigator;

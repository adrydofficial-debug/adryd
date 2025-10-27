// src/features/auth/AuthNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import ForgotPasswordScreen from './screens/ForgotPassword';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ResetPassScreen from './screens/ResetPass';
// 🔹 Define navigation param types
export type AuthStackParamList = {
  LoginScreen: undefined;
  RegisterScreen: undefined;
  ForgotPassword: undefined;
  ResetPass: { phoneNumber: string; otp: string };
  UpdateProfile: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="LoginScreen" component={LoginScreen} />
    <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="ResetPass" component={ResetPassScreen} />
  </Stack.Navigator>
);

export default AuthNavigator;

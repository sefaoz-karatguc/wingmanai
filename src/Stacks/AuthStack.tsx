import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { AuthStackParams } from "../Utils/types";
import OnboardingScreen from "../Screens/Auth/OnboardingScreen";

const Auth = createStackNavigator<AuthStackParams>();
const AuthStack = () => {
  return (
    <Auth.Navigator screenOptions={{ headerShown: false }}>
      <Auth.Screen name="OnboardingScreen" component={OnboardingScreen} />
    </Auth.Navigator>
  );
};

export default AuthStack;

import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../Screens/App/HomeScreen";
import { AppStackParams } from "../Utils/types";
import ProfileScreen from "../Screens/App/ProfileScreen";

const App = createStackNavigator<AppStackParams>();

const AppStack = () => {
  return (
    <App.Navigator screenOptions={{ headerShown: false }}>
      <App.Screen name="HomeScreen" component={HomeScreen} />
      <App.Screen name="ProfileScreen" component={ProfileScreen} />
    </App.Navigator>
  );
};

export default AppStack;

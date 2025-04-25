import { NavigationContainer } from "@react-navigation/native";
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./src/Redux/store";
import AppStack from "./src/Stacks/AppStack";
import AuthStack from "./src/Stacks/AuthStack";
import { getUser } from "./src/Redux/actions";
import * as SplashScreen from "expo-splash-screen";
SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  duration: 500,
  fade: true,
});
const Main = () => {
  const isAuthenticated = useAppSelector(
    (state) => state.global.isAuthenticated
  );
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (isAuthenticated !== undefined) {
      SplashScreen.hide();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    dispatch(getUser());
  }, []);

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default Main;

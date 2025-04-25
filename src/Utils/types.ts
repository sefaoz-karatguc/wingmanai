export type InitialState = {
  isAuthenticated?: boolean;
  user?: ProfileType;
  loading: boolean;
  success: boolean;
  error: boolean;
  message: string;
};

export type AppStackParams = {
  HomeScreen: undefined;
  ProfileScreen: undefined;
};
export type AuthStackParams = {
  OnboardingScreen: undefined;
};

export type ProfileType = {
  id: number;
  device_id: string;
  full_name: string;
  email: string;
  age: number;
  country: string;
  profile_image: string | null;
  is_active: boolean;
  device_name: string;
  device_manufacturer: string;
  created_at: Date;
};

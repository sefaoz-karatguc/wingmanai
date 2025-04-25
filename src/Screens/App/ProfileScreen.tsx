import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import {
  Canvas,
  RoundedRect,
  LinearGradient,
  vec,
} from "@shopify/react-native-skia";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../Utils/supabase";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParams, ProfileType } from "../../Utils/types";
import { useAppDispatch, useAppSelector } from "../../Redux/store";
import { DEVICE_HEIGHT, DEVICE_WIDTH } from "../../Utils/constants";
import { uploadProfileImage } from "../../Redux/actions";

type Props = NativeStackScreenProps<AppStackParams, "ProfileScreen">;

const ProfileScreen = ({}: Props) => {
  const loading = useAppSelector((state) => state.global.loading);
  const user = useAppSelector((state) => state.global.user);
  const [profile, setProfile] = useState<ProfileType | undefined>(user);
  const [uploading, setUploading] = useState<boolean>(false);
  const [editing, setEditing] = useState<boolean>(false);

  // Update user active status
  const toggleActiveStatus = async () => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: !profile.is_active })
        .eq("id", profile.id);

      if (error) throw error;

      // Update local state
      setProfile({
        ...profile,
        is_active: !profile.is_active,
      });

      Alert.alert(
        "Success",
        `Profile is now ${!profile.is_active ? "active" : "inactive"}`
      );
    } catch (error) {
      console.error("Error toggling status:", error);
      Alert.alert("Error", "Failed to update status");
    }
  };
  const dispatch = useAppDispatch();
  // Upload profile image
  const pickAndUploadImage = async () => {
    if (!profile) return;

    try {
      // Request media library permissions
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "You need to allow access to your photos to upload an image."
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0].uri) {
        setUploading(true);

        // Convert image to blob
        const base64 = result.assets[0].base64;
        const uri = result.assets[0].uri;

        // Generate unique file path
        const fileExt = uri.split(".").pop();
        const fileName = `${profile.id}_${Date.now()}.${fileExt}`;
        dispatch(
          uploadProfileImage({
            base64: base64!,
            fileName,
          })
        );
        // Upload to Supabase Storage

        Alert.alert("Success", "Profile image updated");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Error", "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  // Sign out function
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // Navigation to auth screen would be handled by your auth state listener
    } catch (error) {
      console.error("Error signing out:", error);
      Alert.alert("Error", "Failed to sign out");
    }
  };

  // Render loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8a56ff" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <>
      {/* Skia background gradient */}
      <Canvas style={styles.canvas}>
        <RoundedRect
          x={0}
          y={0}
          width={DEVICE_WIDTH}
          height={DEVICE_HEIGHT}
          r={0}
        >
          <LinearGradient
            start={vec(0, 0)}
            end={vec(400, 220)}
            colors={[
              "rgba(138, 86, 255, 0.3)",
              "rgba(138, 86, 255, 0.15)",
              "rgba(138, 86, 255, 0.05)",
            ]}
          />
        </RoundedRect>
      </Canvas>
      <SafeAreaView edges={["left", "right"]} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            onPress={() => setEditing(!editing)}
            style={styles.editButton}
          >
            <MaterialIcons
              name={editing ? "close" : "edit"}
              size={24}
              color="#8a56ff"
            />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Profile Image Section */}
          <View style={styles.profileImageContainer}>
            {profile?.profile_image ? (
              <Image
                source={{ uri: profile.profile_image }}
                style={styles.profileImage}
              />
            ) : (
              <View
                style={[styles.profileImage, styles.profileImagePlaceholder]}
              >
                <MaterialIcons name="person" size={60} color="#8a56ff" />
              </View>
            )}

            <TouchableOpacity
              style={styles.photoButton}
              onPress={pickAndUploadImage}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <MaterialIcons name="add-a-photo" size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>

          {/* Active Status Badge */}
          <TouchableOpacity
            style={[
              styles.statusBadge,
              { backgroundColor: profile?.is_active ? "#4CAF50" : "#F44336" },
            ]}
            onPress={toggleActiveStatus}
          >
            <Text style={styles.statusText}>
              {profile?.is_active ? "Active" : "Inactive"}
            </Text>
          </TouchableOpacity>

          {/* Profile Details */}
          <View style={styles.detailsCard}>
            <ProfileDetailItem
              icon="person"
              label="Full Name"
              value={profile?.full_name || ""}
            />

            <ProfileDetailItem
              icon="email"
              label="Email"
              value={profile?.email || ""}
            />

            <ProfileDetailItem
              icon="cake"
              label="Age"
              value={profile?.age ? profile.age.toString() : ""}
            />

            <ProfileDetailItem
              icon="public"
              label="Country"
              value={profile?.country || ""}
            />

            <ProfileDetailItem
              icon="schedule"
              label="Created"
              value={
                profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString()
                  : "Unknown"
              }
            />
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={20} color="white" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

// Helper component for profile details
const ProfileDetailItem: React.FC<{
  icon: string;
  label: string;
  value: string | number;
}> = ({ icon, label, value }) => {
  return (
    <View style={styles.detailItem}>
      <View style={styles.detailIconContainer}>
        <MaterialIcons name={icon as any} size={22} color="#8a56ff" />
      </View>
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f5fe",
  },
  loadingText: {
    marginTop: 12,
    color: "#8a56ff",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(138, 86, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  canvas: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: DEVICE_HEIGHT,
    flex: 1,
    zIndex: -1,
  },
  scrollContent: {
    paddingBottom: 40,
    alignItems: "center",
  },
  profileImageContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 16,
    position: "relative",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#e1e1e1",
    objectFit: "cover",
  },
  profileImagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  photoButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#8a56ff",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#f8f5fe",
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 24,
  },
  statusText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  detailsCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 24,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(138, 86, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  signOutButton: {
    flexDirection: "row",
    backgroundColor: "#ff5656",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  signOutText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
});

export default ProfileScreen;

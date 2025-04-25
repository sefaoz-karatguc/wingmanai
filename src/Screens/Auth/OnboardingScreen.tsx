import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  useColorScheme,
  StyleSheet,
  Dimensions,
  Image,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { Canvas, Circle, Path, BlurMask } from "@shopify/react-native-skia";
import { AuthStackParams } from "../../Utils/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAppDispatch, useAppSelector } from "../../Redux/store";
import { login } from "../../Redux/actions";

const { width, height } = Dimensions.get("window");

// Mock profile data for the floating cards
const profiles = [
  {
    id: 1,
    name: "Emma, 28",
    bio: "Yoga instructor who loves hiking and indie music",
    interests: ["Hiking", "Yoga", "Concerts"],
    imageUrl:
      "https://images.unsplash.com/photo-1601288496920-b6154fe3626a?q=80&w=1826&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Using placeholder as per artifact guidelines
  },
  {
    id: 2,
    name: "Sophie, 21",
    bio: "Travel photographer with a passion for coffee and art",
    interests: ["Photography", "Travel", "Art"],
    imageUrl:
      "https://images.unsplash.com/photo-1617253123627-f7e8ddf6a831?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Using placeholder as per artifact guidelines
  },
  {
    id: 3,
    name: "Olivia, 26",
    bio: "Bookworm, dog lover, and amateur chef exploring new recipes",
    interests: ["Books", "Cooking", "Dogs"],
    imageUrl:
      "https://images.unsplash.com/photo-1462804993656-fac4ff489837?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Using placeholder as per artifact guidelines
  },
];

// Pickup line examples to show in the animation
const pickupLines = [
  "Is your name Google? Because you have everything I've been searching for.",
  "Seems we both love hiking! How about we take our conversation to new heights?",
  "Your photography is stunning! I'd frame a conversation with you any day.",
  "If books were stars, your profile would be a galaxy worth exploring.",
];
type Props = NativeStackScreenProps<AuthStackParams, "OnboardingScreen">;

const OnboardingScreen = ({}: Props) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.global.isAuthenticated);
  // Animation values
  const fadeIn = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const mainTitleOpacity = useSharedValue(0);
  const mainTitleY = useSharedValue(20);
  const textAnimation = useSharedValue(0);

  // Profile card animations
  const profileAnimations = [
    {
      x: useSharedValue(0),
      y: useSharedValue(0),
      rotate: useSharedValue(0),
      scale: useSharedValue(0.8),
    },
    {
      x: useSharedValue(0),
      y: useSharedValue(0),
      rotate: useSharedValue(0),
      scale: useSharedValue(0.8),
    },
    {
      x: useSharedValue(0),
      y: useSharedValue(0),
      rotate: useSharedValue(0),
      scale: useSharedValue(0.8),
    },
  ];

  // Pickup line animation
  const pickupLineOpacity = useSharedValue(0);
  const pickupLineX = useSharedValue(20);
  const [currentPickupLine, setCurrentPickupLine] = useState(0);

  // Magic sparkle animation for the "AI Magic" part
  const sparkleOpacity = useSharedValue(0);
  const sparkleScale = useSharedValue(0.5);

  // Onboarding state
  const [currentPage, setCurrentPage] = useState(0);

  // Onboarding content
  const pages = [
    {
      title: "Meet Your AI Wingman",
      subtitle: "Your digital dating assistant",
      description:
        "Upload screenshots from dating apps and get personalized pickup lines tailored to each profile",
    },
    {
      title: "Smart Profile Analysis",
      subtitle: "We see what you see",
      description:
        "Our AI analyzes interests, photos, and bio details to create conversations that truly connect",
    },
    {
      title: "Never Miss an Opportunity",
      subtitle: "Stand out from the crowd",
      description:
        "Get the perfect ice breaker every time and dramatically increase your response rate",
    },
  ];

  // Create floating profile animations
  useEffect(() => {
    // Initial animations
    fadeIn.value = withTiming(1, { duration: 800 });
    mainTitleOpacity.value = withDelay(300, withTiming(1, { duration: 800 }));
    mainTitleY.value = withDelay(300, withTiming(0, { duration: 800 }));

    // Rotate background
    rotation.value = withRepeat(
      withTiming(360, { duration: 25000, easing: Easing.linear }),
      -1,
      false
    );

    // Button pulse animation
    buttonScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Start floating profile animations with different timings
    setTimeout(() => startProfileAnimations(), 500);

    // Start pickup line animations
    startPickupLineAnimation();

    // Sparkle animation
    sparkleAnimation();

    // Subtle continuous text animation
    textAnimation.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    // Reset and restart animations when page changes
    mainTitleY.value = 20;
    mainTitleOpacity.value = 0;

    mainTitleOpacity.value = withTiming(1, { duration: 800 });
    mainTitleY.value = withTiming(0, { duration: 800 });

    // Reset profile positions
    resetProfilePositions();

    // Restart animations with slight delay
    setTimeout(() => startProfileAnimations(), 100);

    // Restart sparkle animation
    sparkleAnimation();
  }, [currentPage]);

  const resetProfilePositions = () => {
    profileAnimations.forEach((anim, index) => {
      anim.scale.value = withTiming(0.8, { duration: 400 });
    });
  };

  const startProfileAnimations = () => {
    // Different animation patterns for each profile card

    // Profile 1 animation
    profileAnimations[0].x.value = withRepeat(
      withSequence(
        withTiming(-30, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(30, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    profileAnimations[0].y.value = withRepeat(
      withSequence(
        withTiming(-60, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
        withTiming(20, { duration: 5000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    profileAnimations[0].rotate.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(5, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    profileAnimations[0].scale.value = withTiming(1, { duration: 700 });

    // Profile 2 animation
    profileAnimations[1].x.value = withRepeat(
      withSequence(
        withTiming(40, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-20, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    profileAnimations[1].y.value = withRepeat(
      withSequence(
        withTiming(30, { duration: 3500, easing: Easing.inOut(Easing.ease) }),
        withTiming(-40, { duration: 3500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    profileAnimations[1].rotate.value = withRepeat(
      withSequence(
        withTiming(8, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-3, { duration: 5000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    profileAnimations[1].scale.value = withDelay(
      200,
      withTiming(0.9, { duration: 700 })
    );

    // Profile 3 animation
    profileAnimations[2].x.value = withRepeat(
      withSequence(
        withTiming(10, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-50, { duration: 6000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    profileAnimations[2].y.value = withRepeat(
      withSequence(
        withTiming(-20, { duration: 4500, easing: Easing.inOut(Easing.ease) }),
        withTiming(50, { duration: 4500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    profileAnimations[2].rotate.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(4, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    profileAnimations[2].scale.value = withDelay(
      400,
      withTiming(0.85, { duration: 700 })
    );
  };

  const startPickupLineAnimation = () => {
    // Create looping animation for pickup lines
    const animatePickupLine = () => {
      pickupLineOpacity.value = 0;
      pickupLineX.value = 20;

      // Fade in
      pickupLineOpacity.value = withTiming(1, { duration: 500 });
      pickupLineX.value = withTiming(0, { duration: 500 });

      // Hold for a few seconds
      setTimeout(() => {
        // Fade out
        pickupLineOpacity.value = withTiming(0, { duration: 500 });
        pickupLineX.value = withTiming(-20, { duration: 500 });

        // Change to next pickup line
        setTimeout(() => {
          setCurrentPickupLine((prev) => (prev + 1) % pickupLines.length);

          // Restart animation
          setTimeout(animatePickupLine, 100);
        }, 500);
      }, 3000);
    };

    // Start the animation loop
    animatePickupLine();
  };

  const sparkleAnimation = () => {
    // Create a sparkling effect animation
    sparkleOpacity.value = 0;
    sparkleScale.value = 0.5;

    setTimeout(() => {
      sparkleOpacity.value = withTiming(1, { duration: 800 });
      sparkleScale.value = withTiming(1.2, { duration: 800 });

      setTimeout(() => {
        sparkleOpacity.value = withTiming(0, { duration: 600 });
        sparkleScale.value = withTiming(1.5, { duration: 600 });

        // Restart after delay if still on same page
        setTimeout(() => {
          if (currentPage === 1) sparkleAnimation();
        }, 2000);
      }, 1500);
    }, 1000);
  };

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage((prev) => prev + 1);
    } else {
      dispatch(login());
    }
  };

  // Create animated styles
  const titleStyle = useAnimatedStyle(() => ({
    opacity: mainTitleOpacity.value,
    transform: [{ translateY: mainTitleY.value }],
  }));

  const buttonAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const sparkleStyle = useAnimatedStyle(() => ({
    opacity: sparkleOpacity.value,
    transform: [{ scale: sparkleScale.value }],
  }));

  const pickupLineStyle = useAnimatedStyle(() => ({
    opacity: pickupLineOpacity.value,
    transform: [{ translateX: pickupLineX.value }],
  }));

  // Create animated styles for each profile card
  const profileStyles = profileAnimations.map((anim) =>
    useAnimatedStyle(() => ({
      transform: [
        { translateX: anim.x.value },
        { translateY: anim.y.value },
        { rotate: `${anim.rotate.value}deg` },
        { scale: anim.scale.value },
      ],
    }))
  );

  // Render profile cards with animated positions
  const renderProfileCards = () => {
    return profiles.map((profile, index) => (
      <Animated.View
        key={profile.id}
        style={[
          styles.profileCard,
          isDark ? styles.profileCardDark : styles.profileCardLight,
          profileStyles[index],
          {
            zIndex: 10 - index,
            position: "absolute",
            top: index === 0 ? 50 : 100 + index * 50,
            left: width / index - 125 + index * -50,
            padding: 5,
          },
        ]}
      >
        <Image
          source={{ uri: profile.imageUrl }}
          style={styles.profileImage}
          resizeMode="cover"
        />
        <View style={styles.profileInfo}>
          <Text
            style={[
              styles.profileName,
              isDark ? styles.textDark : styles.textLight,
            ]}
          >
            {profile.name}
          </Text>
          <View style={styles.interestTags}>
            {profile.interests.map((interest, i) => (
              <View
                key={i}
                style={[
                  styles.interestTag,
                  isDark ? styles.interestTagDark : styles.interestTagLight,
                ]}
              >
                <Text
                  style={[
                    styles.interestText,
                    isDark ? styles.interestTextDark : styles.interestTextLight,
                  ]}
                >
                  {interest}
                </Text>
              </View>
            ))}
          </View>
          <Text
            style={[
              styles.profileBio,
              isDark ? styles.bioTextDark : styles.bioTextLight,
            ]}
            numberOfLines={2}
          >
            {profile.bio}
          </Text>
        </View>
      </Animated.View>
    ));
  };

  // Render pickup line message bubble
  const renderPickupLine = () => {
    if (currentPage !== 2) return null;

    return (
      <Animated.View
        style={[
          styles.pickupLineContainer,
          isDark
            ? styles.pickupLineContainerDark
            : styles.pickupLineContainerLight,
          pickupLineStyle,
        ]}
      >
        <Text
          style={[
            styles.pickupLineText,
            isDark ? styles.pickupLineTextDark : styles.pickupLineTextLight,
          ]}
        >
          {pickupLines[currentPickupLine]}
        </Text>
        <View
          style={[
            styles.pickupLineTriangle,
            isDark
              ? styles.pickupLineTriangleDark
              : styles.pickupLineTriangleLight,
          ]}
        />
      </Animated.View>
    );
  };

  // Render magic sparkles effect
  const renderMagicEffect = () => {
    if (currentPage !== 1) return null;

    return (
      <Animated.View style={[styles.magicContainer, sparkleStyle]}>
        <Canvas style={styles.magicCanvas}>
          <Circle cx={0} cy={0} r={30} color="#8B5CF6" />
          <Circle cx={0} cy={0} r={20} color="#A78BFA">
            <BlurMask blur={10} style="normal" />
          </Circle>

          {/* Simple star/sparkle shapes */}
          <Path
            path="M 0,-40 L 10,-10 L 40,0 L 10,10 L 0,40 L -10,10 L -40,0 L -10,-10 Z"
            color="#C4B5FD"
          />
        </Canvas>
      </Animated.View>
    );
  };

  // Generate dynamic subtitle based on the screen
  const renderSubtitle = () => {
    return (
      <Animated.Text
        style={[
          styles.subtitle,
          isDark ? styles.subtitleDark : styles.subtitleLight,
          {
            opacity: interpolate(
              textAnimation.value,
              [0, 0.5, 1],
              [0.8, 1, 0.8]
            ),
          },
        ]}
      >
        {pages[currentPage].subtitle}
      </Animated.Text>
    );
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView
        style={[
          styles.container,
          isDark ? styles.darkBackground : styles.lightBackground,
        ]}
      >
        <StatusBar style={isDark ? "light" : "dark"} />

        {/* Background gradient animation */}
        <Animated.View style={[styles.backgroundGradient]}>
          <Canvas style={{ flex: 1 }}>
            <Circle
              cx={width * 0.3}
              cy={height * 0.2}
              r={height * 0.4}
              color={isDark ? "#4F46E5" : "#C4B5FD"}
            >
              <BlurMask blur={40} style="normal" />
            </Circle>
            <Circle
              cx={width * 0.7}
              cy={height * 0.8}
              r={height * 0.3}
              color={isDark ? "#7C3AED" : "#A78BFA"}
            >
              <BlurMask blur={30} style="normal" />
            </Circle>
            <Circle
              cx={width * 0.9}
              cy={height * 0.1}
              r={height * 0.2}
              color={isDark ? "#3B82F6" : "#93C5FD"}
            >
              <BlurMask blur={25} style="normal" />
            </Circle>
          </Canvas>
        </Animated.View>

        {/* Main content container */}
        <View style={styles.contentContainer}>
          {/* Header with logo and page indicator */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text
                style={[
                  styles.logoText,
                  isDark ? styles.logoTextDark : styles.logoTextLight,
                ]}
              >
                Wingman
              </Text>
            </View>

            <View style={styles.progressContainer}>
              {pages.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressDot,
                    index === currentPage ? styles.activeDot : {},
                    {
                      backgroundColor:
                        index === currentPage
                          ? isDark
                            ? "#8B5CF6"
                            : "#8B5CF6"
                          : isDark
                          ? "#4B5563"
                          : "#D1D5DB",
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Visual elements based on current page */}
          <View style={styles.visualContainer}>
            {renderProfileCards()}
            {renderPickupLine()}
            {renderMagicEffect()}
          </View>

          {/* Text content */}
          <View style={styles.textContent}>
            <Animated.Text
              style={[
                styles.title,
                isDark ? styles.titleDark : styles.titleLight,
                titleStyle,
              ]}
            >
              {pages[currentPage].title}
            </Animated.Text>

            {renderSubtitle()}

            <Text
              style={[
                styles.description,
                isDark ? styles.descriptionDark : styles.descriptionLight,
              ]}
            >
              {pages[currentPage].description}
            </Text>
          </View>

          {/* Bottom buttons */}
          <View style={styles.buttonContainer}>
            <Animated.View style={buttonAnimStyle}>
              <TouchableOpacity onPress={handleNext} style={styles.button}>
                {loading ? (
                  <ActivityIndicator
                    size={30}
                    color={isDark ? "white" : "black"}
                  />
                ) : (
                  <Text style={styles.buttonText}>
                    {currentPage === pages.length - 1 ? "Get Started" : "Next"}
                  </Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            {currentPage < pages.length - 1 ? (
              <TouchableOpacity
                style={styles.skipButton}
                onPress={() => setCurrentPage(pages.length - 1)}
              >
                <Text
                  style={[
                    styles.skipText,
                    isDark ? styles.skipTextDark : styles.skipTextLight,
                  ]}
                >
                  Skip Tour
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  darkBackground: {
    backgroundColor: "#111827",
  },
  lightBackground: {
    backgroundColor: "#FFFFFF",
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.6,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoText: {
    fontSize: 22,
    fontWeight: "bold",
  },
  logoTextDark: {
    color: "#FFFFFF",
  },
  logoTextLight: {
    color: "#111827",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressDot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  visualContainer: {
    flex: 1,
    width: "100%",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  profileCard: {
    width: 250,
    height: 310,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  profileCardLight: {
    backgroundColor: "#FFFFFF",
  },
  profileCardDark: {
    backgroundColor: "#1F2937",
  },
  profileImage: {
    width: "100%",
    height: "70%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  profileInfo: {
    padding: 8,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  textLight: {
    color: "#111827",
  },
  textDark: {
    color: "#FFFFFF",
  },
  interestTags: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  interestTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 6,
  },
  interestTagLight: {
    backgroundColor: "#EDE9FE",
  },
  interestTagDark: {
    backgroundColor: "#4C1D95",
  },
  interestText: {
    fontSize: 12,
    fontWeight: "500",
  },
  interestTextLight: {
    color: "#6D28D9",
  },
  interestTextDark: {
    color: "#DDD6FE",
  },
  profileBio: {
    fontSize: 13,
    marginTop: 4,
  },
  bioTextLight: {
    color: "#4B5563",
  },
  bioTextDark: {
    color: "#D1D5DB",
  },
  pickupLineContainer: {
    position: "absolute",
    bottom: 20,
    left: width / 2 - 140,
    width: 280,
    padding: 15,
    borderRadius: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  pickupLineContainerLight: {
    backgroundColor: "#8B5CF6",
  },
  pickupLineContainerDark: {
    backgroundColor: "#7C3AED",
  },
  pickupLineText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  pickupLineTextLight: {
    color: "#FFFFFF",
  },
  pickupLineTextDark: {
    color: "#FFFFFF",
  },
  pickupLineTriangle: {
    position: "absolute",
    bottom: -10,
    left: 20,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderStyle: "solid",
    backgroundColor: "transparent",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  pickupLineTriangleLight: {
    borderTopColor: "#8B5CF6",
  },
  pickupLineTriangleDark: {
    borderTopColor: "#7C3AED",
  },
  magicContainer: {
    position: "absolute",
    top: height * 0.3,
    left: width * 0.65,
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  magicCanvas: {
    width: 80,
    height: 80,
  },
  textContent: {
    width: "100%",
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  titleDark: {
    color: "#FFFFFF",
  },
  titleLight: {
    color: "#111827",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitleDark: {
    color: "#A78BFA",
  },
  subtitleLight: {
    color: "#7C3AED",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 30,
    lineHeight: 22,
  },
  descriptionDark: {
    color: "#D1D5DB",
  },
  descriptionLight: {
    color: "#4B5563",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  button: {
    paddingHorizontal: 50,
    paddingVertical: 16,
    borderRadius: 30,
    backgroundColor: "#8B5CF6",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  skipButton: {
    marginTop: 20,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
  },
  skipTextDark: {
    color: "#9CA3AF",
  },
  skipTextLight: {
    color: "#6B7280",
  },
});

export default OnboardingScreen;

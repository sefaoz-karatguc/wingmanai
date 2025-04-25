import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ListRenderItemInfo,
  StyleSheet,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import {
  Canvas,
  RoundedRect,
  LinearGradient,
  vec,
} from "@shopify/react-native-skia";
import { MaterialIcons, Ionicons, Feather } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParams } from "../../Utils/types";
import { DEVICE_HEIGHT, DEVICE_WIDTH } from "../../Utils/constants";
import * as ImagePicker from "expo-image-picker";
import { analyzeImageWithPrompt } from "../../Redux/actions";
import { useAppDispatch, useAppSelector } from "../../Redux/store";

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  isLoading?: boolean;
}
type Props = NativeStackScreenProps<AppStackParams, "HomeScreen">;

const HomeScreen = ({ navigation, route }: Props) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Welcome to Wingman! Share dating profile screenshots and I'll help you craft personalized messages.",
      sender: "ai",
    },
    { id: 2, text: "Try uploading a screenshot to get started.", sender: "ai" },
  ]);
  const [inputText, setInputText] = useState<string>("");
  const flatListRef = useRef<FlatList<Message>>(null);
  const inputAnimation = useSharedValue(0);
  const loading = useAppSelector((state) => state.global.loading);
  const aiResponse = useAppSelector((state) => state.global.aiResponse);
  const success = useAppSelector((state) => state.global.success);
  const message = useAppSelector((state) => state.global.message);
  const dispatch = useAppDispatch();
  // Animated button styles for send button
  const sendButtonStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      inputAnimation.value,
      [0, 1],
      [1, 1.1],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity: inputText.length > 0 ? 1 : 0.5,
    };
  });

  const handleSend = (): void => {
    if (inputText.trim().length === 0) return;

    // Animate button press
    inputAnimation.value = 1;
    setTimeout(() => {
      inputAnimation.value = withSpring(0);
    }, 150);

    const newMessage: Message = {
      id: messages.length + 1,
      text: inputText,
      sender: "user",
    };

    setMessages([...messages, newMessage]);
    setInputText("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        text: "I'll help craft a message based on what you've shared. Need any specific advice?",
        sender: "ai",
      };
      setMessages((prev) => [...prev, aiResponse]);

      // Scroll to the bottom
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
    }, 1000);
  };
  useEffect(() => {
    if (aiResponse) {
      const response: Message = {
        id: messages.length + 1,
        text: message,
        sender: "user",
        isLoading: false,
      };
      setMessages([...messages, response]);
    }
  }, [aiResponse, success, message]);

  const handleUploadImage = async (): Promise<void> => {
    try {
      // Request permission to access the media library
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!");
        return;
      }

      // Launch the image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true, // Request base64 data
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedAsset = result.assets[0];

        // Show loading message
        const imageUploadMessage: Message = {
          id: messages.length + 1,
          text: "Image uploaded successfully! Let me analyze this profile...",
          sender: "ai",
          isLoading: true,
        };

        setMessages([...messages, imageUploadMessage]);
        console.log("selectedAsset.base64: ", selectedAsset.base64);

        //  dispatch(analyzeImageWithPrompt({imageBase64:  selectedAsset.base64!, prompt: ""}))
      }
    } catch (error) {
      console.error("Error picking image:", error);
      alert("There was an error selecting the image. Please try again.");
    }
  };

  const renderMessage = ({ item }: ListRenderItemInfo<Message>) => (
    <View
      style={[
        styles.renderMessage,
        {
          alignSelf: item.sender === "user" ? "flex-end" : "flex-start",
          backgroundColor: item.sender === "user" ? "#8a56ff" : "#f0f0f0",
        },
      ]}
    >
      <Text
        style={{
          color: item.sender === "user" ? "white" : "#333",
          fontSize: 16,
        }}
      >
        {item.text}
      </Text>
      {item.isLoading && (
        <Text
          style={{
            color: item.sender === "user" ? "white" : "#666",
            fontSize: 12,
            marginTop: 4,
          }}
        >
          Analyzing...
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
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

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={styles.header2}>
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 18 }}>
              W
            </Text>
          </View>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#333" }}>
            Wingman
          </Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("ProfileScreen")}>
          <Feather name="user" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Chat Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 80 }}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      {/* Input Area */}
      <View style={styles.inputArea}>
        <TouchableOpacity
          style={{ marginRight: 12 }}
          onPress={handleUploadImage}
        >
          <View style={styles.inputArea2}>
            <MaterialIcons
              name="add-photo-alternate"
              size={22}
              color="#8a56ff"
            />
          </View>
        </TouchableOpacity>

        <View style={styles.container}>
          <TextInput
            style={{ flex: 1, fontSize: 16, color: "#333" }}
            placeholder="Message Wingman..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            style={{ marginLeft: 8, opacity: inputText.length > 0 ? 1 : 0.5 }}
            onPress={inputText.length > 0 ? handleSend : undefined}
          >
            <Animated.View style={[sendButtonStyle]}>
              <View style={styles.sendButton}>
                <Ionicons name="send" size={18} color="white" />
              </View>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Skia gradient background effect */}
      <Canvas style={styles.canvas2}>
        <RoundedRect x={0} y={0} width={400} height={120} r={0}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(400, 120)}
            colors={[
              "rgba(138, 86, 255, 0.1)",
              "rgba(138, 86, 255, 0.05)",
              "rgba(255, 255, 255, 0)",
            ]}
          />
        </RoundedRect>
      </Canvas>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  canvas: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: DEVICE_HEIGHT,
    flex: 1,
    zIndex: -1,
  },
  inputArea: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#eaeaea",
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#8a56ff",
    justifyContent: "center",
    alignItems: "center",
  },
  inputArea2: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  header2: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#8a56ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  header: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
    justifyContent: "space-between",
  },
  renderMessage: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: "80%",
    marginVertical: 4,
    marginHorizontal: 12,
  },
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: "center",
  },
  canvas2: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    zIndex: -1,
  },
});

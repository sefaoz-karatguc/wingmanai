import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getUniqueId,
  getManufacturer,
  getDeviceName,
} from "react-native-device-info";
import * as RNLocalize from "react-native-localize";
import { supabase } from "../Utils/supabase";
import { decode } from "base64-arraybuffer";
import axios from "axios";

export const login = createAsyncThunk("login", async () => {
  try {
    const device_id = await getUniqueId();
    const device_name = await getDeviceName();
    const device_manufacturer = await getManufacturer();
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        device_id,
        full_name: "",
        email: "",
        age: null,
        country: RNLocalize.getCountry(),
        profile_image: null,
        is_active: true,
        device_name,
        device_manufacturer,
      })
      .select()
      .single();
    if (error) {
      return {
        success: false,
        message: "Something went wrong, cannot proceed, please try again!",
        data: undefined,
      };
    } else {
      return {
        success: true,
        message: "Welcome buddy! Let's get it done!",
        data,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Something went wrong, cannot proceed, please try again!",
      data: undefined,
    };
  }
});

export const getUser = createAsyncThunk("getUser", async () => {
  try {
    const device_id = await getUniqueId();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("device_id", device_id)
      .eq("is_active", true)
      .single();
    if (error) {
      return {
        success: false,
        message: "Something went wrong, canoot proceed, please try again!",
        data: undefined,
      };
    } else {
      return {
        success: data.is_active ? true : false,
        message: data.is_active ? "Welcome buddy! Let's get it done!" : "",
        data: data.is_active ? data : undefined,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Something went wrong, cannot proceed, please try again!",
      data: undefined,
    };
  }
});

export const uploadProfileImage = createAsyncThunk(
  "uploadProfileImage",
  async (data: { fileName: string; base64: string }) => {
    try {
      const filePath = `profiles/${data.fileName}`;
      const device_id = await getUniqueId();
      const { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(filePath, decode(data.base64));

      if (uploadError) {
        return {
          success: false,
          message: "Something went wrong while uploading image",
          data: undefined,
        };
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("profile-images").getPublicUrl(filePath);

      // Update profile with new image URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ profile_image: publicUrl })
        .eq("device_id", device_id);

      if (updateError) {
        return {
          success: false,
          message: "Profile could not be updated",
          data: undefined,
        };
      }
      const user = await supabase
        .from("profiles")
        .select("*")
        .eq("device_id", device_id)
        .single();
      return {
        success: true,
        message: "Updated",
        data: user.data,
      };
    } catch (error) {}
  }
);

export const inactivateProfile = createAsyncThunk(
  "inactivateProfile",
  async () => {
    try {
      const device_id = await getUniqueId();
      const { data, error } = await supabase
        .from("profiles")
        .update({ is_active: false })
        .eq("device_id", device_id);
      if (error) {
        return {
          success: false,
          message: "Something went wrong, canoot proceed, please try again!",
          data: undefined,
        };
      } else {
        return {
          success: true,
          message: "Sorry to see you go!",
          data,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "Something went wrong, cannot proceed, please try again!",
        data: undefined,
      };
    }
  }
);
export const analyzeImageWithPrompt = createAsyncThunk(
  "gpt",
  async (body: { imageBase64: string; prompt: string }) => {
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4-vision-preview",
          messages: [
            {
              role: "system",
              content: `You're the most known, the best relationship coach in the whole world. You're master when it comes to seducing the opposite sex. 
            Users will share with you the dating profile of the person they really liked. Your job is after analyzing the given profile, coming up the best conversation starter. 
            You have to answer in the same language of user message.`,
            },
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${body.imageBase64}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 1000,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return {
        data: response.data,
        success: true,
        message: "Here is your response",
      };
    } catch (error: any) {
      return {
        data: undefined,
        success: false,
        message: "Something went wrong while generating a response for you!",
      };
    }
  }
);

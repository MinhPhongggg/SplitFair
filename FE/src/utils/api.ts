import axios from "@/utils/axios.customize";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { IUserAuth } from "@/context/app.context";
export const registerAPI = (
  userName: string,
  email: string,
  password: string
) => {
  const url = `/api/auth/register`;
  return axios.post<IUserAuth>(url, { userName, email, password });
};

export const loginAPI = (email: string, password: string) => {
  const url = `/api/auth/login`;
  return axios.post<IUserAuth>(url, { email, password });
};

export const getAccountAPI = () => {
  const url = `/api/auth/account`;
  return axios.get<IUserAuth>(url);
};

export const changePasswordAPI = (
  currentPassword: string,
  newPassword: string
) => {
  const url = `/api/auth/change-password`;
  return axios.post(url, { currentPassword, newPassword });
};
// API Gửi yêu cầu quên mật khẩu (Gửi OTP)
export const forgotPasswordAPI = (email: string) => {
  const url = `/api/auth/forgot-password`;
  return axios.post(url, { email });
};

// API Reset mật khẩu (Xác nhận OTP và đổi Pass)
export const resetPasswordAPI = (
  email: string,
  otp: string,
  newPassword: string
) => {
  const url = `/api/auth/reset-password`;
  return axios.post(url, { email, otp, newPassword });
};
export const scanReceiptAPI = (
  fileUri: string,
  fileType: string = "image/jpeg",
  fileName: string = "receipt.jpg"
) => {
  const url = `/api/ocr/scan`;
  const formData = new FormData();
  formData.append("file", {
    uri: fileUri,
    type: fileType,
    name: fileName,
  } as any);

  return axios.post(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const printAsyncStorage = () => {
  AsyncStorage.getAllKeys((err, keys) => {
    AsyncStorage.multiGet(keys!, (error, stores) => {
      let asyncStorage: any = {};
      stores?.map((result, i, store) => {
        asyncStorage[store[i][0]] = store[i][1];
      });
      console.log(JSON.stringify(asyncStorage, null, 2));
    });
  });
};

export const getURLBaseBackend = () => {
  const backend =
    Platform.OS === "android"
      ? process.env.EXPO_PUBLIC_ANDROID_API_URL
      : process.env.EXPO_PUBLIC_IOS_API_URL;
  return backend;
};

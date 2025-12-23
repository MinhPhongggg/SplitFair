import { GoogleSignin } from "@react-native-google-signin/google-signin";

export const configureGoogleSignIn = () => {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

  if (!webClientId) {
    console.warn(" Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in env");
    return;
  }

  GoogleSignin.configure({
    webClientId,
    offlineAccess: false,
  });
};

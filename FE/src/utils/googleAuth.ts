import { GoogleSignin } from "@react-native-google-signin/google-signin";
import axios from "@/utils/axios.customize";

export const loginWithGoogle = async () => {
  await GoogleSignin.hasPlayServices({
    showPlayServicesUpdateDialog: true,
  });

  // Thực hiện đăng nhập
  const response = await GoogleSignin.signIn();

  // TRUY CẬP TOKEN THEO CẤU TRÚC MỚI: response.data.idToken
  const idToken = response.data?.idToken || (response as any).idToken;

  if (!idToken) {
    // Nếu vẫn lỗi, hãy log toàn bộ để kiểm tra
    console.log("Full Google Response:", JSON.stringify(response, null, 2));
    throw new Error("Không lấy được Google idToken");
  }

  // ✅ ĐÂY LÀ DÒNG LOG QUAN TRỌNG CHO BẠN VÀ BE
  console.log("🔥 GOOGLE ID TOKEN:", idToken);

  // Gửi lên Backend
  const res = await axios.post("/api/auth/google", { idToken });

  return res.data;
};

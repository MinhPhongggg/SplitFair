import { confirmPasswordReset } from "@react-native-firebase/auth";
import * as Yup from "yup";
export const LoginSchema = Yup.object().shape({
  password: Yup.string()
    .min(6, "Password cần tối thiểu 6 ký tự")
    .max(50, "Password tối đa 50 ký tự")
    .required("Password không được để trống"),
  email: Yup.string()
    .email("Định dạng email không hợp lệ")
    .required("email không được để trống"),
});
export const SignUpSchema = Yup.object().shape({
  password: Yup.string()
    .min(6, "Password cần tối thiểu 6 ký tự")
    .max(50, "Password tối đa 50 ký tự")
    .required("Password không được để trống"),
  email: Yup.string()
    .email("Định dạng email không hợp lệ")
    .required("email không được để trống"),
  name: Yup.string().required("Họ tên không được để trống"),
});
export const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email("Định dạng email không hợp lệ ")
    .required("Email không được để trống"),
});
export const resetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(6, "Password cần tối thiểu 6 ký tự")
    .max(50, "Password tối đa 50 ký tự")
    .required("Password không được để trống"),
  confirmPassword: Yup.string()
    .required("confirmPassword không được để trống")
    .oneOf([Yup.ref("password")], "Passwords must match"),
  otp: Yup.string().required("Otp không được để trống"),
});

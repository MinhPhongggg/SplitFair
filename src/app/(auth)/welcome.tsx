import { Dimensions, StyleSheet, Text, View, TouchableOpacity, StatusBar } from "react-native";
import { APP_COLOR } from "@/utils/constant";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import Carousel from "react-native-reanimated-carousel";
import { useState } from "react";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

const ONBOARDING_DATA = [
  {
    id: 1,
    title: "Tạo nhóm chi tiêu",
    description: "Lên kế hoạch cho các chuyến đi, bữa ăn và chia sẻ hóa đơn cùng bạn bè một cách dễ dàng.",
    icon: "users",
  },
  {
    id: 2,
    title: "Chia tiền công bằng",
    description: "SplitFair giúp bạn tính toán chính xác ai nợ ai, không còn đau đầu vì sổ sách rắc rối.",
    icon: "file-invoice-dollar",
  },
  {
    id: 3,
    title: "Thống kê chi tiết",
    description: "Theo dõi ngân sách và các khoản chi tiêu của nhóm một cách trực quan và minh bạch.",
    icon: "chart-pie",
  },
];

const WelcomePage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const renderItem = ({ item }: any) => {
    return (
      <View style={styles.slideContainer}>
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={[APP_COLOR.ORANGE, '#FFB74D']}
            style={styles.iconBackground}
          >
            <FontAwesome5 name={item.icon} size={60} color="#fff" />
          </LinearGradient>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Carousel Section */}
      <View style={styles.carouselContainer}>
        <Carousel
          loop
          width={width}
          height={height * 0.6}
          autoPlay={true}
          data={ONBOARDING_DATA}
          scrollAnimationDuration={2000}
          onSnapToItem={(index) => setCurrentIndex(index)}
          renderItem={renderItem}
        />
        
        {/* Pagination Dots */}
        <View style={styles.paginationContainer}>
          {ONBOARDING_DATA.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                { 
                  backgroundColor: index === currentIndex ? APP_COLOR.ORANGE : '#E0E0E0',
                  width: index === currentIndex ? 20 : 8 
                }
              ]}
            />
          ))}
        </View>
      </View>

      {/* Bottom Action Section */}
      <View style={styles.bottomContainer}>
        <View style={styles.logoSmall}>
            <FontAwesome5 name="money-bill-wave" size={20} color={APP_COLOR.ORANGE} />
            <Text style={styles.brandText}>SplitFair</Text>
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={styles.loginButtonText}>Đăng nhập</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signupButton}
          onPress={() => router.push("/(auth)/signup")}
        >
          <Text style={styles.signupButtonText}>Tạo tài khoản mới</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  carouselContainer: {
    flex: 0.65,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 30,
    shadowColor: APP_COLOR.ORANGE,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  bottomContainer: {
    flex: 0.35,
    paddingHorizontal: 30,
    justifyContent: 'flex-end',
    paddingBottom: 50,
  },
  logoSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    gap: 8,
  },
  brandText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: APP_COLOR.ORANGE,
  },
  loginButton: {
    backgroundColor: APP_COLOR.ORANGE,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: APP_COLOR.ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  signupButton: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: APP_COLOR.ORANGE,
  },
  signupButtonText: {
    color: APP_COLOR.ORANGE,
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default WelcomePage;

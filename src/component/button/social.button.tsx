import { Image, StyleSheet, View } from "react-native";
import ShareButton from "./share.button";
import fbLogo from "@/assets/auth/facebook.png";
import ggLogo from "@/assets/auth/google.png";
import TextBetweenLine from "./text.between.line";

const styles = StyleSheet.create({
  welcomeBtn: {
    flex: 1,
    gap: 30,
  },
});
interface IProps {
  title: string;
}
const SocialButton = (props: IProps) => {
  const { title } = props;
  return (
    <View style={styles.welcomeBtn}>
      <TextBetweenLine textColor="black" title={title} />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: 30,
        }}
      >
        <ShareButton
          title="faceBook"
          onPress={() => {
            alert("me");
          }}
          textStyle={{ textTransform: "uppercase" }}
          buttonStyle={{
            backgroundColor: "#fff",
            justifyContent: "center",
            borderRadius: 30,
          }}
          icon={<Image source={fbLogo} />}
        />
        <ShareButton
          title="google"
          onPress={() => {
            alert("me");
          }}
          textStyle={{ textTransform: "uppercase" }}
          buttonStyle={{
            backgroundColor: "#fff",
            paddingHorizontal: 20,
            justifyContent: "center",
            borderRadius: 30,
          }}
          icon={<Image source={ggLogo} />}
        />
      </View>
    </View>
  );
};
export default SocialButton;

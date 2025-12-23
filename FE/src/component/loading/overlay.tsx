import { View, StyleSheet, ActivityIndicator } from "react-native";

interface IProps {}

const styles = StyleSheet.create({
  loading: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
});
const LoadingOverlay = (props: IProps) => {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" />
    </View>
  );
};

export default LoadingOverlay;

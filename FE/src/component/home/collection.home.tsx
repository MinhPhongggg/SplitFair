import { APP_COLOR } from "@/utils/constant";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import demo from "@/assets/demo.jpg";
// import { getTopRestaurant } from "@/utils/api";

interface IProps {
  name: string;
  description: string;
  refAPI: string;
}
const styles = StyleSheet.create({
  container: {
    padding: 10,
    width: "100%",
  },
  sale: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: APP_COLOR.ORANGE,
    padding: 3,
    borderRadius: 3,
    alignSelf: "flex-start",
  },
});
const CollectionHome = (props: IProps) => {
  const { name, description, refAPI } = props;
  const data = [
    { key: 1, image: demo, name: "cua hang 1" },
    { key: 2, image: demo, name: "cua hang 2" },
    { key: 3, image: demo, name: "cua hang 3" },
    { key: 4, image: demo, name: "cua hang 4" },
    { key: 5, image: demo, name: "cua hang 5" },
  ];
  const [restaurants, setRestaurant] = useState<ITopRestaurant[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const res = await getTopRestaurant(refAPI);
      if (res.data) {
        setRestaurant(res.data);
      } else {
        //error
      }
      fetchData();
    };
  }, [refAPI]);
  const backend =
    Platform.OS === "android"
      ? process.env.EXPO_PUBLIC_ANDROID_API_URL
      : process.env.EXPO_PUBLIC_IOS_API_URL;
  const baseImage = `${backend}/images/restaurant`;
  return (
    <>
      <View style={{ height: 10, backgroundColor: "#e9e9e9" }}></View>
      <View style={styles.container}>
        <View style={{ justifyContent: "space-between", flexDirection: "row" }}>
          <Text
            style={{
              color: APP_COLOR.ORANGE,
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            {name}
          </Text>
          <Text style={{ color: "#5a5a5a" }}>Xem tat ca</Text>
        </View>
        <View style={{ marginVertical: 5 }}>
          <Text style={{ color: "#5a5a5a" }}>{description}</Text>
        </View>
        <FlatList
          data={restaurants}
          horizontal
          contentContainerStyle={{ gap: 5 }}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {
            return (
              <View style={{ backgroundColor: "#edefef" }}>
                <Image
                  style={{ height: 130, width: 130 }}
                  source={{ uri: `${baseImage}/${item.image}` }}
                />
                <View style={{ padding: 5 }}>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{ fontWeight: "600", maxWidth: 130 }}
                  >
                    {item.name}
                  </Text>
                  <View>
                    <View style={styles.sale}>
                      <Text style={{ color: APP_COLOR.ORANGE }}>
                        Flash sale
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          }}
        />
      </View>
    </>
  );
};
export default CollectionHome;

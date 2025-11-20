import CustomFlatList from "@/component/CustomFlatList/CustomFlatList";
import CollectionHome from "@/component/home/collection.home";
import HeaderHome from "@/component/home/header.home";
import SearchHome from "@/component/home/search.home";
import TopListHome from "@/component/home/top.list.home";
import { View, Text, StyleSheet, ScrollView, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const data = [
  {
    key: 1,
    name: "Top Quán Rating 5* tuần này",
    description: "abc",
    refAPI: "top-rating",
  },
  { key: 2, name: "Quán Mới Lên Sàn", description: "abc", refAPI: "newcomer" },
  {
    key: 3,
    name: "Ăn Thỏa Thích, Freeship 0Đ",
    description: "abc",
    refAPI: "top-freeship",
  },
];

const HomeTab = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <CustomFlatList
        data={data}
        style={styles.list}
        renderItem={({ item }) => (
          <CollectionHome
            name={item.name}
            description={item.description}
            refAPI={item.refAPI}
          />
        )}
        HeaderComponent={<HeaderHome />}
        StickyElementComponent={<SearchHome />}
        TopListElementComponent={<TopListHome />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ecf0f1",
    flex: 1,
    justifyContent: "center",
    overflow: "hidden",
  },
  header: {
    borderColor: "red",
    borderWidth: 5,
    height: 100,
    marginBottom: 6,
    width: "100%",
  },
  item: {
    borderColor: "green",
    borderWidth: 1,
    height: 250,
    marginBottom: 10,
    width: "100%",
  },
  list: {
    overflow: "hidden",
  },
  sticky: {
    backgroundColor: "#2555FF50",
    borderColor: "blue",
    borderWidth: 5,
    height: 100,
    marginBottom: 6,
    width: "100%",
  },
});

export default HomeTab;

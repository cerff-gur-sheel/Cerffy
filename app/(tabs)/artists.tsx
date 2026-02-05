import { Text, View } from "@/components/Themed";
import { fetchArtists } from "@/services/api";
import { useEffect, useState } from "react";
import { Dimensions, FlatList, Image, Pressable } from "react-native";

const COLUMNS = 2;

export default function Artists() {
  const [artists, setArtists] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const dat = await fetchArtists();
      setArtists(dat);
    };
    fetchData();
  }, []);

  return (
    <View>
      <Text>Artists</Text>
      <FlatList
        data={artists}
        keyExtractor={(_item, index) => _item.id || index.toString()}
        numColumns={COLUMNS}
        renderItem={({ item }) => (
          <Pressable onPress={() => {}}>
            <Text>{item.name}</Text>
            <Image
              source={{ uri: item.cover, cache: "force-cache" }}
              resizeMode="cover"
              style={styles.thumbnail}
            />
          </Pressable>
        )}
      />
    </View>
  );
}

const { width } = Dimensions.get("window");

const styles = {
  thumbnail: {
    width: width / COLUMNS - 20,
    height: width / COLUMNS - 20,
  },
};

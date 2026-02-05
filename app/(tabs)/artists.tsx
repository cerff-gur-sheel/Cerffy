import { Text, View } from "@/components/Themed";
import { fetchArtists } from "@/services/api";
import { useEffect, useState } from "react";
import { FlatList } from "react-native";

export default function Artists() {
  const [artists, setArtists] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const dat = await fetchArtists();
      setArtists(dat.map((artist) => artist.name));
    };
    fetchData();
  }, []);

  return (
    <View>
      <Text>Artists</Text>
      <FlatList
        data={artists}
        keyExtractor={(_item, index) => index.toString()}
        numColumns={1}
        renderItem={({ item }) => (
          <View>
            <Text>{item}</Text>
          </View>
        )}
      />
    </View>
  );
}

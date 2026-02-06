import { Text, View } from "@/components/Themed";
import { Artist, getArtistDetails } from "@/services/api";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Image } from "react-native";

export default function ArtistModal() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [artist, setArtist] = useState<Artist>();

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const data = await getArtistDetails(id);
        setArtist(data);
      }
    };
    fetchData();
  }, [id]);

  console.log(artist);

  return (
    <View>
      <Image
        source={{ uri: artist?.cover, cache: "force-cache" }}
        resizeMode="cover"
        style={styles.thumbnail}
      />
      <Text>{artist?.name}</Text>
      <Text>{artist?.biography}</Text>
      <Text>Albums: {artist?.albums.length}</Text>
      <FlatList
        data={artist?.albums}
        keyExtractor={(_item, index) => _item.id || index.toString()}
        renderItem={({ item }) => (
          <View>
            <Text>{item.title}</Text>
          </View>
        )}
      />
      <Text>Singles: {artist?.singles.length}</Text>
      <FlatList
        data={artist?.singles}
        keyExtractor={(_item, index) => _item.id || index.toString()}
        renderItem={({ item }) => (
          <View>
            <Text>{item.title}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = {
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
};

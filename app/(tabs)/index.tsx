import { FlashList } from "@shopify/flash-list";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { TorrentListItem } from "@/components/TorrentItem";
import { colors } from "../../theme/colors";
import { useEffect } from "react";
import { torrentListQuery } from "@/api/queries";

export default function TorrentScreen() {
  const router = useRouter();

  const { data: torrents, isLoading, refetch } = torrentListQuery();

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlashList
        data={torrents}
        renderItem={({ item }) => (
          <TorrentListItem
            torrent={item}
            onPress={() =>
              router.push({
                pathname: "/(details)/[id]",
                params: { id: item.id },
              })
            }
          />
        )}
        estimatedItemSize={80}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No torrents found</Text>
          </View>
        }
        onRefresh={refetch}
        refreshing={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  list: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    color: colors.onSurfaceVariant,
    fontSize: 16,
  },
});

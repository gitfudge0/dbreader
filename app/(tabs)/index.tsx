import { FlashList } from "@shopify/flash-list";
import { StyleSheet, View } from "react-native";
import { FAB, ActivityIndicator, Text } from "react-native-paper";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { TorrentListItem } from "@/components/TorrentItem";
import { AddMagnetModal } from "../../components/AddMagnetModal";
import { colors } from "../../theme/colors";
import { api } from "@/api/methods";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export default function TorrentScreen() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  const {
    data: torrents,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["torrents"],
    queryFn: () => api.getTorrents(),
  });

  const addMagnetMutation = useMutation({
    mutationFn: (magnet: string) => api.addMagnet(magnet),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["torrents"] });
      setModalVisible(false);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Magnet link added successfully",
      });
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
      });
    },
  });

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
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      />
      <AddMagnetModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        onSubmit={(magnet) => addMagnetMutation.mutate(magnet)}
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
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
});

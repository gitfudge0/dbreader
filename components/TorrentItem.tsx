import { format } from "date-fns";
import { StyleSheet, View } from "react-native";
import { Surface, Text, TouchableRipple } from "react-native-paper";
import { colors } from "../theme/colors";
import TorrentModel from "@/models/Torrents.model";

const getStatusColor = (status: string) => {
  switch (status) {
    case "downloaded":
      return colors.success;
    case "downloading":
      return colors.primary;
    case "error":
    case "magnet_error":
    case "virus":
    case "dead":
      return colors.error;
    default:
      return colors.warning;
  }
};

export function TorrentListItem({
  torrent,
  onPress,
}: {
  torrent: TorrentModel.TorrentItem;
  onPress: () => void;
}) {
  return (
    <TouchableRipple onPress={onPress} rippleColor={colors.ripple}>
      <Surface style={styles.container}>
        <Text numberOfLines={1} style={styles.filename}>
          {torrent.filename}
        </Text>
        <View style={styles.bottomRow}>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(torrent.status) },
              ]}
            />
            <Text style={styles.status}>{torrent.status}</Text>
          </View>
          <Text style={styles.date}>
            {format(new Date(torrent.added), "MMM dd, yyyy")}
          </Text>
        </View>
      </Surface>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    padding: 16,
    borderRadius: 8,
    backgroundColor: colors.surface,
    elevation: 2,
  },
  filename: {
    fontSize: 16,
    color: colors.onSurface,
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  status: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  date: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
});

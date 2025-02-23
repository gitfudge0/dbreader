import { Stack, router } from "expo-router";
import { colors } from "@/theme/colors";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Checkbox,
  Text,
  TextInput,
} from "react-native-paper";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/api/methods";
import { useEffect, useState } from "react";

const formatFileSize = (bytes: number) => {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  } else if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const truncatePath = (path: string) => {
  if (path.length <= 40) return path;
  return "..." + path.slice(-40);
};

export default function MagnetScreen() {
  const [magnetLink, setMagnetLink] = useState("");
  const [error, setError] = useState("");
  const [torrentId, setTorrentId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());

  const addMagnetMutation = useMutation({
    mutationFn: (magnet: string) => api.addMagnet(magnet),
    onSuccess: (data) => {
      setTorrentId(data.id);
      setError("");
    },
    onError: (err) => {
      setError(
        err instanceof Error ? err.message : "Failed to add magnet link",
      );
    },
  });

  const { data: torrentInfo, isLoading: isLoadingInfo } = useQuery({
    queryKey: ["torrent", torrentId],
    queryFn: () => api.getTorrentInfo(torrentId!),
    enabled: !!torrentId,
  });

  const selectFilesMutation = useMutation({
    mutationFn: (files: string) => api.selectFiles(torrentId!, files),
    onSuccess: () => {
      router.push(`/${torrentId}`);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Failed to select files");
    },
  });

  useEffect(() => {
    if (torrentInfo?.files) {
      setSelectedFiles(new Set(torrentInfo.files.map((f) => f.id)));
    }
  }, [torrentInfo]);

  const handleSubmit = () => {
    if (!magnetLink.trim()) {
      setError("Please enter a magnet link");
      return;
    }
    setError("");
    addMagnetMutation.mutate(magnetLink);
  };

  const handleFileToggle = (fileId: number) => {
    if (torrentInfo?.status !== "waiting_files_selection") return;

    const newSelected = new Set(selectedFiles);
    if (selectedFiles.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  const handleStartTorrent = () => {
    const selectedFileIds = Array.from(selectedFiles).join(",");
    selectFilesMutation.mutate(selectedFileIds);
  };

  const getTotalSelectedSize = () => {
    if (!torrentInfo?.files) return 0;
    return torrentInfo.files
      .filter((file) => selectedFiles.has(file.id))
      .reduce((acc, file) => acc + file.bytes, 0);
  };

  const isLoading =
    addMagnetMutation.isPending ||
    isLoadingInfo ||
    selectFilesMutation.isPending;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Add Torrent",
          headerTintColor: "#fff",
          headerStyle: {
            backgroundColor: colors.surface,
          },
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.inputContainer}>
          <TextInput
            mode="outlined"
            label="Magnet Link"
            value={magnetLink}
            onChangeText={setMagnetLink}
            disabled={isLoading}
            style={styles.input}
            textColor={colors.onSurface}
            theme={{
              colors: {
                onSurfaceVariant: colors.onSurface, // Make label more visible
                placeholder: colors.onSurfaceVariant,
                text: colors.onPrimary,
                primary: colors.primary,
                outline: colors.surfaceVariant,
              },
            }}
          />
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={addMagnetMutation.isPending}
            disabled={isLoading}
            style={styles.submitButton}
          >
            Submit
          </Button>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {isLoadingInfo && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}

        {torrentInfo && (
          <View style={styles.content}>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Torrent Information</Text>
              <Text style={styles.infoText}>Name: {torrentInfo.filename}</Text>
              <Text style={styles.infoText}>
                Size: {formatFileSize(torrentInfo.bytes)}
              </Text>
              <Text style={styles.infoText}>Status: {torrentInfo.status}</Text>
            </View>

            {torrentInfo.files && (
              <View style={[styles.card, styles.filesCard]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.sectionTitle}>Files</Text>
                  <Text style={styles.totalSize}>
                    Selected: {formatFileSize(getTotalSelectedSize())}
                  </Text>
                </View>

                {torrentInfo.files.map((file) => (
                  <View key={file.id} style={styles.fileRow}>
                    <Checkbox.Android
                      status={
                        selectedFiles.has(file.id) ? "checked" : "unchecked"
                      }
                      onPress={() => handleFileToggle(file.id)}
                      disabled={
                        torrentInfo.status !== "waiting_files_selection"
                      }
                    />
                    <View style={styles.fileInfo}>
                      <Text style={styles.filePath}>
                        {truncatePath(file.path)}
                      </Text>
                      <Text style={styles.fileSize}>
                        {formatFileSize(file.bytes)}
                      </Text>
                    </View>
                  </View>
                ))}

                <Button
                  mode="contained"
                  onPress={handleStartTorrent}
                  disabled={
                    selectedFiles.size === 0 ||
                    torrentInfo.status !== "waiting_files_selection"
                  }
                  loading={selectFilesMutation.isPending}
                  style={styles.startButton}
                >
                  Start Torrent
                </Button>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inputContainer: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: colors.surface,
  },
  submitButton: {
    marginBottom: 16,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: colors.error,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: "#fff",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  filesCard: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  infoText: {
    color: "#fff",
    marginBottom: 4,
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
  },
  fileInfo: {
    flex: 1,
    marginLeft: 8,
  },
  filePath: {
    color: "#fff",
    fontSize: 14,
  },
  fileSize: {
    color: "#fff",
    opacity: 0.7,
    fontSize: 12,
    marginTop: 2,
  },
  totalSize: {
    color: "#fff",
    opacity: 0.7,
  },
  startButton: {
    marginTop: 16,
  },
});

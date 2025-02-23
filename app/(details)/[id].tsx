import { api } from "@/api/methods";
import UnrestrictModel from "@/models/Unrestrict.model";
import { colors } from "@/theme/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, Stack } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Text,
  IconButton,
} from "react-native-paper";
import Toast from "react-native-toast-message";
import * as FileSystem from "expo-file-system";
import * as Notifications from "expo-notifications";
import BackgroundService from "react-native-background-actions";

interface DownloadProgress {
  [key: string]: {
    progress: number;
    status: "downloading" | "completed" | "error";
    filename: string;
  };
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

interface UnrestrictedCache {
  data: UnrestrictModel.UnrestrictedItem;
  timestamp: number;
}

const CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 hours

const LoadingOverlay = () => (
  <View style={styles.loadingOverlay}>
    <ActivityIndicator size="large" color={colors.primary} />
    <Text style={styles.loadingText}>Unrestricting links...</Text>
  </View>
);

export default function TorrentDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [unrestrictedLinks, setUnrestrictedLinks] = useState<
    Record<string, UnrestrictModel.UnrestrictedItem>
  >({});
  const [downloads, setDownloads] = useState<DownloadProgress>({});

  // Fetch torrent details
  const { data: torrent, isLoading } = useQuery({
    queryKey: ["torrent", id],
    queryFn: () => api.getTorrentInfo(id),
  });

  // Load cached unrestricted links
  useEffect(() => {
    const loadCachedLinks = async () => {
      try {
        const cached = await AsyncStorage.getItem(`unrestricted_${id}`);
        if (cached) {
          const parsedCache: Record<string, UnrestrictedCache> =
            JSON.parse(cached);
          const now = Date.now();

          // Filter and set valid cached links
          const validLinks = Object.entries(parsedCache).reduce(
            (acc, [key, value]) => {
              if (now - value.timestamp < CACHE_DURATION) {
                acc[key] = value.data;
              }
              return acc;
            },
            {} as Record<string, UnrestrictModel.UnrestrictedItem>,
          );

          setUnrestrictedLinks(validLinks);
        }
      } catch (error) {
        console.error("Error loading cached links:", error);
      }
    };

    loadCachedLinks();
  }, [id]);

  const unrestrictMutation = useMutation({
    mutationFn: async (links: string[]) => {
      const results = await Promise.all(
        links.map(async (link) => {
          const result = await api.unrestrictLink(link);
          return { link, result };
        }),
      );
      return results;
    },
    onSuccess: async (data) => {
      // Update cache with all unrestricted links
      const newCache = data.reduce(
        (acc, { link, result }) => {
          acc[link] = result;
          return acc;
        },
        {} as Record<string, UnrestrictModel.UnrestrictedItem>,
      );

      setUnrestrictedLinks(newCache);

      try {
        const cacheData = Object.entries(newCache).reduce(
          (acc, [key, value]) => {
            acc[key] = {
              data: value,
              timestamp: Date.now(),
            };
            return acc;
          },
          {} as Record<string, UnrestrictedCache>,
        );

        await AsyncStorage.setItem(
          `unrestricted_${id}`,
          JSON.stringify(cacheData),
        );

        Toast.show({
          type: "success",
          text1: "Success",
          text2: "All links unrestricted successfully",
        });
      } catch (error) {
        console.error("Error caching unrestricted links:", error);
      }
    },
    onError: (error) => {
      console.error("Unrestrict error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
      });
    },
  });

  const handleUnrestrictAll = () => {
    if (!torrent?.links) return;

    Toast.show({
      type: "info",
      text1: "Info",
      text2: "Unrestricting all links...",
    });

    unrestrictMutation.mutate(torrent.links);
  };

  const handlePlay = useCallback((item: UnrestrictModel.UnrestrictedItem) => {
    // Media playback implementation will go here
    Toast.show({
      type: "info",
      text1: "Opening Media",
      text2: item.filename,
    });
  }, []);

  const updateDownloadProgress = (
    id: string,
    progress: number,
    status: "downloading" | "completed" | "error",
    filename: string,
  ) => {
    setDownloads((prev) => ({
      ...prev,
      [id]: { progress, status, filename },
    }));
  };

  const downloadFile = async (item: UnrestrictModel.UnrestrictedItem) => {
    const downloadId = Math.random().toString(36).substring(7);
    const filename = item.filename;
    const downloadUrl = item.download;

    // Create downloads directory if it doesn't exist
    const downloadDir = `${FileSystem.documentDirectory}downloads/`;
    await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });

    const fileUri = `${downloadDir}${filename}`;

    // Set up notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Download Started",
        body: `Downloading ${filename}`,
        data: { downloadId },
      },
      trigger: null,
    });

    // Initialize download progress
    updateDownloadProgress(downloadId, 0, "downloading", filename);

    try {
      const downloadResumable = FileSystem.createDownloadResumable(
        downloadUrl,
        fileUri,
        {},
        (downloadProgress) => {
          const progress =
            downloadProgress.totalBytesWritten /
            downloadProgress.totalBytesExpectedToWrite;
          updateDownloadProgress(downloadId, progress, "downloading", filename);

          // Update notification
          Notifications.scheduleNotificationAsync({
            content: {
              title: "Downloading",
              body: `${filename} - ${Math.round(progress * 100)}%`,
              data: { downloadId },
            },
            trigger: null,
          });
        },
      );

      const result = await downloadResumable.downloadAsync();

      if (result) {
        updateDownloadProgress(downloadId, 1, "completed", filename);
        // Show completion notification
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Download Complete",
            body: `${filename} has been downloaded`,
            data: { downloadId },
          },
          trigger: null,
        });
      }
    } catch (error) {
      console.error("Download error:", error);
      updateDownloadProgress(downloadId, 0, "error", filename);
      // Show error notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Download Failed",
          body: `Failed to download ${filename}`,
          data: { downloadId },
        },
        trigger: null,
      });
    }
  };

  // Update the handleDownload function
  const handleDownload = async (item: UnrestrictModel.UnrestrictedItem) => {
    console.log("DOWNLOADING");
    Toast.show({
      type: "info",
      text1: "Starting Download",
      text2: item.filename,
    });

    // Start download in background
    await BackgroundService.start(
      async () => {
        await downloadFile(item);
      },
      {
        taskName: "Download",
        taskTitle: `Downloading ${item.filename}`,
        taskDesc: "File download in progress",
        taskIcon: {
          name: "ic_launcher",
          type: "mipmap",
        },
        color: "#ff00ff",
        parameters: {
          filename: item.filename,
        },
      },
    );
  };
  const areAllLinksUnrestricted =
    torrent?.links.every((link) => unrestrictedLinks[link]) ?? false;

  if (isLoading || !torrent) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Torrent Details",
          headerTintColor: "#fff",
          headerStyle: {
            backgroundColor: colors.surface,
          },
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.filename}>{torrent.filename}</Text>
          <Text style={styles.details} variant="bodyMedium">
            Size: {(torrent.bytes / (1024 * 1024)).toFixed(2)} MB
          </Text>
          <Text style={styles.details} variant="bodyMedium">
            Status: {torrent.status}
          </Text>
          <Text style={styles.details} variant="bodyMedium">
            Progress: {torrent.progress}%
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.sectionTitle}>
                Links ({torrent.links.length})
              </Text>

              {!areAllLinksUnrestricted && (
                <Button
                  mode="contained"
                  onPress={handleUnrestrictAll}
                  loading={unrestrictMutation.isPending}
                  disabled={unrestrictMutation.isPending}
                >
                  Unrestrict All
                </Button>
              )}
            </View>

            <View style={styles.linksContainer}>
              {unrestrictMutation.isPending && <LoadingOverlay />}
              {torrent.links.map((link, index) => {
                const unrestrictedData = unrestrictedLinks[link];
                return (
                  <View
                    key={index}
                    style={[
                      styles.linkRow,
                      unrestrictMutation.isPending && styles.linkRowDisabled,
                    ]}
                  >
                    <Text style={styles.linkNumber}>#{index + 1}</Text>
                    <View style={styles.linkDetails}>
                      <Text style={styles.linkText} numberOfLines={1}>
                        {unrestrictedData?.filename || link}
                      </Text>
                      {unrestrictedData && (
                        <Text style={styles.linkInfoText}>
                          {(unrestrictedData.filesize / (1024 * 1024)).toFixed(
                            2,
                          )}{" "}
                          MB • {unrestrictedData.mimeType}
                        </Text>
                      )}
                    </View>
                    {unrestrictedData && (
                      <View style={styles.linkActions}>
                        {unrestrictedData.streamable === 1 && (
                          <IconButton
                            icon="play"
                            mode="outlined"
                            iconColor="#fff"
                            size={22}
                            style={styles.iconOnlyButton}
                            onPress={() => handlePlay(unrestrictedData)}
                          />
                        )}
                        <IconButton
                          icon={
                            downloads[unrestrictedData.id]?.status ===
                            "downloading"
                              ? "stop"
                              : "download"
                          }
                          mode="outlined"
                          iconColor="#fff"
                          size={22}
                          style={styles.iconOnlyButton}
                          onPress={() => handleDownload(unrestrictedData)}
                          disabled={
                            downloads[unrestrictedData.id]?.status ===
                            "downloading"
                          }
                        />
                        {downloads[unrestrictedData.id]?.status ===
                          "downloading" && (
                          <Text style={styles.downloadProgress}>
                            {Math.round(
                              downloads[unrestrictedData.id].progress * 100,
                            )}
                            %
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>
    </>
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
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
  },
  filename: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  details: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 4,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
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
  },
  linksContainer: {
    gap: 12,
    position: "relative",
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
  },
  linkRowDisabled: {
    opacity: 0.5,
  },
  linkNumber: {
    color: "#fff",
    fontSize: 12,
    marginRight: 12,
    opacity: 0.7,
    width: 30,
  },
  linkDetails: {
    flex: 1,
    marginRight: 12,
  },
  linkText: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 4,
  },
  linkInfoText: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.7,
  },
  linkActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconOnlyButton: {
    borderColor: "#fff",
    margin: 0,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    borderRadius: 8,
  },
  loadingText: {
    color: "#fff",
    marginTop: 16,
    fontSize: 16,
  },
  downloadProgress: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 8,
  },
});

import { api } from "@/api/methods";
import UnrestrictModel from "@/models/Unrestrict.model";
import { colors } from "@/theme/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import BackgroundService from "react-native-background-actions";
import RNFS from "react-native-fs";
import {
  ActivityIndicator,
  Button,
  IconButton,
  Text,
} from "react-native-paper";
import Toast from "react-native-toast-message";
import {
  requestNotificationPermission,
  requestStoragePermission,
} from "@/utils/deviceMethods";

interface DownloadProgress {
  [key: string]: {
    progress: number;
    status: "downloading" | "completed" | "error";
    filename: string;
  };
}

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
  const [activeDownloads, setActiveDownloads] = useState<number>(0);

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

    return () => {
      BackgroundService.stop();
    };
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

  const downloadTask = async (taskDataArguments: any) => {
    console.log("Background task started with args:", taskDataArguments);
    const { item } = taskDataArguments;

    try {
      const filename = item.filename;
      const downloadUrl = item.download;
      const notificationTaskName = `Download-${item.filename}`;

      let downloadNotificationOptions = {
        taskName: notificationTaskName,
        taskTitle: `Downloading ${item.filename}`,
        taskDesc: "Progress: 0%",
        color: "#ff00ff",
        progressBar: {
          max: 100,
          value: 0,
          indeterminate: false,
        },
      };
      await BackgroundService.updateNotification(downloadNotificationOptions);

      // Get the downloads directory path
      const downloadPath = RNFS.DownloadDirectoryPath + "/Kaizoku/" + filename;
      console.log("Download path:", downloadPath);

      // Ensure Kaizoku directory exists
      await RNFS.mkdir(RNFS.DownloadDirectoryPath + "/Kaizoku/");

      // Start download with progress tracking
      const { promise } = RNFS.downloadFile({
        fromUrl: downloadUrl,
        toFile: downloadPath,
        progress: async (response) => {
          const progress =
            (response.bytesWritten / response.contentLength) * 100;

          downloadNotificationOptions.progressBar.value = progress;
          downloadNotificationOptions.taskDesc = `Progress: ${progress}%`;
          await BackgroundService.updateNotification(
            downloadNotificationOptions,
          );

          // Update the downloads state
          setDownloads((prev) => ({
            ...prev,
            [item.id]: {
              progress,
              status: "downloading",
              filename,
            },
          }));
        },
        progressDivider: 1,
      });

      // Wait for download to complete
      const result = await promise;
      console.log("Download result:", result);

      if (result.statusCode === 200) {
        console.log("Download completed successfully");

        // Update downloads state to completed
        setDownloads((prev) => ({
          ...prev,
          [item.id]: {
            progress: 100,
            status: "completed",
            filename,
          },
        }));

        // Wait briefly to show completion
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        throw new Error(`Download failed with status ${result.statusCode}`);
      }
    } catch (error) {
      console.error("Download error:", error);

      // Update downloads state to error
      setDownloads((prev) => ({
        ...prev,
        [item.id]: {
          progress: 0,
          status: "error",
          filename: item.filename,
        },
      }));
    } finally {
      setActiveDownloads((prev) => {
        const newCount = prev - 1;
        if (newCount === 0) {
          BackgroundService.stop();
        }
        return newCount;
      });
    }
  };

  const handleDownload = async (item: UnrestrictModel.UnrestrictedItem) => {
    const hasStoragePermission = await requestStoragePermission();
    const hasNotificationPermission = await requestNotificationPermission();

    if (!hasStoragePermission && !hasNotificationPermission) {
      Toast.show({
        type: "error",
        text1: "Permission Required",
        text2: !hasStoragePermission
          ? "Storage permission is needed to download files"
          : "Notification permission is needed to show download progress",
      });
      return;
    }

    try {
      console.log("Starting background download for:", item.filename);

      const options = {
        taskName: "Download",
        taskTitle: `Downloading ${item.filename}`,
        taskDesc: "Starting download...",
        taskIcon: {
          name: "ic_launcher",
          type: "mipmap",
        },
        color: "#ff00ff",
        parameters: {
          item,
        },
        progressBar: {
          max: 100,
          value: 0,
          indeterminate: false,
        },
      };

      setActiveDownloads((prev) => prev + 1);

      // Initialize download state
      setDownloads((prev) => ({
        ...prev,
        [item.id]: {
          progress: 0,
          status: "downloading",
          filename: item.filename,
        },
      }));

      // Only start the service if it's not already running
      if (activeDownloads === 0) {
        await BackgroundService.start(downloadTask, options);
      } else {
        // If service is already running, just execute the task
        downloadTask({ item });
      }

      Toast.show({
        type: "success",
        text1: "Download Started",
        text2: item.filename,
      });
    } catch (error) {
      console.error("Failed to start download:", error);
      setActiveDownloads((prev) => prev - 1);
      setDownloads((prev) => ({
        ...prev,
        [item.id]: {
          progress: 0,
          status: "error",
          filename: item.filename,
        },
      }));
      Toast.show({
        type: "error",
        text1: "Download Failed",
        text2:
          error instanceof Error ? error.message : "Could not start download",
      });
    }
  };

  const areAllLinksUnrestricted =
    torrent?.links.every((link) => unrestrictedLinks[link]) ?? false;

  if (isLoading || !torrent) {
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
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </>
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
                        {downloads[unrestrictedData.id]?.status !==
                          "downloading" && (
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
                        )}
                        {downloads[unrestrictedData.id]?.status ===
                          "downloading" && (
                          <View style={styles.downloadProgressContainer}>
                            <Text style={styles.downloadProgress}>
                              {Math.round(
                                downloads[unrestrictedData.id]?.progress,
                              )}
                              %
                            </Text>
                          </View>
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
    backgroundColor: colors.background,
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
  downloadProgressContainer: {
    marginLeft: 0.5,
    borderRadius: 100,
    borderColor: "#fff",
    borderWidth: 1,
    height: 36,
    width: 36,
    display: "flex",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  downloadProgress: {
    color: "#fff",
    fontSize: 10,
  },
  warningContainer: {
    padding: 16,
    backgroundColor: colors.error,
    borderRadius: 8,
    marginBottom: 16,
  },
  warningText: {
    color: "#fff",
    marginBottom: 8,
  },
});

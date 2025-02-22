import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DownloadItem, DownloadStatus } from "./types";
import UnrestrictModel from "@/models/Unrestrict.model";

interface DownloadState {
  activeDownloads: Record<string, DownloadItem>;

  // Actions
  addDownload: (item: UnrestrictModel.UnrestrictedItem) => void;
  updateProgress: (id: string, progress: number) => void;
  updateStatus: (id: string, status: DownloadStatus, error?: string) => void;
  removeDownload: (id: string) => void;
  clearCompleted: () => void;
  clearAll: () => void;
}

export const useDownloadStore = create<DownloadState>()(
  persist(
    (set) => ({
      activeDownloads: {},

      addDownload: (item) =>
        set((state) => ({
          activeDownloads: {
            ...state.activeDownloads,
            [item.id]: {
              item,
              progress: 0,
              status: "queued",
            },
          },
        })),

      updateProgress: (id, progress) =>
        set((state) => ({
          activeDownloads: {
            ...state.activeDownloads,
            [id]: {
              ...state.activeDownloads[id],
              progress,
            },
          },
        })),

      updateStatus: (id, status, error) =>
        set((state) => ({
          activeDownloads: {
            ...state.activeDownloads,
            [id]: {
              ...state.activeDownloads[id],
              status,
              ...(error && { error }),
            },
          },
        })),

      removeDownload: (id) =>
        set((state) => {
          const { [id]: _, ...rest } = state.activeDownloads;
          return { activeDownloads: rest };
        }),

      clearCompleted: () =>
        set((state) => ({
          activeDownloads: Object.entries(state.activeDownloads)
            .filter(([_, download]) => download.status !== "completed")
            .reduce(
              (acc, [id, download]) => ({
                ...acc,
                [id]: download,
              }),
              {},
            ),
        })),

      clearAll: () => set({ activeDownloads: {} }),
    }),
    {
      name: "download-storage",
      partialize: (state) => ({
        activeDownloads: Object.entries(state.activeDownloads)
          .filter(([_, download]) => download.status === "completed")
          .reduce(
            (acc, [id, download]) => ({
              ...acc,
              [id]: download,
            }),
            {},
          ),
      }),
    },
  ),
);

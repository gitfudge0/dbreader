import { create } from "zustand";
import { persist } from "zustand/middleware";
import UnrestrictModel from "@/models/Unrestrict.model";
import TorrentModel from "@/models/Torrents.model";

interface TorrentState {
  selectedTorrent: TorrentModel.TorrentItem | null;
  unrestrictedLinks: Record<string, UnrestrictModel.UnrestrictedItem[]>;

  // Actions
  setSelectedTorrent: (torrent: TorrentModel.TorrentItem | null) => void;
  cacheUnrestrictedLinks: (
    torrentId: string,
    links: UnrestrictModel.UnrestrictedItem[],
  ) => void;
  clearUnrestrictedLinks: (torrentId: string) => void;
  clearAll: () => void;
}

export const useTorrentStore = create<TorrentState>()(
  persist(
    (set) => ({
      selectedTorrent: null,
      unrestrictedLinks: {},

      setSelectedTorrent: (torrent) => set({ selectedTorrent: torrent }),

      cacheUnrestrictedLinks: (torrentId, links) =>
        set((state) => ({
          unrestrictedLinks: {
            ...state.unrestrictedLinks,
            [torrentId]: links,
          },
        })),

      clearUnrestrictedLinks: (torrentId) =>
        set((state) => {
          const { [torrentId]: _, ...rest } = state.unrestrictedLinks;
          return { unrestrictedLinks: rest };
        }),

      clearAll: () => set({ selectedTorrent: null, unrestrictedLinks: {} }),
    }),
    {
      name: "torrent-storage",
      partialize: (state) => ({
        unrestrictedLinks: state.unrestrictedLinks,
      }),
    },
  ),
);

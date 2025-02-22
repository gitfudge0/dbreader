import { create } from "zustand";
import { MediaItem, PlaybackStatus } from "./types";

interface MediaState {
  currentMedia: MediaItem | null;
  playbackStatus: PlaybackStatus;
  castSession: boolean;
  queue: MediaItem[];

  // Actions
  setCurrentMedia: (media: MediaItem | null) => void;
  updatePlaybackStatus: (status: PlaybackStatus) => void;
  setCastSession: (active: boolean) => void;
  updateProgress: (progress: number) => void;
  updatePosition: (position: number) => void;
  addToQueue: (media: MediaItem) => void;
  removeFromQueue: (mediaId: string) => void;
  clearQueue: () => void;
}

export const useMediaStore = create<MediaState>()((set) => ({
  currentMedia: null,
  playbackStatus: "idle",
  castSession: false,
  queue: [],

  setCurrentMedia: (media) =>
    set({ currentMedia: media, playbackStatus: "loading" }),

  updatePlaybackStatus: (status) => set({ playbackStatus: status }),

  setCastSession: (active) => set({ castSession: active }),

  updateProgress: (progress) =>
    set((state) => ({
      currentMedia: state.currentMedia
        ? { ...state.currentMedia, progress }
        : null,
    })),

  updatePosition: (position) =>
    set((state) => ({
      currentMedia: state.currentMedia
        ? { ...state.currentMedia, position }
        : null,
    })),

  addToQueue: (media) =>
    set((state) => ({
      queue: [...state.queue, media],
    })),

  removeFromQueue: (mediaId) =>
    set((state) => ({
      queue: state.queue.filter((item) => item.item.id !== mediaId),
    })),

  clearQueue: () => set({ queue: [] }),
}));

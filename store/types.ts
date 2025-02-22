import UnrestrictModel from "@/models/Unrestrict.model";

export type PlaybackStatus =
  | "idle"
  | "loading"
  | "playing"
  | "paused"
  | "error";
export type DownloadStatus =
  | "queued"
  | "downloading"
  | "paused"
  | "completed"
  | "error";

export interface DownloadItem {
  item: UnrestrictModel.UnrestrictedItem;
  progress: number;
  status: DownloadStatus;
  error?: string;
}

export interface MediaItem {
  item: UnrestrictModel.UnrestrictedItem;
  progress: number;
  duration?: number;
  position?: number;
}

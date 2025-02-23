import TorrentModel from "@/models/Torrents.model";
import { axiosInstance } from "./client";
import UnrestrictModel from "@/models/Unrestrict.model";
import DownloadsModel from "@/models/Downloads.model";

export const api = {
  // Torrents
  getTorrents: async (): Promise<TorrentModel.TorrentListApi> => {
    const { data } =
      await axiosInstance.get<TorrentModel.TorrentListApi>("/torrents");
    return data;
  },

  getTorrentInfo: async (id: string): Promise<TorrentModel.InfoApi> => {
    const { data } = await axiosInstance.get<TorrentModel.InfoApi>(
      `/torrents/info/${id}`,
    );
    return data;
  },

  addMagnet: async (magnet: string): Promise<TorrentModel.TorrentItem> => {
    const { data } = await axiosInstance.post<TorrentModel.TorrentItem>(
      "/torrents/addMagnet",
      {
        magnet,
      },
    );
    return data;
  },

  selectFiles: async (id: string, files: string): Promise<void> => {
    await axiosInstance.post(`/torrents/selectFiles/${id}`, {
      files,
    });
  },

  deleteTorrent: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/torrents/delete/${id}`);
  },

  // Unrestrict
  unrestrictLink: async (
    link: string,
  ): Promise<UnrestrictModel.UnrestrictedItem> => {
    const { data } = await axiosInstance.post<UnrestrictModel.UnrestrictedItem>(
      "/unrestrict/link",
      {
        link,
      },
    );
    return data;
  },

  unrestrictFolder: async (link: string): Promise<any> => {
    const { data } = await axiosInstance.post("/unrestrict/folder", {
      link,
    });
    return data;
  },

  checkLink: async (link: string): Promise<any> => {
    const { data } = await axiosInstance.get("/unrestrict/check", {
      params: { link },
    });
    return data;
  },

  getMediaInfo: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.get(`/streaming/mediaInfos/${id}`);
    return data;
  },

  // Downloads
  getDownloads: async (): Promise<DownloadsModel.DownloadsListApi> => {
    const { data } =
      await axiosInstance.get<DownloadsModel.DownloadsListApi>("/downloads");
    return data;
  },

  getDownloadInfo: async (id: string): Promise<DownloadsModel.DownloadItem> => {
    const { data } = await axiosInstance.get<DownloadsModel.DownloadItem>(
      `/downloads/info/${id}`,
    );
    return data;
  },

  deleteDownload: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/downloads/delete/${id}`);
  },
};

export type Api = typeof api;

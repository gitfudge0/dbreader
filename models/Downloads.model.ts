namespace DownloadsModel {
  export type DownloadsListApi = DownloadItem[];

  export interface DownloadItem {
    id: string;
    filename: string;
    mimeType?: string;
    filesize: number;
    link: string;
    host: string;
    host_icon: string;
    chunks: number;
    download: string;
    streamable: number;
    generated: string;
  }
}

export default DownloadsModel;

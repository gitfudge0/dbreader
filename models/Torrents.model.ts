namespace TorrentModel {
  export type TorrentListApi = TorrentItem[];

  export interface TorrentItem {
    id: string;
    filename: string;
    hash: string;
    bytes: number;
    host: string;
    split: number;
    progress: number;
    status: string;
    added: string;
    links: string[];
    ended: string;
  }

  export interface InfoApi {
    id: string;
    filename: string;
    original_filename: string;
    hash: string;
    bytes: number;
    original_bytes: number;
    host: string;
    split: number;
    progress: number;
    status: string;
    added: string;
    files: InfoFile[];
    links: any[];
  }

  export interface InfoFile {
    id: number;
    path: string;
    bytes: number;
    selected: number;
  }

  export interface MagnetApi {
    id: string;
    uri: string;
  }
}

export default TorrentModel;

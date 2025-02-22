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
}

export default TorrentModel;

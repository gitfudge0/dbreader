namespace UnrestrictModel {
  export interface UnrestrictedItem {
    id: string;
    filename: string;
    mimeType: string;
    filesize: number;
    link: string;
    host: string;
    host_icon: string;
    chunks: number;
    crc: number;
    download: string;
    streamable: number;
  }
}

export default UnrestrictModel;

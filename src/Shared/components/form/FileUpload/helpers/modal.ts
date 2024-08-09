export interface Files {
  createdAt?: string;
  fileName?: string;
  fileURL?: string;
  url?: string;
  updatedAt?: string;
  _id?: string;
}

export interface FileData {
  file: File;
  src: string | ArrayBuffer | null | undefined;
}

import type { HTMLAttributes } from "react";

export type UploadStatus = "ready" | "uploading" | "done" | "error";
export type UploadListType = "text" | "picture";

export interface NeoUploadFile {
  uid: string;
  name: string;
  size: number;
  type: string;
  status: UploadStatus;
  percent: number;
  rawFile: File;
  url?: string;
  response?: unknown;
  error?: string;
}

export interface UploadRequestOptions {
  file: File;
  onProgress: (percent: number) => void;
  onSuccess: (response?: unknown) => void;
  onError: (error: string) => void;
}

export type UploadRequestResult = void | (() => void) | { abort: () => void };
export type UploadRequest = (options: UploadRequestOptions) => UploadRequestResult;
export type BeforeUpload = (file: File) => boolean | Promise<boolean>;

export interface UploadProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  fileList?: NeoUploadFile[];
  defaultFileList?: NeoUploadFile[];
  onChange?: (nextFileList: NeoUploadFile[]) => void;
  beforeUpload?: BeforeUpload;
  customRequest?: UploadRequest;
  onRemove?: (file: NeoUploadFile, nextFileList: NeoUploadFile[]) => void;
  onRetry?: (file: NeoUploadFile) => void;
  multiple?: boolean;
  accept?: string;
  maxCount?: number;
  listType?: UploadListType;
  draggable?: boolean;
  disabled?: boolean;
  maxSizeMB?: number;
}

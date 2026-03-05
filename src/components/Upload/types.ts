import type { DragEvent, HTMLAttributes } from "react";

export type UploadMethod = "POST" | "PUT" | "PATCH";
export type UploadStatus = "ready" | "uploading" | "done" | "error";
export type UploadListType =
  | "text"
  | "picture"
  | "picture-card"
  | "picture-circle";
export type UploadRejectReason = "accept" | "size" | "maxCount" | "beforeUpload";
export type UploadData = Record<string, unknown>;
export type BeforeUpload = (file: File) => boolean | Promise<boolean>;

export interface NeoUploadFile {
  uid: string;
  name: string;
  size: number;
  type: string;
  status: UploadStatus;
  rawFile: File;
  percent: number;
  url?: string;
  thumbUrl?: string;
  response?: unknown;
  error?: string;
  xhr?: XMLHttpRequest | null;
}

export interface UploadRequestOptions {
  file: File;
  action: string;
  filename: string;
  method: UploadMethod;
  data?: UploadData;
  headers?: Record<string, string>;
  withCredentials?: boolean;
  timeout?: number;
  onProgress: (percent: number) => void;
  onSuccess: (response?: unknown) => void;
  onError: (error: string) => void;
}

export interface UploadRequestHandle {
  abort: () => void;
  xhr?: XMLHttpRequest | null;
}

export interface UploadRef {
  open: () => void;
}

export interface UploadProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "onDrop"> {
  fileList?: NeoUploadFile[];
  defaultFileList?: NeoUploadFile[];
  onChange?: (nextFileList: NeoUploadFile[]) => void;
  beforeUpload?: BeforeUpload;
  action: string;
  method?: UploadMethod;
  name?: string;
  data?: UploadData;
  headers?: Record<string, string>;
  withCredentials?: boolean;
  timeout?: number;
  onRemove?: (file: NeoUploadFile, nextFileList: NeoUploadFile[]) => void;
  onRetry?: (file: NeoUploadFile) => void;
  onPreview?: (file: NeoUploadFile) => void;
  onExceed?: (incomingFiles: File[], currentFileList: NeoUploadFile[]) => void;
  onFileReject?: (
    file: File,
    reason: UploadRejectReason,
    message: string,
  ) => void;
  onDrop?: (files: File[], event: DragEvent<HTMLDivElement>) => void;
  previewFile?: (file: File) => Promise<string>;
  multiple?: boolean;
  accept?: string;
  maxCount?: number;
  listType?: UploadListType;
  draggable?: boolean;
  disabled?: boolean;
  maxSizeMB?: number;
  ariaLabel?: string;
}

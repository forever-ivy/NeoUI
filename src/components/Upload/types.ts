import type { HTMLAttributes, ReactNode } from "react";

export type UploadStatus = "ready" | "uploading" | "done" | "error";
export type UploadListType = "text" | "picture";
export type UploadRejectReason = "accept" | "size" | "maxCount" | "beforeUpload";

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

export interface UploadActions {
  remove: () => void;
  retry: () => void;
  abort: () => void;
  preview: () => void;
}

export interface UploadRef {
  open: () => void;
  abort: (uid?: string) => void;
  clear: () => void;
}

export interface UploadProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "onAbort"> {
  fileList?: NeoUploadFile[];
  defaultFileList?: NeoUploadFile[];
  onChange?: (nextFileList: NeoUploadFile[]) => void;
  beforeUpload?: BeforeUpload;
  customRequest?: UploadRequest;
  onRemove?: (file: NeoUploadFile, nextFileList: NeoUploadFile[]) => void;
  onRetry?: (file: NeoUploadFile) => void;
  onAbort?: (file: NeoUploadFile) => void;
  onPreview?: (file: NeoUploadFile) => void;
  onExceed?: (incomingFiles: File[], currentFileList: NeoUploadFile[]) => void;
  onFileReject?: (
    file: File,
    reason: UploadRejectReason,
    message: string,
  ) => void;
  itemRender?: (
    file: NeoUploadFile,
    defaultNode: ReactNode,
    actions: UploadActions,
  ) => ReactNode;
  multiple?: boolean;
  accept?: string;
  maxCount?: number;
  listType?: UploadListType;
  draggable?: boolean;
  disabled?: boolean;
  maxSizeMB?: number;
  ariaLabel?: string;
}

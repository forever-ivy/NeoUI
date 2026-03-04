import { useCallback, useEffect, useRef } from "react";
import type {
  BeforeUpload,
  NeoUploadFile,
  UploadRequest,
  UploadRequestOptions,
} from "../components/Upload/types";

interface UseUploadQueueParams {
  fileList: NeoUploadFile[];
  setFileList: (updater: React.SetStateAction<NeoUploadFile[]>) => void;
  beforeUpload?: BeforeUpload;
  customRequest?: UploadRequest;
  disabled?: boolean;
  maxCount?: number;
  maxSizeMB?: number;
}

interface RemoveFileResult {
  removedFile?: NeoUploadFile;
  nextFileList: NeoUploadFile[];
}

interface UseUploadQueueResult {
  queueFiles: (selectedFiles: File[]) => Promise<void>;
  removeFile: (uid: string) => RemoveFileResult;
  retryFile: (uid: string) => NeoUploadFile | undefined;
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

function createUid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeUploadError(error: unknown) {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return "Upload failed";
}

function createPreviewUrl(file: File) {
  if (!file.type.startsWith("image/")) return undefined;
  return URL.createObjectURL(file);
}

function revokePreviewUrl(url?: string) {
  if (url && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

function defaultRequest(options: UploadRequestOptions): () => void {
  let progress = 0;
  const intervalId = window.setInterval(() => {
    progress += 12 + Math.random() * 20;
    if (progress >= 100) {
      window.clearInterval(intervalId);
      options.onProgress(100);
      window.setTimeout(() => {
        options.onSuccess({ ok: true });
      }, 180);
      return;
    }
    options.onProgress(progress);
  }, 220);

  return () => {
    window.clearInterval(intervalId);
  };
}

export function useUploadQueue({
  fileList,
  setFileList,
  beforeUpload,
  customRequest,
  disabled,
  maxCount,
  maxSizeMB,
}: UseUploadQueueParams): UseUploadQueueResult {
  const fileListRef = useRef(fileList);
  const abortMapRef = useRef<Record<string, () => void>>({});

  useEffect(() => {
    fileListRef.current = fileList;
  }, [fileList]);

  useEffect(() => {
    return () => {
      Object.values(abortMapRef.current).forEach((abort) => abort());
      abortMapRef.current = {};
      fileListRef.current.forEach((item) => revokePreviewUrl(item.url));
    };
  }, []);

  const applyFileList = useCallback(
    (updater: React.SetStateAction<NeoUploadFile[]>) => {
      const nextValue =
        typeof updater === "function"
          ? (updater as (prev: NeoUploadFile[]) => NeoUploadFile[])(
              fileListRef.current,
            )
          : updater;
      fileListRef.current = nextValue;
      setFileList(nextValue);
      return nextValue;
    },
    [setFileList],
  );

  const updateFileByUid = useCallback(
    (uid: string, patcher: (file: NeoUploadFile) => NeoUploadFile) => {
      applyFileList((prev) =>
        prev.map((item) => (item.uid === uid ? patcher(item) : item)),
      );
    },
    [applyFileList],
  );

  const startUpload = useCallback(
    (targetFile: NeoUploadFile) => {
      abortMapRef.current[targetFile.uid]?.();
      delete abortMapRef.current[targetFile.uid];

      updateFileByUid(targetFile.uid, (item) => ({
        ...item,
        status: "uploading",
        percent: 0,
        error: undefined,
      }));

      const request = customRequest ?? defaultRequest;
      const requestResult = request({
        file: targetFile.rawFile,
        onProgress: (percent) => {
          updateFileByUid(targetFile.uid, (item) => ({
            ...item,
            status: "uploading",
            percent: clampPercent(percent),
          }));
        },
        onSuccess: (response) => {
          delete abortMapRef.current[targetFile.uid];
          updateFileByUid(targetFile.uid, (item) => ({
            ...item,
            status: "done",
            percent: 100,
            response,
            error: undefined,
          }));
        },
        onError: (error) => {
          delete abortMapRef.current[targetFile.uid];
          updateFileByUid(targetFile.uid, (item) => ({
            ...item,
            status: "error",
            error,
          }));
        },
      });

      if (typeof requestResult === "function") {
        abortMapRef.current[targetFile.uid] = requestResult;
      } else if (requestResult && typeof requestResult.abort === "function") {
        abortMapRef.current[targetFile.uid] = requestResult.abort;
      }
    },
    [customRequest, updateFileByUid],
  );

  const queueFiles = useCallback(
    async (selectedFiles: File[]) => {
      if (disabled || selectedFiles.length === 0) return;

      for (const candidate of selectedFiles) {
        if (
          typeof maxCount === "number" &&
          fileListRef.current.length >= maxCount
        ) {
          break;
        }

        if (
          typeof maxSizeMB === "number" &&
          candidate.size > maxSizeMB * 1024 * 1024
        ) {
          const rejectedFile: NeoUploadFile = {
            uid: createUid(),
            name: candidate.name,
            size: candidate.size,
            type: candidate.type,
            rawFile: candidate,
            status: "error",
            percent: 0,
            url: createPreviewUrl(candidate),
            error: `File is larger than ${maxSizeMB}MB`,
          };
          applyFileList((prev) => [...prev, rejectedFile]);
          continue;
        }

        if (beforeUpload) {
          try {
            const allowed = await beforeUpload(candidate);
            if (!allowed) {
              continue;
            }
          } catch (error) {
            const rejectedFile: NeoUploadFile = {
              uid: createUid(),
              name: candidate.name,
              size: candidate.size,
              type: candidate.type,
              rawFile: candidate,
              status: "error",
              percent: 0,
              url: createPreviewUrl(candidate),
              error: normalizeUploadError(error),
            };
            applyFileList((prev) => [...prev, rejectedFile]);
            continue;
          }
        }

        const nextFile: NeoUploadFile = {
          uid: createUid(),
          name: candidate.name,
          size: candidate.size,
          type: candidate.type,
          rawFile: candidate,
          status: "ready",
          percent: 0,
          url: createPreviewUrl(candidate),
        };

        applyFileList((prev) => [...prev, nextFile]);
        startUpload(nextFile);
      }
    },
    [applyFileList, beforeUpload, disabled, maxCount, maxSizeMB, startUpload],
  );

  const removeFile = useCallback(
    (uid: string) => {
      abortMapRef.current[uid]?.();
      delete abortMapRef.current[uid];

      let removedFile: NeoUploadFile | undefined;
      const nextFileList = applyFileList((prev) => {
        removedFile = prev.find((item) => item.uid === uid);
        return prev.filter((item) => item.uid !== uid);
      });

      if (removedFile) {
        revokePreviewUrl(removedFile.url);
      }

      return { removedFile, nextFileList };
    },
    [applyFileList],
  );

  const retryFile = useCallback(
    (uid: string) => {
      const targetFile = fileListRef.current.find((item) => item.uid === uid);
      if (!targetFile) return undefined;
      startUpload(targetFile);
      return targetFile;
    },
    [startUpload],
  );

  return {
    queueFiles,
    removeFile,
    retryFile,
  };
}

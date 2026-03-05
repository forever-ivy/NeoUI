import { useCallback, useEffect, useRef } from "react";
import type {
  BeforeUpload,
  NeoUploadFile,
  UploadRejectReason,
  UploadRequest,
  UploadRequestOptions,
} from "../components/Upload/types";

interface UseUploadQueueParams {
  fileList: NeoUploadFile[];
  setFileList: (updater: React.SetStateAction<NeoUploadFile[]>) => void;
  beforeUpload?: BeforeUpload;
  customRequest?: UploadRequest;
  accept?: string;
  disabled?: boolean;
  maxCount?: number;
  maxSizeMB?: number;
  onExceed?: (incomingFiles: File[], currentFileList: NeoUploadFile[]) => void;
  onFileReject?: (
    file: File,
    reason: UploadRejectReason,
    message: string,
  ) => void;
}

interface RemoveFileResult {
  removedFile?: NeoUploadFile;
  nextFileList: NeoUploadFile[];
}

interface UseUploadQueueResult {
  queueFiles: (selectedFiles: File[]) => Promise<void>;
  removeFile: (uid: string) => RemoveFileResult;
  retryFile: (uid: string) => NeoUploadFile | undefined;
  abortFile: (uid: string) => NeoUploadFile | undefined;
  abortAll: () => NeoUploadFile[];
  clearAll: () => NeoUploadFile[];
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

function isBlobUrl(url?: string): url is string {
  return typeof url === "string" && url.startsWith("blob:");
}

function collectBlobUrls(fileList: NeoUploadFile[]) {
  const blobUrls = new Set<string>();
  fileList.forEach((item) => {
    if (isBlobUrl(item.url)) {
      blobUrls.add(item.url);
    }
  });
  return blobUrls;
}

function revokePreviewUrl(url?: string) {
  if (isBlobUrl(url)) {
    URL.revokeObjectURL(url);
  }
}

function matchAcceptRule(file: File, acceptRule: string) {
  const lowerRule = acceptRule.toLowerCase();
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  if (lowerRule.startsWith(".")) {
    return fileName.endsWith(lowerRule);
  }

  if (lowerRule.endsWith("/*")) {
    const typePrefix = lowerRule.slice(0, -1);
    return fileType.startsWith(typePrefix);
  }

  return fileType === lowerRule;
}

function isFileAccepted(file: File, accept?: string) {
  if (!accept || accept.trim() === "") {
    return true;
  }

  const acceptRules = accept
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (acceptRules.length === 0) {
    return true;
  }

  return acceptRules.some((rule) => matchAcceptRule(file, rule));
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
  accept,
  disabled,
  maxCount,
  maxSizeMB,
  onExceed,
  onFileReject,
}: UseUploadQueueParams): UseUploadQueueResult {
  const fileListRef = useRef(fileList);
  const abortMapRef = useRef<Record<string, () => void>>({});
  const blobUrlSetRef = useRef<Set<string>>(collectBlobUrls(fileList));

  useEffect(() => {
    const prevBlobUrls = blobUrlSetRef.current;
    const nextBlobUrls = collectBlobUrls(fileList);
    prevBlobUrls.forEach((url) => {
      if (!nextBlobUrls.has(url)) {
        revokePreviewUrl(url);
      }
    });
    blobUrlSetRef.current = nextBlobUrls;
    fileListRef.current = fileList;
  }, [fileList]);

  useEffect(() => {
    return () => {
      Object.values(abortMapRef.current).forEach((abort) => abort());
      abortMapRef.current = {};
      blobUrlSetRef.current.forEach((url) => revokePreviewUrl(url));
      blobUrlSetRef.current = new Set();
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

  const rejectFile = useCallback(
    (file: File, reason: UploadRejectReason, message: string) => {
      onFileReject?.(file, reason, message);
    },
    [onFileReject],
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
      let requestResult: ReturnType<UploadRequest>;
      try {
        requestResult = request({
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
      } catch (error) {
        updateFileByUid(targetFile.uid, (item) => ({
          ...item,
          status: "error",
          error: normalizeUploadError(error),
        }));
        return;
      }

      if (typeof requestResult === "function") {
        abortMapRef.current[targetFile.uid] = requestResult;
      } else if (requestResult && typeof requestResult.abort === "function") {
        abortMapRef.current[targetFile.uid] = requestResult.abort;
      }
    },
    [customRequest, updateFileByUid],
  );

  const abortFile = useCallback(
    (uid: string) => {
      const targetFile = fileListRef.current.find((item) => item.uid === uid);
      if (!targetFile || targetFile.status !== "uploading") {
        return undefined;
      }

      abortMapRef.current[uid]?.();
      delete abortMapRef.current[uid];
      updateFileByUid(uid, (item) => ({
        ...item,
        status: "error",
        error: "Upload canceled",
      }));

      return targetFile;
    },
    [updateFileByUid],
  );

  const abortAll = useCallback(() => {
    const uploadingIds = fileListRef.current
      .filter((item) => item.status === "uploading")
      .map((item) => item.uid);
    const abortedFiles: NeoUploadFile[] = [];

    uploadingIds.forEach((uid) => {
      const aborted = abortFile(uid);
      if (aborted) {
        abortedFiles.push(aborted);
      }
    });

    return abortedFiles;
  }, [abortFile]);

  const clearAll = useCallback(() => {
    abortAll();
    const currentFileList = [...fileListRef.current];
    applyFileList([]);
    return currentFileList;
  }, [abortAll, applyFileList]);

  const queueFiles = useCallback(
    async (selectedFiles: File[]) => {
      if (disabled || selectedFiles.length === 0) return;
      const initialFileList = [...fileListRef.current];
      const exceededFiles: File[] = [];
      let remainingSlots =
        typeof maxCount === "number"
          ? Math.max(0, maxCount - initialFileList.length)
          : Number.POSITIVE_INFINITY;

      for (const candidate of selectedFiles) {
        if (remainingSlots <= 0) {
          exceededFiles.push(candidate);
          continue;
        }

        if (!isFileAccepted(candidate, accept)) {
          rejectFile(
            candidate,
            "accept",
            `File type is not allowed. Accepts: ${accept}`,
          );
          continue;
        }

        if (
          typeof maxSizeMB === "number" &&
          candidate.size > maxSizeMB * 1024 * 1024
        ) {
          rejectFile(
            candidate,
            "size",
            `File is larger than ${maxSizeMB}MB`,
          );
          continue;
        }

        if (beforeUpload) {
          try {
            const allowed = await beforeUpload(candidate);
            if (!allowed) {
              rejectFile(
                candidate,
                "beforeUpload",
                "Rejected by beforeUpload",
              );
              continue;
            }
          } catch (error) {
            rejectFile(
              candidate,
              "beforeUpload",
              normalizeUploadError(error),
            );
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
        remainingSlots -= 1;
        startUpload(nextFile);
      }

      if (exceededFiles.length > 0) {
        onExceed?.(exceededFiles, initialFileList);
        exceededFiles.forEach((file) => {
          rejectFile(file, "maxCount", "Maximum file count exceeded");
        });
      }
    },
    [
      accept,
      applyFileList,
      beforeUpload,
      disabled,
      maxCount,
      maxSizeMB,
      onExceed,
      rejectFile,
      startUpload,
    ],
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
    abortFile,
    abortAll,
    clearAll,
  };
}

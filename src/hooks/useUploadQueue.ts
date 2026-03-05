import { useCallback, useEffect, useRef } from "react";
import { xhrUploadRequest } from "../components/Upload/request";
import type {
  BeforeUpload,
  NeoUploadFile,
  UploadData,
  UploadMethod,
  UploadRejectReason,
  UploadRequestHandle,
} from "../components/Upload/types";
import {
  clampPercent,
  collectBlobUrls,
  createThumbUrl,
  createUid,
  isBlobUrl,
  isFileAccepted,
  normalizeUploadError,
  revokeBlobUrl,
} from "../components/Upload/utils";

interface UseUploadQueueParams {
  fileList: NeoUploadFile[];
  setFileList: (updater: React.SetStateAction<NeoUploadFile[]>) => void;
  beforeUpload?: BeforeUpload;
  action: string;
  method?: UploadMethod;
  name?: string;
  data?: UploadData;
  headers?: Record<string, string>;
  withCredentials?: boolean;
  timeout?: number;
  previewFile?: (file: File) => Promise<string>;
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
}

export function useUploadQueue({
  fileList,
  setFileList,
  beforeUpload,
  action,
  method = "POST",
  name = "file",
  data,
  headers,
  withCredentials,
  timeout,
  previewFile,
  accept,
  disabled,
  maxCount,
  maxSizeMB,
  onExceed,
  onFileReject,
}: UseUploadQueueParams): UseUploadQueueResult {
  const fileListRef = useRef(fileList);
  const abortMapRef = useRef<Record<string, UploadRequestHandle>>({});
  const blobUrlSetRef = useRef<Set<string>>(collectBlobUrls(fileList));

  useEffect(() => {
    const prevBlobUrls = blobUrlSetRef.current;
    const nextBlobUrls = collectBlobUrls(fileList);
    prevBlobUrls.forEach((url) => {
      if (!nextBlobUrls.has(url)) {
        revokeBlobUrl(url);
      }
    });
    blobUrlSetRef.current = nextBlobUrls;
    fileListRef.current = fileList;
  }, [fileList]);

  useEffect(() => {
    return () => {
      Object.values(abortMapRef.current).forEach((handle) => handle.abort());
      abortMapRef.current = {};
      blobUrlSetRef.current.forEach((url) => revokeBlobUrl(url));
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
      const latestFile =
        fileListRef.current.find((item) => item.uid === targetFile.uid) ??
        targetFile;

      abortMapRef.current[latestFile.uid]?.abort();
      delete abortMapRef.current[latestFile.uid];

      updateFileByUid(latestFile.uid, (item) => ({
        ...item,
        status: "uploading",
        percent: 0,
        error: undefined,
        response: undefined,
        xhr: null,
      }));

      const requestTask = async () => {
        const requestHandle = xhrUploadRequest({
          file: latestFile.rawFile,
          action,
          filename: name,
          method,
          data,
          headers,
          withCredentials,
          timeout,
          onProgress: (percent) => {
            updateFileByUid(latestFile.uid, (item) => ({
              ...item,
              status: "uploading",
              percent: clampPercent(percent),
            }));
          },
          onSuccess: (response) => {
            delete abortMapRef.current[latestFile.uid];
            updateFileByUid(latestFile.uid, (item) => ({
              ...item,
              status: "done",
              percent: 100,
              response,
              error: undefined,
              xhr: null,
            }));
          },
          onError: (error) => {
            delete abortMapRef.current[latestFile.uid];
            updateFileByUid(latestFile.uid, (item) => ({
              ...item,
              status: "error",
              error: error || "Upload failed",
              xhr: null,
            }));
          },
        });

        abortMapRef.current[latestFile.uid] = requestHandle;
        if (requestHandle.xhr) {
          updateFileByUid(latestFile.uid, (item) => ({
            ...item,
            xhr: requestHandle.xhr ?? null,
          }));
        }
      };

      void requestTask().catch((error) => {
        delete abortMapRef.current[latestFile.uid];
        updateFileByUid(latestFile.uid, (item) => ({
          ...item,
          status: "error",
          error: normalizeUploadError(error),
          xhr: null,
        }));
      });
    },
    [
      action,
      data,
      headers,
      method,
      name,
      timeout,
      updateFileByUid,
      withCredentials,
    ],
  );

  const queueFiles = useCallback(
    async (selectedFiles: File[]) => {
      if (disabled || selectedFiles.length === 0) return;

      const currentFileList = [...fileListRef.current];
      let acceptedCandidates = selectedFiles;

      if (typeof maxCount === "number") {
        const remainingSlots = Math.max(0, maxCount - currentFileList.length);
        acceptedCandidates = selectedFiles.slice(0, remainingSlots);
        const exceededFiles = selectedFiles.slice(remainingSlots);
        if (exceededFiles.length > 0) {
          onExceed?.(exceededFiles, currentFileList);
          exceededFiles.forEach((file) => {
            rejectFile(file, "maxCount", "Maximum file count exceeded");
          });
        }
      }

      for (const candidate of acceptedCandidates) {
        if (!isFileAccepted(candidate, accept)) {
          rejectFile(
            candidate,
            "accept",
            `File type is not allowed. Accepts: ${accept ?? ""}`,
          );
          continue;
        }

        if (
          typeof maxSizeMB === "number" &&
          candidate.size > maxSizeMB * 1024 * 1024
        ) {
          rejectFile(candidate, "size", `File is larger than ${maxSizeMB}MB`);
          continue;
        }

        if (beforeUpload) {
          try {
            const allowed = await beforeUpload(candidate);
            if (!allowed) {
              rejectFile(candidate, "beforeUpload", "Rejected by beforeUpload");
              continue;
            }
          } catch (error) {
            rejectFile(candidate, "beforeUpload", normalizeUploadError(error));
            continue;
          }
        }

        const thumbUrl = createThumbUrl(candidate);
        const nextFile: NeoUploadFile = {
          uid: createUid(),
          name: candidate.name,
          size: candidate.size,
          type: candidate.type,
          rawFile: candidate,
          status: "ready",
          percent: 0,
          url: thumbUrl,
          thumbUrl,
          xhr: null,
        };

        applyFileList((prev) => [...prev, nextFile]);

        if (previewFile) {
          void previewFile(candidate)
            .then((previewUrl) => {
              if (!previewUrl) return;
              updateFileByUid(nextFile.uid, (item) => {
                const canReplaceUrl = !item.url || isBlobUrl(item.url);
                return {
                  ...item,
                  thumbUrl: previewUrl,
                  url: canReplaceUrl ? previewUrl : item.url,
                };
              });
            })
            .catch(() => {
              // Ignore preview generation errors to keep upload flow stable.
            });
        }

        startUpload(nextFile);
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
      previewFile,
      rejectFile,
      startUpload,
      updateFileByUid,
    ],
  );

  const removeFile = useCallback(
    (uid: string) => {
      const targetFile = fileListRef.current.find((item) => item.uid === uid);
      if (targetFile?.status === "uploading") {
        abortMapRef.current[uid]?.abort();
        delete abortMapRef.current[uid];
      }

      let removedFile: NeoUploadFile | undefined;
      const nextFileList = applyFileList((prev) => {
        removedFile = prev.find((item) => item.uid === uid);
        return prev.filter((item) => item.uid !== uid);
      });

      if (removedFile) {
        removedFile = { ...removedFile, xhr: null };
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

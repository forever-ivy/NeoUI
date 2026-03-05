import { mergeProps } from "@base-ui-components/react";
import { cva } from "class-variance-authority";
import {
  forwardRef,
  useCallback,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";
import { useControllableState } from "../../hooks/useControllableState";
import { useUploadQueue } from "../../hooks/useUploadQueue";
import Dragger from "./Dragger";
import UploadList from "./UploadList";
import type { NeoUploadFile, UploadProps, UploadRef } from "./types";

const uploadRootVariants = cva("space-y-4");

const Upload = forwardRef<UploadRef, UploadProps>(function Upload(props, ref) {
  const {
    fileList,
    defaultFileList = [],
    onChange,
    beforeUpload,
    customRequest,
    onRemove,
    onRetry,
    onAbort,
    onPreview,
    onExceed,
    onFileReject,
    itemRender,
    multiple = true,
    accept,
    maxCount,
    listType = "text",
    draggable = true,
    disabled = false,
    maxSizeMB,
    ariaLabel = "File upload",
    className,
    ...otherProps
  } = props;

  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const draggerDescriptionId = useId();
  const [mergedFileList, setMergedFileList] = useControllableState<
    NeoUploadFile[]
  >({
    value: fileList,
    defaultValue: defaultFileList,
    onChange,
  });

  const { queueFiles, removeFile, retryFile, abortFile, abortAll, clearAll } =
    useUploadQueue({
      fileList: mergedFileList,
      setFileList: setMergedFileList,
      beforeUpload,
      customRequest,
      accept,
      disabled,
      maxCount,
      maxSizeMB,
      onExceed,
      onFileReject,
    });

  const openFileDialog = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click();
    }
  }, [disabled]);

  useImperativeHandle(
    ref,
    () => ({
      open: () => {
        openFileDialog();
      },
      abort: (uid?: string) => {
        if (uid) {
          const abortedFile = abortFile(uid);
          if (abortedFile) {
            onAbort?.(abortedFile);
          }
          return;
        }
        const abortedFiles = abortAll();
        abortedFiles.forEach((item) => onAbort?.(item));
      },
      clear: () => {
        clearAll();
      },
    }),
    [abortAll, abortFile, clearAll, onAbort, openFileDialog],
  );

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    void queueFiles(selected);
  };

  const handleDragOver: React.DragEventHandler<HTMLDivElement> = (event) => {
    if (!draggable || disabled) return;
    event.preventDefault();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDragLeave: React.DragEventHandler<HTMLDivElement> = (event) => {
    if (!draggable || disabled) return;
    event.preventDefault();
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
      return;
    }
    setIsDragging(false);
  };

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
    if (!draggable || disabled) return;
    event.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(event.dataTransfer.files ?? []);
    void queueFiles(dropped);
  };

  const handleRemove = useCallback(
    (uid: string) => {
      const { removedFile, nextFileList } = removeFile(uid);
      if (removedFile) {
        onRemove?.(removedFile, nextFileList);
      }
    },
    [onRemove, removeFile],
  );

  const handleRetry = useCallback(
    (uid: string) => {
      const retriedFile = retryFile(uid);
      if (retriedFile) {
        onRetry?.(retriedFile);
      }
    },
    [onRetry, retryFile],
  );

  const handleAbort = useCallback(
    (uid: string) => {
      const abortedFile = abortFile(uid);
      if (abortedFile) {
        onAbort?.(abortedFile);
      }
    },
    [abortFile, onAbort],
  );

  const handlePreview = useCallback(
    (uid: string) => {
      const targetFile = mergedFileList.find((item) => item.uid === uid);
      if (!targetFile) return;
      onPreview?.(targetFile);
      if (!onPreview && targetFile.url) {
        window.open(targetFile.url, "_blank", "noopener,noreferrer");
      }
    },
    [mergedFileList, onPreview],
  );

  const mergedProps = mergeProps(otherProps, {
    className: twMerge(uploadRootVariants(), className),
  });

  return (
    <div {...mergedProps}>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        multiple={multiple}
        accept={accept}
        onChange={handleInputChange}
        disabled={disabled}
      />

      <Dragger
        dragging={isDragging}
        disabled={disabled}
        draggable={draggable}
        maxCount={maxCount}
        maxSizeMB={maxSizeMB}
        ariaLabel={ariaLabel}
        describedById={draggerDescriptionId}
        onOpenFileDialog={openFileDialog}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      />

      <UploadList
        fileList={mergedFileList}
        listType={listType}
        disabled={disabled}
        itemRender={itemRender}
        onRemove={handleRemove}
        onRetry={handleRetry}
        onAbort={handleAbort}
        onPreview={handlePreview}
      />
    </div>
  );
});

export default Upload;

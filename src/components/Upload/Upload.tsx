import { mergeProps } from "@base-ui-components/react";
import { cva } from "class-variance-authority";
import { useCallback, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { useControllableState } from "../../hooks/useControllableState";
import { useUploadQueue } from "../../hooks/useUploadQueue";
import Dragger from "./Dragger";
import UploadList from "./UploadList";
import type { NeoUploadFile, UploadProps } from "./types";

const uploadRootVariants = cva("space-y-4");

export default function Upload(props: UploadProps) {
  const {
    fileList,
    defaultFileList = [],
    onChange,
    beforeUpload,
    customRequest,
    onRemove,
    onRetry,
    multiple = true,
    accept,
    maxCount,
    listType = "text",
    draggable = true,
    disabled = false,
    maxSizeMB,
    className,
    ...otherProps
  } = props;

  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [mergedFileList, setMergedFileList] = useControllableState<
    NeoUploadFile[]
  >({
    value: fileList,
    defaultValue: defaultFileList,
    onChange,
  });

  const { queueFiles, removeFile, retryFile } = useUploadQueue({
    fileList: mergedFileList,
    setFileList: setMergedFileList,
    beforeUpload,
    customRequest,
    disabled,
    maxCount,
    maxSizeMB,
  });

  const openFileDialog = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click();
    }
  }, [disabled]);

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
        onOpenFileDialog={openFileDialog}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      />

      <UploadList
        fileList={mergedFileList}
        listType={listType}
        disabled={disabled}
        onRemove={handleRemove}
        onRetry={handleRetry}
      />
    </div>
  );
}

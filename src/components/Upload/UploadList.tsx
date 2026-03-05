import { cva } from "class-variance-authority";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  FileText,
  Image as ImageIcon,
  LoaderCircle,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import { useMemo } from "react";
import { twMerge } from "tailwind-merge";
import Button from "../Button";
import type { NeoUploadFile, UploadListType, UploadStatus } from "./types";

interface UploadListProps {
  fileList: NeoUploadFile[];
  listType: UploadListType;
  disabled?: boolean;
  onRemove: (uid: string) => void;
  onRetry: (uid: string) => void;
  onPreview: (uid: string) => void;
}

const listItemVariants = cva(
  "rounded-xl border-1 border-border bg-background p-3 shadow-raised",
  {
    variants: {
      card: {
        true: "p-2",
        false: "",
      },
    },
    defaultVariants: {
      card: false,
    },
  },
);

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

function getPreviewSource(file: NeoUploadFile) {
  return file.thumbUrl ?? file.url;
}

function isCardListType(type: UploadListType) {
  return type === "picture-card" || type === "picture-circle";
}

function renderStatusIcon(status: UploadStatus) {
  switch (status) {
    case "uploading":
      return <LoaderCircle className="h-4 w-4 animate-spin text-warning" />;
    case "done":
      return <CheckCircle2 className="h-4 w-4 text-primary" />;
    case "error":
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    default:
      return <FileText className="h-4 w-4 text-muted-foreground" />;
  }
}

function UploadPreview({
  item,
  listType,
}: {
  item: NeoUploadFile;
  listType: UploadListType;
}) {
  const previewSource = getPreviewSource(item);
  const isCard = isCardListType(listType);
  const isCircle = listType === "picture-circle";

  if (listType === "text") {
    return <FileText className="h-4 w-4 text-muted-foreground" />;
  }

  if (isCard) {
    return (
      <div
        className={twMerge(
          "h-26 w-full overflow-hidden border-1 border-border bg-muted/40 shadow-inset",
          isCircle ? "rounded-full" : "rounded-lg",
        )}
      >
        {previewSource ? (
          <img
            src={previewSource}
            alt={item.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border-1 border-border bg-muted/40 shadow-inset">
      {previewSource ? (
        <img
          src={previewSource}
          alt={item.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <ImageIcon className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

function UploadProgress({ item }: { item: NeoUploadFile }) {
  const percent = Math.round(item.percent);
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-background shadow-inset"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-label={`${item.name} upload progress`}
    >
      <div
        className="h-full rounded-full bg-linear-to-r from-primary to-primary/70 transition-all duration-200"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export default function UploadList({
  fileList,
  listType,
  disabled,
  onRemove,
  onRetry,
  onPreview,
}: UploadListProps) {
  const announcement = useMemo(() => {
    if (fileList.length === 0) return "No files";
    const uploadingFile = fileList.find((item) => item.status === "uploading");
    if (uploadingFile) {
      return `${uploadingFile.name} uploading ${Math.round(uploadingFile.percent)}%`;
    }

    const errorFile = fileList.find((item) => item.status === "error");
    if (errorFile) {
      return `${errorFile.name} failed. ${errorFile.error ?? "Upload failed"}`;
    }

    const doneFile = [...fileList]
      .reverse()
      .find((item) => item.status === "done");
    if (doneFile) {
      return `${doneFile.name} uploaded successfully`;
    }

    return `${fileList.length} file(s) selected`;
  }, [fileList]);

  if (fileList.length === 0) return null;

  const isCardType = isCardListType(listType);

  return (
    <>
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
      <ul
        className={
          isCardType
            ? "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
            : "space-y-3"
        }
      >
        {fileList.map((item) => {
          const previewSource = getPreviewSource(item);
          const statusIcon = renderStatusIcon(item.status);

          const actionButtons = (
            <div className="flex shrink-0 items-center gap-2">
              {previewSource && (
                <Button
                  type="button"
                  size="icon"
                  shape="circle"
                  variant="default"
                  onClick={() => onPreview(item.uid)}
                  disabled={disabled}
                  aria-label={`Preview ${item.name}`}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              {item.status === "error" && (
                <Button
                  type="button"
                  size="icon"
                  shape="circle"
                  variant="warning"
                  onClick={() => onRetry(item.uid)}
                  disabled={disabled}
                  aria-label={`Retry ${item.name}`}
                >
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              )}
              <Button
                type="button"
                size="icon"
                shape="circle"
                variant="destructive"
                onClick={() => onRemove(item.uid)}
                disabled={disabled}
                aria-label={`Remove ${item.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );

          const defaultNode = isCardType ? (
            <div className="space-y-2">
              <UploadPreview item={item} listType={listType} />
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium">{item.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatFileSize(item.size)}
                  </p>
                </div>
                <span className="shrink-0" aria-hidden="true">
                  {statusIcon}
                </span>
              </div>
              <UploadProgress item={item} />
              <div className="flex items-center justify-end gap-2">{actionButtons}</div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex flex-1 items-start gap-3">
                <UploadPreview item={item} listType={listType} />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span aria-hidden="true">{statusIcon}</span>
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <span
                      className={twMerge(
                        "rounded-full px-2 py-0.5 text-xs font-semibold",
                        item.status === "done" && "text-primary bg-primary/10",
                        item.status === "uploading" && "text-foreground bg-muted/50",
                        item.status === "error" && "text-destructive bg-destructive/10",
                        item.status === "ready" && "text-muted-foreground bg-muted/40",
                      )}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(item.size)}
                    {item.error ? ` • ${item.error}` : ""}
                  </p>
                  <UploadProgress item={item} />
                </div>
              </div>
              {actionButtons}
            </div>
          );

          return (
            <li
              key={item.uid}
              className={listItemVariants({ card: isCardType })}
            >
              {defaultNode}
            </li>
          );
        })}
      </ul>
    </>
  );
}

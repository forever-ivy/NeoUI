import { cva } from "class-variance-authority";
import {
  CircleStop,
  Eye,
  FileText,
  Image as ImageIcon,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import Button from "../Button";
import type {
  NeoUploadFile,
  UploadActions,
  UploadListType,
  UploadStatus,
} from "./types";

interface UploadListProps {
  fileList: NeoUploadFile[];
  listType: UploadListType;
  disabled?: boolean;
  itemRender?: (
    file: NeoUploadFile,
    defaultNode: ReactNode,
    actions: UploadActions,
  ) => ReactNode;
  onRemove: (uid: string) => void;
  onRetry: (uid: string) => void;
  onAbort: (uid: string) => void;
  onPreview: (uid: string) => void;
}

const listItemVariants = cva(
  "rounded-xl border-1 border-border bg-background p-3 shadow-raised",
);

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

function UploadPreview({
  item,
  listType,
}: {
  item: NeoUploadFile;
  listType: UploadListType;
}) {
  if (listType !== "picture") {
    return <FileText className="h-4 w-4 text-muted-foreground" />;
  }

  return (
    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border-1 border-border bg-muted/40 shadow-inset">
      {item.url ? (
        <img
          src={item.url}
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

export default function UploadList({
  fileList,
  listType,
  disabled,
  itemRender,
  onRemove,
  onRetry,
  onAbort,
  onPreview,
}: UploadListProps) {
  const [announcement, setAnnouncement] = useState("");
  const prevStatusRef = useRef<Record<string, UploadStatus>>({});

  useEffect(() => {
    const nextStatusMap: Record<string, UploadStatus> = {};
    fileList.forEach((item) => {
      const prevStatus = prevStatusRef.current[item.uid];
      nextStatusMap[item.uid] = item.status;
      if (prevStatus && prevStatus !== item.status) {
        if (item.status === "done") {
          setAnnouncement(`${item.name} uploaded successfully`);
        } else if (item.status === "error") {
          setAnnouncement(`${item.name} failed. ${item.error ?? "Upload failed"}`);
        } else if (item.status === "uploading") {
          setAnnouncement(`${item.name} upload started`);
        }
      }
    });
    prevStatusRef.current = nextStatusMap;
  }, [fileList]);

  if (fileList.length === 0) return null;

  return (
    <>
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
      <ul className="space-y-3">
        {fileList.map((item) => {
          const actions: UploadActions = {
            remove: () => onRemove(item.uid),
            retry: () => onRetry(item.uid),
            abort: () => onAbort(item.uid),
            preview: () => onPreview(item.uid),
          };

          const defaultNode = (
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex flex-1 items-start gap-3">
                <UploadPreview item={item} listType={listType} />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
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
                  <div
                    className="h-2 w-full overflow-hidden rounded-full bg-background shadow-inset"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(item.percent)}
                    aria-label={`${item.name} upload progress`}
                  >
                    <div
                      className="h-full rounded-full bg-linear-to-r from-primary to-primary/70 transition-all duration-200"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {listType === "picture" && item.url && (
                  <Button
                    type="button"
                    size="icon"
                    shape="circle"
                    variant="default"
                    onClick={actions.preview}
                    disabled={disabled}
                    aria-label={`Preview ${item.name}`}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                {item.status === "uploading" && (
                  <Button
                    type="button"
                    size="icon"
                    shape="circle"
                    variant="warning"
                    onClick={actions.abort}
                    disabled={disabled}
                    aria-label={`Abort ${item.name}`}
                  >
                    <CircleStop className="h-4 w-4" />
                  </Button>
                )}
                {item.status === "error" && (
                  <Button
                    type="button"
                    size="icon"
                    shape="circle"
                    variant="warning"
                    onClick={actions.retry}
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
                  onClick={actions.remove}
                  disabled={disabled}
                  aria-label={`Remove ${item.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );

          const renderedNode = itemRender
            ? itemRender(item, defaultNode, actions)
            : defaultNode;

          return (
            <li key={item.uid} className={listItemVariants()}>
              {renderedNode}
            </li>
          );
        })}
      </ul>
    </>
  );
}

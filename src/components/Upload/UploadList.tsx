import { cva } from "class-variance-authority";
import { FileText, Image as ImageIcon, RefreshCcw, Trash2 } from "lucide-react";
import { twMerge } from "tailwind-merge";
import Button from "../Button";
import type { NeoUploadFile, UploadListType } from "./types";

interface UploadListProps {
  fileList: NeoUploadFile[];
  listType: UploadListType;
  disabled?: boolean;
  onRemove: (uid: string) => void;
  onRetry: (uid: string) => void;
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
  onRemove,
  onRetry,
}: UploadListProps) {
  if (fileList.length === 0) return null;

  return (
    <ul className="space-y-3">
      {fileList.map((item) => (
        <li key={item.uid} className={listItemVariants()}>
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
                <div className="h-2 w-full overflow-hidden rounded-full bg-background shadow-inset">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-primary to-primary/70 transition-all duration-200"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {item.status === "error" && (
                <Button
                  type="button"
                  size="icon"
                  shape="circle"
                  variant="warning"
                  onClick={() => onRetry(item.uid)}
                  disabled={disabled}
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
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

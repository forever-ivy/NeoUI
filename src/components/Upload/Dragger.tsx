import { cva } from "class-variance-authority";
import { Upload as UploadIcon } from "lucide-react";
import Button from "../Button";

interface DraggerProps {
  dragging: boolean;
  disabled: boolean;
  draggable: boolean;
  maxCount?: number;
  maxSizeMB?: number;
  ariaLabel: string;
  describedById: string;
  onOpenFileDialog: () => void;
  onDragOver: React.DragEventHandler<HTMLDivElement>;
  onDragLeave: React.DragEventHandler<HTMLDivElement>;
  onDrop: React.DragEventHandler<HTMLDivElement>;
}

const draggerVariants = cva(
  "rounded-2xl border-2 border-dashed border-border p-5 transition-all duration-250 bg-linear-to-tl from-background to-highlight/60 shadow-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2",
  {
    variants: {
      dragging: {
        true: "border-primary bg-primary/5",
        false: "",
      },
      disabled: {
        true: "opacity-60 cursor-not-allowed",
        false: "cursor-pointer",
      },
    },
    defaultVariants: {
      dragging: false,
      disabled: false,
    },
  },
);

export default function Dragger({
  dragging,
  disabled,
  draggable,
  maxCount,
  maxSizeMB,
  ariaLabel,
  describedById,
  onOpenFileDialog,
  onDragOver,
  onDragLeave,
  onDrop,
}: DraggerProps) {
  return (
    <div
      className={draggerVariants({ dragging, disabled })}
      onClick={() => {
        if (!disabled) {
          onOpenFileDialog();
        }
      }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      aria-describedby={describedById}
      onKeyDown={(event) => {
        if (disabled) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenFileDialog();
        }
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="font-semibold">Upload Files</p>
          <p id={describedById} className="text-sm text-muted-foreground">
            Click to select files
            {draggable ? " or drag files here" : ""}
          </p>
          <p className="text-xs text-muted-foreground">
            {maxCount ? `Up to ${maxCount} files` : "Unlimited files"}
            {typeof maxSizeMB === "number" ? ` • Max ${maxSizeMB}MB each` : ""}
          </p>
        </div>
        <Button
          variant="primary"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onOpenFileDialog();
          }}
          disabled={disabled}
        >
          <UploadIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

import type { NeoUploadFile } from "./types";

function matchAcceptRule(file: File, rawRule: string) {
  const rule = rawRule.trim().toLowerCase();
  if (!rule) return true;

  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  if (rule.startsWith(".")) {
    return fileName.endsWith(rule);
  }

  if (rule.endsWith("/*")) {
    const prefix = rule.slice(0, -1);
    return fileType.startsWith(prefix);
  }

  return fileType === rule;
}

export function parseAccept(accept?: string) {
  if (!accept) return [];
  return accept
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function isFileAccepted(file: File, accept?: string) {
  const rules = parseAccept(accept);
  if (rules.length === 0) return true;
  return rules.some((rule) => matchAcceptRule(file, rule));
}

export function createUid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

export function isBlobUrl(url?: string): url is string {
  return typeof url === "string" && url.startsWith("blob:");
}

export function createThumbUrl(file: File) {
  if (!file.type.startsWith("image/")) return undefined;
  return URL.createObjectURL(file);
}

export function revokeBlobUrl(url?: string) {
  if (isBlobUrl(url)) {
    URL.revokeObjectURL(url);
  }
}

export function collectBlobUrls(fileList: NeoUploadFile[]) {
  const urls = new Set<string>();
  fileList.forEach((item) => {
    if (isBlobUrl(item.url)) {
      urls.add(item.url);
    }
    if (isBlobUrl(item.thumbUrl)) {
      urls.add(item.thumbUrl);
    }
  });
  return urls;
}

export function normalizeUploadError(error: unknown) {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const maybeMessage = Reflect.get(error, "message");
    if (typeof maybeMessage === "string" && maybeMessage.trim()) {
      return maybeMessage;
    }
  }
  return "Upload failed";
}


import type { UploadRequestHandle, UploadRequestOptions } from "./types";
import { clampPercent, normalizeUploadError } from "./utils";

function appendData(formData: FormData, key: string, value: unknown) {
  if (value === null || value === undefined) return;

  if (value instanceof Blob) {
    formData.append(key, value);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => appendData(formData, key, item));
    return;
  }

  if (typeof value === "object") {
    formData.append(key, JSON.stringify(value));
    return;
  }

  formData.append(key, String(value));
}

function parseResponse(xhr: XMLHttpRequest) {
  const responseType = xhr.getResponseHeader("content-type") ?? "";
  const text = xhr.responseText;

  if (!text) return undefined;
  if (responseType.includes("application/json")) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
  return text;
}

export function xhrUploadRequest(
  options: UploadRequestOptions,
): UploadRequestHandle {
  const xhr = new XMLHttpRequest();

  xhr.open(options.method, options.action, true);
  if (typeof options.withCredentials === "boolean") {
    xhr.withCredentials = options.withCredentials;
  }
  if (typeof options.timeout === "number") {
    xhr.timeout = options.timeout;
  }

  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });
  }

  xhr.upload.onprogress = (event) => {
    if (!event.lengthComputable) return;
    const percent = (event.loaded / event.total) * 100;
    options.onProgress(clampPercent(percent));
  };

  xhr.onload = () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      options.onProgress(100);
      options.onSuccess(parseResponse(xhr));
      return;
    }
    options.onError(`Upload failed with status ${xhr.status}`);
  };

  xhr.onerror = () => {
    options.onError("Network error");
  };

  xhr.ontimeout = () => {
    options.onError("Upload timeout");
  };

  const formData = new FormData();
  formData.append(options.filename, options.file);
  Object.entries(options.data ?? {}).forEach(([key, value]) => {
    appendData(formData, key, value);
  });

  try {
    xhr.send(formData);
  } catch (error) {
    options.onError(normalizeUploadError(error));
  }

  return {
    xhr,
    abort: () => {
      if (xhr.readyState !== XMLHttpRequest.DONE) {
        xhr.abort();
      }
    },
  };
}

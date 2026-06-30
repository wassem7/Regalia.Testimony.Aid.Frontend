import type { AttachmentType } from "./types";

export interface ReadFileResult {
  /** Raw base64 (no data: prefix), as the backend expects. */
  data: string;
  type: AttachmentType;
  name: string;
}

/** Reads a File into base64 + classifies it as image/document. */
export function readFileAsBase64(file: File): Promise<ReadFileResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const comma = result.indexOf(",");
      const data = comma >= 0 ? result.slice(comma + 1) : result;
      resolve({
        data,
        type: file.type.startsWith("image/") ? "image" : "document",
        name: file.name,
      });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

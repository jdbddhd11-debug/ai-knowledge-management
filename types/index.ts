export type ContentType = "text" | "image" | "video" | "file";

export interface UploadInput {
  content: string;
  contentType: ContentType;
  metadata?: Record<string, unknown>;
}

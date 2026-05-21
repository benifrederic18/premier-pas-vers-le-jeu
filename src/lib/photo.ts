export function getPhotoSrc(
  photoUrl?: string | null,
  photoBase64?: string | null,
  photoMimeType?: string | null
): string | null {
  if (photoUrl) return photoUrl;
  if (photoBase64 && photoMimeType) return `data:${photoMimeType};base64,${photoBase64}`;
  return null;
}

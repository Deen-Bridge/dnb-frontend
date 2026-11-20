import * as ImagePicker from "expo-image-picker";

export type MediaPermission = "granted" | "denied" | "limited" | "undetermined";

function normalize(status: ImagePicker.PermissionStatus): MediaPermission {
  if (status === ImagePicker.PermissionStatus.GRANTED) return "granted";
  if (status === ImagePicker.PermissionStatus.LIMITED) return "limited";
  if (status === ImagePicker.PermissionStatus.DENIED) return "denied";
  return "undetermined";
}

/** Read the current state without prompting. Use this on screen resume. */
export async function getMediaLibraryPermission(): Promise<MediaPermission> {
  const result = await ImagePicker.getMediaLibraryPermissionsAsync();
  return normalize(result.status);
}

/** Request access only when the user starts a photo-upload flow. */
export async function requestMediaLibraryPermission(): Promise<MediaPermission> {
  const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return normalize(result.status);
}

/** Read the camera state without prompting before a liveness flow. */
export async function getCameraPermission(): Promise<MediaPermission> {
  const result = await ImagePicker.getCameraPermissionsAsync();
  return normalize(result.status);
}

/** Request camera access only when the user starts capture. */
export async function requestCameraPermission(): Promise<MediaPermission> {
  const result = await ImagePicker.requestCameraPermissionsAsync();
  return normalize(result.status);
}

export function canUseMedia(status: MediaPermission): boolean {
  return status === "granted" || status === "limited";
}

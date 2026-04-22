import imageCompression from "browser-image-compression";

const MAX_SIZE_MB = 1;
const MAX_EDGE_PX = 1600;

export async function compressPlayerPhoto(file: File): Promise<File> {
  // Convert to webp and cap at ~1 MB / 1600 px longest edge.
  const compressed = await imageCompression(file, {
    maxSizeMB: MAX_SIZE_MB,
    maxWidthOrHeight: MAX_EDGE_PX,
    fileType: "image/webp",
    useWebWorker: true,
    initialQuality: 0.85,
  });
  // browser-image-compression returns a File in browsers; normalize name + type.
  const safeName = `${crypto.randomUUID()}.webp`;
  return new File([compressed], safeName, { type: "image/webp" });
}

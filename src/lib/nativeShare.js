import { Capacitor } from "@capacitor/core";

// Android app ke andar hain AUR dono plugins app mein maujood hain?
// (purani APK mein plugins nahi honge, to false aayega aur purana tareeka chalega)
export const isNative = () => {
  try {
    return (
      Capacitor.isNativePlatform() &&
      Capacitor.isPluginAvailable("Share") &&
      Capacitor.isPluginAvailable("Filesystem")
    );
  } catch {
    return false;
  }
};

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// Image ko cache mein likh ke native share sheet kholta hai.
// "Save to Files / Drive / Gallery" bhi isi sheet se ho jata hai.
export async function nativeShareImage(file, { title, text } = {}) {
  const { Filesystem, Directory } = await import("@capacitor/filesystem");
  const { Share } = await import("@capacitor/share");
  const data = await fileToBase64(file);
  const saved = await Filesystem.writeFile({ path: file.name, data, directory: Directory.Cache });
  await Share.share({ title, text, files: [saved.uri], dialogTitle: "Share poster" });
}
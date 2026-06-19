const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMAGE_UPLOAD_API_KEY;
const IMGBB_URL = "https://api.imgbb.com/1/upload";

export async function uploadToImgBB(file) {
  if (!IMGBB_API_KEY) {
    throw new Error("Image upload API key not configured");
  }

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${IMGBB_URL}?key=${IMGBB_API_KEY}`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || "Failed to upload image");
  }

  return data.data.url;
}

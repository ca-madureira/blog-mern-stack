import { toast } from "react-hot-toast";

export const uploadImage = async (img) => {
  let loadingToast = toast.loading("Carregando...");
  const formData = new FormData();
  formData.append("file", img);
  formData.append(
    "upload_preset",
    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
  );
  formData.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dsrwye3fj/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    toast.dismiss(loadingToast);

    const cloudData = await response.json();
    return cloudData;
  } catch (err) {
    toast.dismiss(loadingToast);

    console.error("Error uploading image:", err);

    throw err;
  }
};

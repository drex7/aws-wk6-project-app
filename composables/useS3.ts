export const useS3 = () => {

  const uploadImageS3 = async (file: File) => {
    try {

			const respone = await fetch("/api/image", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
        body: JSON.stringify({ filename: file.name }),
      });
			
			const { url, key } = await respone.json();

      await fetch(url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      return key;
    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    }
  };

  const getImages = async (page: number, pageSize: number) => {
    try {
      const response = await $fetch(
        `/api/image?page=${page}&pageSize=${pageSize}`
      );
      return response;
    } catch (error) {
      console.error("Failed to fetch images:", error);
      throw error;
    }
  };

  const deleteImage = async (key: string) => {
    try {
      const response = await fetch(`/api/image?key=${key}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      return response;
    } catch (error) {
      console.error("Failed to delete image:", error);
      throw error;
    }
  };

  return { uploadImageS3, getImages, deleteImage };
};

export const useS3 = () => {
  const _uploadImageS3 = async (file: File, description: string) => {
    try {
      // Validate file and description
      if (!file || !description) {
        throw new Error("File and description are required");
      }
      const fileBytes = await file.arrayBuffer();

      // Convert file to base64
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          if (typeof reader.result === "string") {
            resolve(reader.result);
          } else {
            reject(new Error("Failed to convert file to base64"));
          }
        };
        reader.onerror = (error) => reject(error);
      });

      const requestBody = {
        file: fileBase64,
        description: description,
      };

      const respone = await fetch("/api/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const { url, key } = await respone.json();

      // await fetch(url, {
      //   method: "PUT",
      //   body: file,
      //   headers: {
      //     "Content-Type": file.type,
      //   },
      // });

      return key;
    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    }
  };

  /**
   * Uploads a file to S3 and saves its metadata to the database.
   * @param {object} imageFile - The file object (e.g., from multer), usually contains originalname, mimetype, size, buffer.
   * @param {string} description - The description for the file.
   * @returns {Promise<object>} - A promise that resolves with the saved metadata.
   * @throws {Error} If the file name already exists or S3 upload fails.
   */
  const uploadImageS3 = async (imageFile: File, description: string) => {

    if (!imageFile || !description) {
      throw new Error("File and description are required");
    }
    
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("description", description);

    const response = await fetch("/api/image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload file");
    }

    const data = await response.json();
  }

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

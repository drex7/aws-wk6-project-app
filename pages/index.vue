<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-4">Image Gallery - Derrick</h1>

    <!-- Upload Section -->
    <div class="mb-8">
      <input
        type="file"
        accept="image/*"
        @change="handleFileChange"
        ref="fileInput"
        class="mb-4"
      />
      <button
        @click="uploadImage"
        :disabled="!selectedFile || loading"
        class="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-blue-700 focus:outline-none foucs:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
      >
        {{ loading ? "Uploading..." : "Upload Image" }}
      </button>
    </div>

    <div v-if="isLoadingImages" class="text-center py-8">
      <p class="text-xl text-gray-600">Loading images...</p>
    </div>
    <div v-else>
      <!-- Gallery or Empty State -->
      <div
        v-if="images.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8"
      >
        <div v-for="image in images" :key="image.key" class="relative">
          
          <img
            :src="image.url"
            :alt="image.key"
            class="w-full h-48 object-cover rounded"
          />
          <button
            @click="handleDelete(image.key)"
            class="absolute top-2 right-2 bg-red-500 text-white rounded px-2 py-1 text-xs hover:bg-red-700"
            :disabled="loading"
            title="Delete"
          >
            Delete
          </button>
        </div>
      </div>
      <div v-else class="text-center py-8">
        <p class="text-xl text-gray-600">
          No images uploaded yet. Start by uploading an image!
        </p>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex justify-center space-x-2">
      <button
        @click="changePage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
      >
        Previous
      </button>
      <span class="px-4 py-2">Page {{ currentPage }} of {{ totalPages }}</span>
      <button
        @click="changePage(currentPage + 1)"
        :disabled="currentPage >= totalPages"
        class="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup>
const { uploadImageS3, getImages, deleteImage } = useS3();
const selectedFile = ref(null);
const fileInput = ref(null);
const images = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const pageSize = ref(12);
const loading = ref(false);
const isLoadingImages = ref(true);
// const continuationToken = ref(null);

const handleFileChange = (event) => {
  if (event.target.files.length === 0) {
    selectedFile.value = null;
    return;
  }
  selectedFile.value = event.target.files[0];
};

const uploadImage = async () => {
  if (!selectedFile.value) return;

  loading.value = true;
  try {
    await uploadImageS3(selectedFile.value);
    selectedFile.value = null;
    fileInput.value.value = ""; // Clear the file input
    alert("Image uploaded successfully!");
    await fetchImages(1); // Reset to page 1 after upload
  } catch (error) {
    alert("Upload failed!");
    console.error("Upload error:", error);
  } finally {
    loading.value = false;
  }
};

const fetchImages = async (page) => {
  try {
    const response = await getImages(page, pageSize.value);
    images.value = response.images;
    currentPage.value = response.currentPage;
    totalPages.value = response.totalPages;
    // continuationToken.value = response.nextContinuationToken;
    isLoadingImages.value = false;
  } catch (error) {
    alert("Failed to load images!");
  }
};

const handleDelete = async (key) => {
  if (!confirm("Are you sure you want to delete this image?")) return;

  loading.value = true;
  try {
    await deleteImage(key);
    await fetchImages(currentPage.value); // Refresh the current page
    alert("Image deleted successfully!");
    fetchImages(currentPage.value); // Refresh images after deletion
  } catch (error) {
    alert("Failed to delete image!");
    console.error("Delete error:", error);
  } finally {
    loading.value = false;
  }
};

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  fetchImages(page);
};

onMounted(() => {
  isLoadingImages.value = true;
  fetchImages(1);
});
</script>

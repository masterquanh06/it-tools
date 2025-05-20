<template>
  <div class="container" ref="containerRef">
    <!-- Input for TikTok Video ID/URL -->
    <div class="input-group">
      <label class="label">TikTok Video ID or URL:</label>
      <textarea
        v-model="videoId"
        placeholder="Enter TikTok video ID or URL (e.g., https://www.tiktok.com/@username/video/7294298719665622305)"
        rows="1"
        class="textarea"
      ></textarea>
      <button @click="fetchComments" :disabled="isLoading">
        <span v-if="isLoading">Fetching...</span>
        <span v-else>GET COMMENTS</span>
      </button>
    </div>

    <!-- Control Group for Delay -->
    <div class="control-group">
      <div class="flex items-center gap-2">
        <span class="text-cyan-500 font-bold">COMMENT LIST</span>
        <label>Delay(s):</label>
        <input
          v-model="delay"
          type="number"
          class="w-16 p-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          min="1"
        />
      </div>
      <div class="button-group">
        <button @click="saveCSV">SAVE CSV</button>
      </div>
    </div>

    <!-- Results Table -->
    <div class="table-container">
      <table class="w-full text-left">
        <thead>
          <tr class="bg-gray-200">
            <th class="p-2">STT</th>
            <th class="p-2">Username</th>
            <th class="p-2">Name</th>
            <th class="p-2">Date</th>
            <th class="p-2">Content</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(comment, index) in comments" :key="comment.id" class="border-t">
            <td class="p-2">{{ index + 1 }}</td>
            <td class="p-2">{{ comment.username }}</td>
            <td class="p-2">{{ comment.name }}</td>
            <td class="p-2">{{ comment.date }}</td>
            <td class="p-2">{{ comment.content }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';

// State variables
const videoId = ref('');
const delay = ref(3);
const comments = ref([]);
const isLoading = ref(false);
const containerRef = ref(null);

// Fix for containerRef issue
onMounted(() => {
  console.log('containerRef:', containerRef.value);
  if (containerRef.value) {
    const parent = containerRef.value.closest('.tool-content');
    console.log('parent:', parent);
    if (parent) {
      parent.style.display = 'block';
    } else {
      console.warn('No parent with class .tool-content found');
    }
  } else {
    console.warn('containerRef is null');
  }
});

// Fetch comments (replace with actual API call)
const fetchComments = async () => {
  if (!videoId.value.trim()) {
    alert('Please enter a TikTok video ID or URL!');
    return;
  }

  isLoading.value = true;
  comments.value = []; // Reset comments list

  try {
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, delay.value * 1000));

    // Mock data (replace with actual API call)
    const mockData = [
      {
        id: '1',
        username: 'user1',
        name: 'User One',
        date: '2025-05-20',
        content: 'Great video!',
      },
      {
        id: '2',
        username: 'user2',
        name: 'User Two',
        date: '2025-05-19',
        content: 'Love this content!',
      },
    ];
    comments.value = mockData;

    // Example API call using Apify TikTok Comments Scraper
    /*
    const response = await fetch('https://api.apify.com/v2/acts/apify~tiktok-comments-scraper/runs', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_APIFY_API_KEY',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoUrls: [videoId.value], // Pass video ID or URL
        fields: ['commentText', 'userUniqueId', 'userNickname', 'createTime'],
      }),
    });
    const data = await response.json();
    comments.value = data.map((item, index) => ({
      id: item.commentId || index,
      username: item.userUniqueId,
      name: item.userNickname,
      date: new Date(item.createTime * 1000).toISOString().split('T')[0], // Convert timestamp to date
      content: item.commentText,
    }));
    */
  } catch (error) {
    console.error('Error fetching comments:', error);
    alert('Error fetching comments. Please try again!');
  } finally {
    isLoading.value = false;
  }
};

// Save to CSV
const saveCSV = () => {
  if (comments.value.length === 0) {
    alert('No data to save!');
    return;
  }
  const csvContent =
    'STT,Username,Name,Date,Content\n' +
    comments.value
      .map(
        (comment, index) =>
          `${index + 1},${comment.username},${comment.name},${comment.date},${comment.content.replace(/,/g, '')}`, // Remove commas to avoid CSV issues
      )
      .join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'tiktok_comments.csv';
  link.click();
};
</script>

<style scoped>
.container {
  @apply flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md w-full max-w-4xl mx-auto;
}

.input-group {
  @apply flex flex-col gap-2;
}

.label {
  @apply text-sm text-gray-600;
}

.textarea {
  @apply p-2 w-full border border-gray-300 rounded-lg text-sm font-sans resize-none;
}

.control-group {
  @apply flex justify-between items-center gap-4;
}

.button-group {
  @apply flex gap-2;
}

button {
  @apply py-2 px-4 cursor-pointer text-white border-none rounded-lg text-sm;
}

button:disabled {
  @apply bg-gray-400 cursor-not-allowed;
}

button[data-v-9ee91921] {
    @apply bg-blue-500 text-white;
}

button[data-v-9ee91921]:hover {
    @apply bg-blue-600 text-white opacity-90;
}



.table-container {
  @apply border rounded-lg overflow-hidden;
}
.button[data-v-9ee91921]:nth-child(1) {
    @apply bg-red-600;
}

</style>
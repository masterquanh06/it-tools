<template>
  <div class="container">
    <!-- Input for TikTok Username -->
    <div class="input-group">
      <label class="label">TikTok Username:</label>
      <textarea
        v-model="username"
        placeholder="Enter TikTok username"
        rows="1"
        class="textarea"
      ></textarea>
      <button @click="fetchFollowers" :disabled="isLoading">
        <span v-if="isLoading">Fetching...</span>
        <span v-else>GET FOLLOWERS</span>
      </button>
    </div>

    <!-- Control Group for Delay -->
    <div class="control-group">
      <div class="flex items-center gap-2">
        <span class="text-cyan-500 font-bold">FOLLOWER LIST</span>
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
            <th class="p-2">Following</th>
            <th class="p-2">Follower</th>
            <th class="p-2">Like</th>
            <th class="p-2">Video</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(follower, index) in followers" :key="follower.id" class="border-t">
            <td class="p-2">{{ index + 1 }}</td>
            <td class="p-2">{{ follower.username }}</td>
            <td class="p-2">{{ follower.name }}</td>
            <td class="p-2">{{ follower.following }}</td>
            <td class="p-2">{{ follower.follower }}</td>
            <td class="p-2">{{ follower.like }}</td>
            <td class="p-2">{{ follower.video }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';

// State variables
const username = ref('');
const delay = ref(3);
const followers = ref([]);
const isLoading = ref(false);
const containerRef = ref(null);

// Mount logic to show parent container
onMounted(() => {
  if (containerRef.value) {
    const parent = containerRef.value.closest('.tool-content');
    if (parent) {
      parent.style.display = 'block';
    } else {
      console.warn('No parent with class .tool-content found');
    }
  } else {
    console.warn('containerRef is null');
  }
});

// Fetch followers (replace with actual API call)
const fetchFollowers = async () => {
  if (!username.value.trim()) {
    alert('Please enter a TikTok username!');
    return;
  }

  isLoading.value = true;
  followers.value = []; // Reset followers list

  try {
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, delay.value * 1000));

    // Mock data (replace with actual API call to Apify or similar)
    const mockData = [
      {
        id: '1',
        username: 'user1',
        name: 'User One',
        following: 100,
        follower: 500,
        like: 1000,
        video: 50,
      },
      {
        id: '2',
        username: 'user2',
        name: 'User Two',
        following: 200,
        follower: 300,
        like: 800,
        video: 30,
      },
    ];
    followers.value = mockData;

    // Example API call (uncomment and configure with real API)
    /*
    const response = await fetch('https://api.apify.com/v2/acts/tiktok-scraper/runs', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username.value,
        fields: ['username', 'name', 'followingCount', 'followerCount', 'heartCount', 'videoCount'],
      }),
    });
    const data = await response.json();
    followers.value = data.map((item, index) => ({
      id: item.id,
      username: item.username,
      name: item.name,
      following: item.followingCount,
      follower: item.followerCount,
      like: item.heartCount,
      video: item.videoCount,
    }));
    */
  } catch (error) {
    console.error('Error fetching followers:', error);
    alert('Error fetching followers. Please try again!');
  } finally {
    isLoading.value = false;
  }
};

// Save to CSV
const saveCSV = () => {
  if (followers.value.length === 0) {
    alert('No data to save!');
    return;
  }
  const csvContent =
    'STT,Username,Name,Following,Follower,Like,Video\n' +
    followers.value
      .map(
        (follower, index) =>
          `${index + 1},${follower.username},${follower.name},${follower.following},${follower.follower},${follower.like},${follower.video}`,
      )
      .join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'tiktok_followers.csv';
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

button:not(:disabled):hover {
  @apply opacity-90;
}

button:nth-child(1) {
  @apply bg-red;
}

.table-container {
  @apply border rounded-lg overflow-hidden;
}

button[data-v-3b66d661] {
    @apply bg-blue-500 text-white;
}

button[data-v-3b66d661]:hover {
    @apply bg-blue-600 text-white;
}


</style>
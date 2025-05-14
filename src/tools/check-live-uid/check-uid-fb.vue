<script setup lang="ts">
import { ref } from 'vue';

const uid = ref('');
const result = ref<boolean | null>(null);
const loading = ref(false);
const error = ref('');
const title = 'Kiểm tra UID Facebook';

// Use the obtained App Access Token (for testing only)
const ACCESS_TOKEN = '560842446665717|1w48zcmYZ1zz3CgF6ODqU7zDJsc';

async function checkLiveUid(uid: string): Promise<boolean> {
  if (!/^\d+$/.test(uid)) {
    throw new Error('UID phải là số.');
  }

  const url = `https://graph.facebook.com/${uid}?fields=id,name&access_token=${ACCESS_TOKEN}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      const message = errorData.error?.message || 'Không thể truy cập API Facebook.';
      if (message.includes('does not exist')) {
        throw new Error('UID không tồn tại hoặc không thể truy cập.');
      }
      throw new Error(message);
    }
    const data = await response.json();
    return !!data.id;
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : 'Lỗi không xác định.');
  }
}

async function handleCheck() {
  result.value = null;
  error.value = '';

  if (!uid.value.trim()) {
    error.value = 'Vui lòng nhập UID.';
    return;
  }

  loading.value = true;
  try {
    result.value = await checkLiveUid(uid.value.trim());
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi kiểm tra UID.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="check-live-uid">
    <h1>{{ title }}</h1>
    <input 
      v-model="uid" 
      placeholder="Nhập UID" 
      type="text"
      :disabled="loading"
      @keypress.enter="handleCheck"
    />
    <button 
      @click="handleCheck" 
      :disabled="loading || !uid.trim()"
    >
      {{ loading ? 'Đang kiểm tra...' : 'Kiểm tra' }}
    </button>
    <div v-if="result !== null" class="result">
      UID {{ uid }}^{\{{ result ? 'sống' : 'không sống' }}.
    </div>
    <div v-if="error" class="error">
      Lỗi: {{ error }}
    </div>
  </div>
</template>

<style scoped>
.check-live-uid {
  max-width: 400px;
  margin: 0 auto;
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

input {
  width: 100%;
  padding: 8px;
  margin-bottom: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

button {
  padding: 8px 16px;
  background-color: #1877f2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover:not(:disabled) {
  background-color: #155bb5;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.result {
  margin-top: 12px;
  padding: 8px;
  border-radius: 4px;
  background-color: #f0f2f5;
}

.error {
  color: #dc2626;
  margin-top: 12px;
  padding: 8px;
  border-radius: 4px;
  background-color: #fef2f2;
}
</style>
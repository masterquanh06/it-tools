<script setup lang="ts">
import { ref } from "vue";

const uids = ref<string[]>([]); // To store multiple UIDs
const inputUids = ref(""); // For the textarea input
const results = ref<{ uid: string; live: boolean }[]>([]); // To store results
const loading = ref(false);
const error = ref("");
const liveCount = ref(0); // Counter for LIVE UIDs
const dieCount = ref(0); // Counter for DIE UIDs

// Use the obtained App Access Token (for testing only)

async function checkLiveUid(uid: string): Promise<boolean> {
  if (!/^\d+$/.test(uid)) {
    throw new Error("UID phải là số.");
  }

  const url = `https://graph.facebook.com/${uid}/picture?type=normal`;
  try {
    const response = await fetch(url);
    return !!response.ok;
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "Lỗi không xác định.");
  }
}

async function handleCheck() {
  error.value = "";
  liveCount.value = 0;
  dieCount.value = 0;
  results.value = [];

  if (!inputUids.value.trim()) {
    error.value = "Vui lòng nhập ít nhất một UID.";
    return;
  }

  // Split the input into an array of UIDs
  uids.value = inputUids.value
    .trim()
    .split("\n")
    .filter((uid) => uid.trim() !== "");
  if (uids.value.length === 0) {
    error.value = "Vui lòng nhập ít nhất một UID hợp lệ.";
    return;
  }

  loading.value = true;
  try {
    for (const uid of uids.value) {
      try {
        const isLive = await checkLiveUid(uid.trim());
        results.value.push({ uid: uid.trim(), live: isLive });
        if (isLive) {
          liveCount.value += 1;
        } else {
          dieCount.value += 1;
        }
      } catch (err) {
        results.value.push({ uid: uid.trim(), live: false });
        dieCount.value += 1;
      }
    }
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "Có lỗi xảy ra khi kiểm tra UID.";
  } finally {
    loading.value = false;
  }
}

function handleCopy(type: "live" | "die") {
  const textToCopy = results.value
    .filter((result) => result.live === (type === "live"))
    .map((result) => result.uid)
    .join("\n");
  navigator.clipboard.writeText(textToCopy);
}

function removeDuplicates() {
  const uniqueUids = Array.from(
    new Set(inputUids.value.split("\n").map((uid) => uid.trim()))
  );
  inputUids.value = uniqueUids.join("\n");
}

function filterResults(type: "live" | "die") {
  const filteredResults = results.value
    .filter((result) => result.live === (type === "live"))
    .map((result) => result.uid);
  inputUids.value = filteredResults.join("\n");
  results.value = results.value.filter(
    (result) => result.live === (type === "live")
  );
  liveCount.value = type === "live" ? results.value.length : 0;
  dieCount.value = type === "die" ? results.value.length : 0;
}
</script>

<template>
  <div class="check-live-uid">
    <div class="sections">
      <div class="section">
        <textarea
          v-model="inputUids"
          placeholder="Nhập UID (mỗi UID trên một dòng)"
          :disabled="loading"
          rows="10"
        ></textarea>
      </div>
      <div class="section">
        <textarea
          :value="results.map((r) => r.uid).join('\n')"
          placeholder="Kết quả"
          readonly
          rows="10"
        ></textarea>
      </div>
    </div>
    <div class="controls">
      <div class="counters">
        <span class="live-counter">LIVE {{ liveCount }}</span>
        <span class="die-counter">DIE {{ dieCount }}</span>
      </div>
      <div class="buttons">
        <button @click="filterResults('live')" :disabled="loading">
          Filter
        </button>
        <button @click="removeDuplicates" :disabled="loading">
          Remove duplicate
        </button>
        <button @click="handleCheck" :disabled="loading">CHECK LIVE</button>
        <button
          @click="handleCopy('live')"
          :disabled="loading || liveCount === 0"
          class="copy-live"
        >
          Copy
        </button>
        <button
          @click="handleCopy('die')"
          :disabled="loading || dieCount === 0"
          class="copy-die"
        >
          Copy
        </button>
      </div>
    </div>
    <div v-if="error" class="error">Lỗi: {{ error }}</div>
  </div>
</template>

<style scoped>
.check-live-uid {
  min-width: 1000px;
  margin: 0;
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, sans-serif;
  background-color: #4a4a4a; /* Changed to gray */
  color: #fff;
  box-sizing: border-box;
}

.sections {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.section {
  flex: 1;
}

textarea {
  width: 100%;
  padding: 8px;
  background-color: #5a5a5a; /* Adjusted to a slightly lighter gray for contrast */
  color: #fff;
  border: 1px solid #6a6a6a; /* Adjusted border color for contrast */
  border-radius: 4px;
  box-sizing: border-box;
  resize: none;
  font-size: 16px;
}

textarea:disabled {
  background-color: #3a3a3a; /* Adjusted for disabled state */
  cursor: not-allowed;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 16px;
}

.counters {
  display: flex;
  gap: 8px;
}

.live-counter {
  background-color: #28a745;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
}

.die-counter {
  background-color: #dc3545;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
}

.buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 14px;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

button:not(:disabled) {
  background-color: #007bff;
  color: white;
}

button:hover:not(:disabled) {
  background-color: #0056b3;
}

.copy-live {
  background-color: #28a745 !important;
}

.copy-live:hover:not(:disabled) {
  background-color: #218838 !important;
}

.copy-die {
  background-color: #dc3545 !important;
}

.copy-die:hover:not(:disabled) {
  background-color: #c82333 !important;
}
</style>

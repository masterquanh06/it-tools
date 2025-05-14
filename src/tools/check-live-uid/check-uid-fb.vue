<script setup lang="ts">
import { forEach } from "lodash";
import { ref } from "vue";

const uids = ref<string[]>([]); // To store multiple UIDs
const inputUids = ref(""); // For the textarea input
const results = ref<{ uid: string; live: boolean }[]>([]); // To store results
const loading = ref(false);
const error = ref("");
const liveCount = ref(0); // Counter for LIVE UIDs
const dieCount = ref(0); // Counter for DIE UIDs

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

  uids.value = inputUids.value
    .trim()
    .split("\n")
    .map((uid) => uid.trim())
    .filter((uid) => uid !== "");

  if (uids.value.length === 0) {
    error.value = "Vui lòng nhập ít nhất một UID hợp lệ.";
    return;
  }

  loading.value = true;

  const BATCH_SIZE = 500; // kiểm tra 20 UID/lượt
  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  try {
    const tempResults: { uid: string; live: boolean }[] = [];

    for (let i = 0; i < uids.value.length; i += BATCH_SIZE) {
      const batch = uids.value.slice(i, i + BATCH_SIZE);

      const promises = batch.map(async (uid) => {
        try {
          const isLive = await checkLiveUid(uid);
          return { uid, live: isLive };
        } catch {
          return { uid, live: false };
        }
      });

      const batchResults = await Promise.all(promises);
      tempResults.push(...batchResults);

      // Delay giữa các batch để tránh bị chặn (tùy chỉnh)
      await delay(300); // 300ms giữa các batch
    }

    results.value = tempResults;
    liveCount.value = tempResults.filter((r) => r.live).length;
    dieCount.value = tempResults.filter((r) => !r.live).length;
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
    <!-- Ô nhập UID -->
    <div class="top-section">
      <div class="input-header">
        <label class="label">Clone</label>
        <input class="uid-count" :value="uids.length" disabled />
      </div>

      <textarea
        v-model="inputUids"
        placeholder="Nhập UID (mỗi dòng)"
        :disabled="loading"
        rows="15"
        class="input-textarea"
      ></textarea>

      <div class="options">
        <label class="checkbox-label">
          <input type="checkbox" @change="removeDuplicates" :disabled="loading" />
          Remove duplicate
        </label>
        <div class="button-group">
          <button @click="filterResults('live')" :disabled="loading">Filter</button>
          <button @click="handleCheck" :disabled="loading">Check Live</button>
        </div>
      </div>

      <!-- Kết quả -->
      <div class="results-section">
        <!-- LIVE -->
        <div class="result-box live-box">
          <div class="result-header">
            <span class="live-counter">LIVE {{ liveCount }}</span>
            <button @click="handleCopy('live')" :disabled="liveCount === 0 || loading">Copy</button>
          </div>
          <textarea
            readonly
            :value="results.filter(r => r.live).map(r => r.uid).join('\n')"
            rows="15"
            class="result-textarea"
          ></textarea>
        </div>

        <!-- DIE -->
        <div class="result-box die-box">
          <div class="result-header">
            <span class="die-counter">DIE {{ dieCount }}</span>
            <button @click="handleCopy('die')" :disabled="dieCount === 0 || loading">Copy</button>
          </div>
          <textarea
            readonly
            :value="results.filter(r => !r.live).map(r => r.uid).join('\n')"
            rows="15"
            class="result-textarea"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Lỗi -->
    <div v-if="error" class="error">Lỗi: {{ error }}</div>
  </div>
</template>

<style scoped>
.check-live-uid {
  padding: 16px;
  background-color: #2f2f2f;
  color: #fff;
  font-family: Arial, sans-serif;
  min-height: 100vh;
  box-sizing: border-box;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.top-section {
  margin-bottom: 16px;
}

.input-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.label {
  font-weight: bold;
  margin-right: 8px;
  color: #ccc;
}

.uid-count {
  background-color: #444;
  color: #fff;
  border: 1px solid #555;
  padding: 6px 10px;
  width: 80px;
  text-align: center;
  border-radius: 4px;
  font-size: 14px;
}

.input-textarea {
  width: 100%;
  background-color: #333;
  color: #fff;
  border: 1px solid #555;
  border-radius: 4px;
  padding: 10px;
  resize: none;
  font-size: 14px;
  height: 300px;
}

.input-textarea:focus {
  outline: none;
  border-color: #007bff;
}

.input-textarea:disabled {
  background: #444;
  cursor: not-allowed;
}

.options {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #ccc;
}

.checkbox-label input {
  margin-right: 6px;
}

.button-group {
  display: flex;
  gap: 8px;
}

button {
  padding: 8px 16px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #007bff;
  color: #fff;
  transition: background-color 0.2s;
}

button:hover:not(:disabled) {
  background-color: #0056b3;
}

button:disabled {
  background-color: #666;
  cursor: not-allowed;
}

.results-section {
  display: flex;
  gap: 30px;
  margin-top: 20px;
}

.result-box {
  flex: 1;
  background-color: #333;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #555;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.live-counter {
  background-color: #28a745;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 14px;
}

.die-counter {
  background-color: #dc3545;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 14px;
}

.result-box button {
  padding: 6px 12px;
  background-color: #6c757d;
  color: #fff;
}

.result-box button:hover:not(:disabled) {
  background-color: #5a6268;
}

.result-textarea {
  width: 100%;
  height: 300px;
  resize: none;
  background-color: #444;
  border: 1px solid #555;
  color: #fff;
  padding: 10px;
  border-radius: 4px;
  font-size: 14px;
}

.error {
  margin-top: 20px;
  padding: 10px;
  background-color: #dc3545;
  color: #fff;
  border-radius: 4px;
  font-size: 14px;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .check-live-uid {
    max-width: 1000px;
  }

  .results-section {
    gap: 20px;
  }

  .input-textarea,
  .result-textarea {
    height: 250px;
  }
}

@media (max-width: 768px) {
  .check-live-uid {
    padding: 12px;
    max-width: 100%;
  }

  .results-section {
    flex-direction: column;
    gap: 15px;
  }

  .result-box {
    width: 100%;
  }

  .input-textarea,
  .result-textarea {
    height: 200px;
    font-size: 12px;
  }

  .options {
    flex-direction: column;
    gap: 8px;
  }

  .button-group {
    width: 100%;
    justify-content: space-between;
  }

  button {
    padding: 6px 12px;
    font-size: 12px;
  }

  .live-counter,
  .die-counter {
    font-size: 12px;
    padding: 4px 8px;
  }

  .uid-count {
    width: 60px;
    padding: 4px 8px;
    font-size: 12px;
  }

  .error {
    font-size: 12px;
    padding: 8px;
  }
}

@media (max-width: 480px) {
  .check-live-uid {
    padding: 8px;
  }

  .input-textarea,
  .result-textarea {
    height: 150px;
    font-size: 10px;
  }

  .results-section {
    gap: 10px;
  }

  .uid-count {
    width: 50px;
    padding: 3px 6px;
    font-size: 10px;
  }

  .button-group {
    flex-direction: column;
    gap: 6px;
  }

  button {
    padding: 4px 8px;
    font-size: 10px;
  }

  .live-counter,
  .die-counter {
    font-size: 10px;
    padding: 3px 6px;
  }

  .error {
    font-size: 10px;
    padding: 6px;
  }

  .options {
    gap: 6px;
  }
}
</style>
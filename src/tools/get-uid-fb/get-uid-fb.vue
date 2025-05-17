<template>
    <div class="container">
        <h1 class="title">Get UID from Facebook URL</h1>
        <div class="input-container">
            <label>Input Facebook Names (each line is a Name):</label>
            <textarea v-model="inputUrls" placeholder="https://www.facebook.com/username" rows="4" class="input-textarea"></textarea>
        </div>
        <button @click="extractUids" :disabled="isLoading || !inputUrls.trim()" class="extract-button">Extract UIDs</button>
        <div class="result-container">
            <h2 class="result-title">Result</h2>
            <div class="result-section">
                <label>Extracted UIDs | {{ results.filter(r => r.uid).length }}</label>
                <textarea v-model="extractedText" readonly class="result-textarea"></textarea>
                <button @click="copyExtracted" class="copy-button">Copy UIDs</button>
            </div>
            <div class="failed-section">
                <label>Failed URLs | {{ failedCount }}</label>
                <textarea v-model="failedText" readonly class="result-textarea"></textarea>
                <button @click="copyFailed" class="copy-failed-button">Copy Failed URLs</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

const inputUrls = ref('');
const results = ref([]);
const extractedText = ref('');
const failedText = ref('');
const failedCount = ref(0);
const isLoading = ref(false);
const errorMessage = ref('');

const failedUrls = computed(() => {
    const successfulUrls = results.value.map(r => r.url);
    return inputUrls.value
        .split('\n')
        .map(url => url.trim())
        .filter(url => url && !successfulUrls.includes(url));
});

const extractUids = async () => {
    isLoading.value = true;
    results.value = [];
    extractedText.value = '';
    failedText.value = '';
    failedCount.value = 0;
    errorMessage.value = '';

    const urls = inputUrls.value.split('\n').map(u => u.trim()).filter(Boolean);

    for (const url of urls) {
        const result = await fetchUidFromSalekit(url);
        if (result && result.uid) {
            results.value.push({ uid: result.uid, displayText: `${url} [${result.uid}]`, url });
        } else {
            failedCount.value++;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    extractedText.value = results.value.filter(r => r.uid).map(r => r.displayText).join('\n');
    failedText.value = failedUrls.value.join('\n');

    isLoading.value = false;
};

const fetchUidFromSalekit = async (url) => {
    try {
        const response = await fetch('https://intern-be-xi.vercel.app/api/link', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success === 200 && data.id) {
            return { uid: data.id };
        } else {
            errorMessage.value = data.message || 'Không thể lấy UID từ API';
            console.error('Salekit API error:', data.message || data);
            return null;
        }
    } catch (error) {
        errorMessage.value = error.message.includes('Failed to fetch')
            ? 'Không thể kết nối tới API (có thể do CORS, mạng, hoặc server)'
            : `Lỗi: ${error.message}`;
        console.error('Error fetching UID from salekit:', error);
        return null;
    }
};

const copyExtracted = () => {
    navigator.clipboard.writeText(extractedText.value).then(() => {
        // No counter update as per the UI
    });
};

const copyFailed = () => {
    navigator.clipboard.writeText(failedText.value).then(() => {
        // No counter update as per the UI
    });
};

watch(results, () => {
    extractedText.value = results.value.filter(r => r.uid).map(r => r.displayText).join('\n');
    failedText.value = failedUrls.value.join('\n');
});
</script>

<style scoped>
.container {
    @apply bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl mx-auto my-4;
}

.title {
    @apply text-xl font-bold text-center mb-4;
}

.input-container {
    @apply mb-4;
}

label {
    @apply text-gray-700 block mb-1;
}

.input-textarea {
    @apply w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500;
}

.extract-button {
    @apply bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4;
}

.extract-button:disabled {
    @apply bg-gray-400 cursor-not-allowed;
}

.result-container {
    @apply mb-4;
}

.result-title {
    @apply text-lg font-semibold mb-2;
}

.result-section, .failed-section {
    @apply mb-4;
}

label {
    @apply text-gray-700 block mb-1;
}

.result-textarea {
    @apply w-full p-2 border border-gray-300 rounded mb-2 resize-none;
}

.copy-button {
    @apply bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600;
}

.copy-failed-button {
    @apply bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600;
}
</style>
<template>
    <div class="container">
        <h1 class="title">Lấy UID từ URL Facebook</h1>
        <div class="input-container">
            <textarea v-model="inputUrls" placeholder="Nhập URL Facebook (mỗi dòng một URL):" rows="4"
                class="input-textarea"></textarea>
        </div>
        <button @click="extractUids" :disabled="isLoading || !inputUrls.trim()" class="extract-button">
            Trích xuất UID
        </button>
        <div class="result-container">
            <h2 class="result-title">Kết quả</h2>
            <div class="error-section" v-if="errorMessage">
                <span class="error-label">Lỗi: {{ errorMessage }}</span>
            </div>
            <div class="result-section">
                <span class="result-label">UID đã trích xuất [{{ results.filter(r => r.uid).length }}]</span>
                <div v-for="(result, index) in results.filter(r => r.uid)" :key="index" class="result-item">
                    <span class="result-text">{{ result.displayText }}</span>
                </div>
            </div>
            <div class="failed-section">
                <span class="failed-label">URL thất bại [{{ failedCount }}]</span>
                <div v-for="(failedUrl, index) in failedUrls" :key="index" class="failed-item">
                    <span class="failed-text">{{ failedUrl }}</span>
                </div>
            </div>
            <div class="button-container">
                <button @click="copyExtracted" class="copy-button">Sao chép UID</button>
                <button @click="copyFailed" class="copy-failed-button">Sao chép URL thất bại</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const inputUrls = ref('')
const results = ref([])
const copiedCount = ref(0)
const failedCount = ref(0)
const isLoading = ref(false)
const errorMessage = ref('')

const failedUrls = computed(() => {
    const successfulUrls = results.value.map(r => r.url)
    return inputUrls.value
        .split('\n')
        .map(url => url.trim())
        .filter(url => url && !successfulUrls.includes(url))
})

const extractUids = async () => {
    isLoading.value = true
    results.value = []
    copiedCount.value = 0
    failedCount.value = 0
    errorMessage.value = ''

    const urls = inputUrls.value.split('\n').map(u => u.trim()).filter(Boolean)

    for (const url of urls) {
        const result = await fetchUidFromSalekit(url)
        if (result && result.uid) {
            results.value.push({ uid: result.uid, displayText: `${url} [${result.uid}]`, url })
        } else {
            failedCount.value++
        }
        await new Promise(resolve => setTimeout(resolve, 500))
    }

    isLoading.value = false
}

const fetchUidFromSalekit = async (url) => {
    try {
        const formattedUrl = url.match(/^https?:\/\//) ? url : `https://${url}`
        
        const response = await fetch('https://fchat-app.salekit.com:4039/api/v1/facebook/get_uid', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({ 'link': formattedUrl })
        })

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data = await response.json()

        if (data.status === 'success' && data.uid) {
            return { uid: data.uid }
        } else {
            errorMessage.value = data.message || 'Không thể lấy UID từ API'
            console.error('Salekit API error:', data.message || data)
            return null
        }
    } catch (error) {
        errorMessage.value = error.message.includes('Failed to fetch')
            ? 'Không thể kết nối tới API (có thể do CORS, mạng, hoặc server)'
            : `Lỗi: ${error.message}`
        console.error('Error fetching UID from salekit:', error);
        return null
    }
}

const copyExtracted = () => {
    const extracted = results.value.filter(r => r.uid).map(r => r.displayText).join('\n')
    navigator.clipboard.writeText(extracted).then(() => {
        copiedCount.value = results.value.length
    })
}

const copyFailed = () => {
    const failedText = failedUrls.value.join('\n')
    navigator.clipboard.writeText(failedText).then(() => {
        failedCount.value = failedUrls.value.length
    })
}
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

.result-section {
    @apply w-full p-2 border border-red-900 rounded focus:outline-none focus:ring-2 focus:ring-blue-500;
}

.result-label {
    @apply text-gray-700 block mb-1 bg-white;
}

.result-item {
    @apply mb-1;
}

.result-text {
    @apply text-gray-700;
}

.failed-section {
    @apply mb-4;
}

.failed-label {
    @apply text-gray-700 block mb-1;
}

.failed-item {
    @apply mb-1;
}

.failed-text {
    @apply text-gray-700;
}

.error-section {
    @apply mb-4;
}

.error-label {
    @apply text-red-600 block mb-1;
}

.button-container {
    @apply flex gap-2 mb-4;
}

.copy-button {
    @apply bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600;
}

.copy-failed-button {
    @apply bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600;
}
</style>
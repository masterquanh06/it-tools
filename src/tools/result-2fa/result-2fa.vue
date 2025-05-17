<template>
    <div class="container">
        <div class="input-group">
            <label>* 2FA Secret</label>
            <textarea v-model="secrets" placeholder="Enter your 2FA secrets" rows="4" class="textarea"></textarea>
            <button @click="submitTokens" :disabled="isLoading">
                <span v-if="isLoading">Processing...</span>
                <span v-else>Submit</span>
            </button>
        </div>
        <div class="input-group">
            <label>* 2FA Code 2-step verification code</label>
            <textarea v-model="verificationCodes" readonly class="textarea" rows="4"></textarea>
            <button @click="copyCode">Copy</button>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const secrets = ref('');
const responseTokens = ref([]);
const verificationCodes = ref('');
const isLoading = ref(false);

// Explicitly update verificationCodes when responseTokens changes
watch(responseTokens, (newValues) => {
    console.log('responseTokens updated:', newValues); // Debug log
    verificationCodes.value = newValues.join('\n');
});

const submitTokens = async () => {
    isLoading.value = true;
    const secretList = secrets.value.split('\n').map(s => s.trim()).filter(s => s);
    responseTokens.value = []; // Reset tokens

    for (const secret of secretList) {
        try {
            const response = await fetch('https://intern-be-xi.vercel.app/api/tok', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: secret }),
            });
            const data = await response.json();
            console.log('API Response for secret', secret, ':', data); // Debug log

            if (response.ok) {
                // Try multiple possible keys for the token
                const token = data.token || data.code || data.id || data.data?.token || 'No token found';
                if (token && token !== 'No token found') {
                    responseTokens.value.push(secret,"|",token, "\n");
                } else {
                    responseTokens.value.push('No valid token in response');
                }
            } else {
                console.error('Error for secret', secret, ':', data.message);
                responseTokens.value.push('Error: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Network error for secret', secret, ':', error);
            responseTokens.value.push('Error: Network issue');
        }
        await new Promise(resolve => setTimeout(resolve, 500)); // Delay between requests
    }

    isLoading.value = false;
    // Force update verificationCodes after all requests
    verificationCodes.value = responseTokens.value.join('');
};

const copyCode = () => {
    navigator.clipboard.writeText(verificationCodes.value);
    alert('Codes copied to clipboard!');
};
</script>

<style scoped>
.container {
    @apply flex flex-col gap-2.5 p-5 bg-white rounded-md shadow-[0_0_10px_rgba(0,0,0,0.1)] w-[400px] mx-auto;
}

.input-group {
    @apply flex flex-col gap-1.5;
}

label {
    @apply text-sm text-gray-600;
}

.highlight {
    @apply text-blue-600;
}

.textarea {
    @apply p-2.5 w-full border border-gray-300 rounded-md box-border text-base resize-none;
}

button {
    @apply py-2.5 px-5 w-[100px] cursor-pointer bg-blue-600 text-white border-none rounded-md text-sm;
}

button:disabled {
    @apply bg-gray-400 cursor-not-allowed;
}

button:hover:not(:disabled) {
    @apply bg-blue-700;
}
</style>
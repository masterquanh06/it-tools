<template>
    <div class="container">
        <div class="input-group">
            <label>* 2FA Secret <span class="highlight">Get code for 2 factor authentication easiest!</span> - Please store your 2FA secret safely</label>
            <input v-model="token" placeholder="Enter your 2FA secret" />
            <button @click="submitToken">Submit</button>
        </div>
        <div class="input-group">
            <label>* 2FA Code 2-step verification code</label>
            <input placeholder="ABC12FA Code" v-model="verificationCode" />
            <button @click="copyCode">Copy</button>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const token = ref('');
const responseToken = ref('');
const verificationCode = ref('');

// Watch for changes in responseToken and update verificationCode
watch(responseToken, (newValue) => {
    verificationCode.value = newValue;
});

const submitToken = async () => {
    try {
        const response = await fetch('https://intern-be-xi.vercel.app/api/tok', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: token.value }),
        });
        const data = await response.json();
        if (response.ok) {
            responseToken.value = data.token;
        } else {
            console.error('Error:', data.message);
        }
    } catch (error) {
        console.error('Network error:', error);
    }
};

const copyCode = () => {
    navigator.clipboard.writeText(verificationCode.value);
    alert('Code copied to clipboard!');
};
</script>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 20px;
    background: white;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    width: 400px;
    margin: 0 auto;
}
.input-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
}
label {
    font-size: 14px;
    color: #666;
}
.highlight {
    color: #007bff;
}
input {
    padding: 10px;
    width: 100%;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 16px;
}
button {
    padding: 10px 20px;
    width: 100px;
    cursor: pointer;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
}
button:hover {
    background-color: #0056b3;
}
</style>
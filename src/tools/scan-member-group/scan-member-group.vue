<template>
    <div class="container">
        <!-- Ô nhập link và nút tìm kiếm -->
        <div class="input-group">
            <label class="label">Link Hoặc ID Nhóm:</label>
            <textarea
                v-model="searchLink"
                placeholder="Link Hoặc ID nhóm muốn tìm thành viên"
                rows="1"
                class="textarea"
            ></textarea>
            <button @click="search" :disabled="isLoading">
                <span v-if="isLoading">Đang tìm...</span>
                <span v-else>TÌM THÀNH VIÊN </span>
            </button>
        </div>

        <!-- Phần điều khiển và nút chức năng -->
        <div class="control-group">
            <div class="flex items-center gap-2">
                <span class="text-cyan-500 font-bold">KẾT QUẢ TÌM KIẾM</span>
                <label>Delay(s):</label>
                <input
                    v-model="delay"
                    type="number"
                    class="w-16 p-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    min="1"
                />
            </div>
            <div class="button-group">
                <button @click="saveUID">LƯU UID</button>
                <button @click="copyUID">COPY UID</button>
                <button @click="saveCSV">SAVE CSV</button>
            </div>
        </div>

        <!-- Bảng kết quả -->
        <div class="table-container">
            <table class="w-full text-left">
                <thead>
                    <tr class="bg-gray-200">
                        <th class="p-2">UID</th>
                        <th class="p-2">Name</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="member in members" :key="member.uid" class="border-t">
                        <td class="p-2">{{ member.uid }}</td>
                        <td class="p-2">{{ member.name }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref , onMounted } from 'vue';

// State variables
const searchLink = ref('');
const delay = ref(3);
const members = ref([]);
const isLoading = ref(false);

const containerRef = ref(null);
onMounted(() => {
  if (containerRef.value) {
    const parent = containerRef.value.closest('.tool-content');
    if (parent) {
      parent.style.display = 'block';
    }
  }
});
// Hàm tìm kiếm (giả lập API call)
const search = async () => {
    if (!searchLink.value.trim()) {
        alert('Vui lòng nhập link nhóm!');
        return;
    }

    isLoading.value = true;
    members.value = []; // Reset danh sách thành viên

    try {
        // Giả lập API call với delay
        await new Promise(resolve => setTimeout(resolve, delay.value * 1000));

        // Dữ liệu giả lập (thay bằng API thực tế nếu có)
        const mockData = [
            { uid: '123456', name: 'Nguyễn Văn A' },
            { uid: '789012', name: 'Trần Thị B' },
        ];
        members.value = mockData;
    } catch (error) {
        console.error('Lỗi khi tìm kiếm:', error);
        alert('Đã có lỗi xảy ra khi tìm kiếm!');
    } finally {
        isLoading.value = false;
    }
};

// Hàm lưu UID (chưa triển khai chi tiết)
const saveUID = () => {
    if (members.value.length === 0) {
        alert('Không có UID để lưu!');
        return;
    }
    alert('Chức năng lưu UID chưa được triển khai!');
};

// Hàm copy UID
const copyUID = () => {
    if (members.value.length === 0) {
        alert('Không có UID để sao chép!');
        return;
    }
    const uids = members.value.map(member => member.uid).join('\n');
    navigator.clipboard.writeText(uids);
    alert('Đã sao chép UID vào clipboard!');
};

// Hàm lưu CSV
const saveCSV = () => {
    if (members.value.length === 0) {
        alert('Không có dữ liệu để lưu CSV!');
        return;
    }
    const csvContent = 'UID,Name\n' + members.value.map(member => `${member.uid},${member.name}`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'members.csv';
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
    @apply bg-cyan-500;
}

button:nth-child(2),
button:nth-child(3),
button:nth-child(4) {
    @apply bg-blue-500;
}

.table-container {
    @apply border rounded-lg overflow-hidden;
}
</style>
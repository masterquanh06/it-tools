<template>
  <div class="container">
    <nav class="navbar">
      <button 
        v-for="(category, index) in emojiCategories" 
        :key="index" 
        @click="copyIcon(category.icon); selectCategory(category.name)"
        :class="{ active: selectedCategory === category.name }"
        class="nav-item"
      >
        <span class="nav-icon">{{ category.icon }}</span>
      </button>
    </nav>
    <div class="emoji-container">
      <div class="search-container">
        <input 
          v-model="searchQuery" 
          placeholder="Search emoji by name..." 
          class="search-input"
          @input="filterEmojis"
        />
      </div>
      <div class="category">
        <h2 v-if="!selectedCategory" class="category-title">All Emojis</h2>
        <h2 v-else class="category-title">{{ selectedCategory }}</h2>
        <div class="emoji-grid">
          <span 
            v-for="(emoji, emojiIndex) in filteredEmojis" 
            :key="emojiIndex" 
            class="emoji-item"
            @click="copyAndSelect(emoji.emoji)"
            :class="{ selected: selectedEmojis.includes(emoji.emoji) }"
            :title="emoji.name"
          >
            {{ emoji.emoji }}
          </span>
        </div>
      </div>
      <div class="footer">
        <span class="selected-text">Selected emoji: {{ selectedEmojis.join(' ') }}</span>
        <button @click="copySelected" class="copy-button">COPY</button>
        <button @click="clearSelection" class="clear-button">CLEAR</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

// Emoji name mapping (subset for brevity; expand as needed)
const emojiNames = {
  "😀": "Grinning Face",
  "😁": "Beaming Face",
  "😂": "Face with Tears of Joy",
  "🤣": "Rolling on the Floor Laughing",
  "😃": "Smiling Face with Big Eyes",
  "😄": "Smiling Face with Smiling Eyes",
  "😅": "Smiling Face with Sweat",
  "😆": "Grinning Squinting Face",
  "😉": "Winking Face",
  "😊": "Smiling Face",
  "👋": "Waving Hand",
  "🤚": "Raised Back of Hand",
  "🖐️": "Hand with Fingers Splayed",
  "✋": "Raised Hand",
  "🖖": "Vulcan Salute",
  "👌": "OK Hand",
  "❤️": "Red Heart",
  "🧡": "Orange Heart",
  "💛": "Yellow Heart",
  "💚": "Green Heart",
  "🍎": "Red Apple",
  "🍏": "Green Apple",
  "🍐": "Pear",
  "🍊": "Tangerine",
  "🍋": "Lemon",
  "🐶": "Dog Face",
  "🐱": "Cat Face",
  "🐭": "Mouse Face",
  "🐹": "Hamster",
  "🐰": "Rabbit",
  "🌱": "Seedling",
  "🪴": "Potted Plant",
  "🌿": "Herb",
  "☘️": "Shamrock",
  "🍀": "Four Leaf Clover",
  "🚗": "Car",
  "🚕": "Taxi",
  "🚙": "Sport Utility Vehicle",
  "🚌": "Bus",
  "🚎": "Trolleybus",
  "⌚": "Watch",
  "📱": "Mobile Phone",
  "📲": "Mobile Phone with Arrow",
  "💻": "Laptop",
  "⌨️": "Keyboard",
  "💯": "Hundred Points",
  "🔢": "Input Numbers",
  "🔣": "Input Symbols",
  "🔤": "Input Latin Letters",
  "🅰️": "A Button (Blood Type)"
};

const selectedCategory = ref(null);
const searchQuery = ref('');
const selectedEmojis = ref([]);

const emojiCategories = ref([
  {
    name: "Smileys",
    icon: "😊",
    emojis: ["😀", "😁", "😂", "🤣", "😃", "😄", "😅", "😆", "😉", "😊"]
  },
  {
    name: "Gestures & People",
    icon: "👋",
    emojis: ["👋", "🤚", "🖐️", "✋", "🖖", "👌"]
  },
  {
    name: "Hearts, Clothes & Activities",
    icon: "❤️",
    emojis: ["❤️", "🧡", "💛", "💚"]
  },
  {
    name: "Foods & Drinks",
    icon: "🍎",
    emojis: ["🍎", "🍏", "🍐", "🍊", "🍋"]
  },
  {
    name: "Animals",
    icon: "🐶",
    emojis: ["🐶", "🐱", "🐭", "🐹", "🐰"]
  },
  {
    name: "Plants, Nature & Weather",
    icon: "🌱",
    emojis: ["🌱", "🪴", "🌿", "☘️", "🍀"]
  },
  {
    name: "Travel, Places & Buildings",
    icon: "🚗",
    emojis: ["🚗", "🚕", "🚙", "🚌", "🚎"]
  },
  {
    name: "Objects",
    icon: "⌚",
    emojis: ["⌚", "📱", "📲", "💻", "⌨️"]
  },
  {
    name: "Symbols",
    icon: "💯",
    emojis: ["💯", "🔢", "🔣", "🔤", "🅰️"]
  }
]);

// Convert emojis to objects with emoji and name
const allEmojis = computed(() => {
  return emojiCategories.value.flatMap((category) =>
    category.emojis.map((emoji) => ({
      emoji,
      name: emojiNames[emoji] || "Unknown"
    }))
  );
});

const filteredEmojis = computed(() => {
  let emojiObjects = selectedCategory.value
    ? emojiCategories.value
        .find((c) => c.name === selectedCategory.value)
        ?.emojis.map((emoji) => ({
          emoji,
          name: emojiNames[emoji] || "Unknown"
        })) || []
    : allEmojis.value;

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    emojiObjects = emojiObjects.filter((emojiObj) =>
      emojiObj.name.toLowerCase().includes(query)
    );
  }

  return emojiObjects;
});

const toggleSelection = (emoji) => {
  if (selectedEmojis.value.includes(emoji)) {
    selectedEmojis.value = selectedEmojis.value.filter((e) => e !== emoji);
  } else {
    selectedEmojis.value.push(emoji);
  }
};

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
  }).catch((err) => {
    console.error('Failed to copy: ', err);
  });
};

const copySelected = () => {
  if (selectedEmojis.value.length === 0) return;
  copyToClipboard(selectedEmojis.value.join(' '));
};

const clearSelection = () => {
  selectedEmojis.value = [];
};

const selectCategory = (name) => {
  selectedCategory.value = name;
};

const copyIcon = async (emoji) => {
  try {
    await navigator.clipboard.writeText(emoji);
  } catch (error) {
    console.error('Copy failed:', error);
  }
};

const copyAndSelect = async (emoji) => {
  if (!selectedEmojis.value.includes(emoji)) {
    selectedEmojis.value.push(emoji);
  }

  try {
    await navigator.clipboard.writeText(selectedEmojis.value.join(' '));
    console.log('Copied:', selectedEmojis.value.join(' '));
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};
</script>

<style scoped>
.container {
  @apply flex p-4 max-w-full mx-auto bg-gray-100;
}

.navbar {
  @apply bg-gray-200 p-2 rounded-l-md h-auto w-16 flex-col space-y-2;
}

.nav-item {
  @apply px-3 py-1 rounded text-gray-700 hover:bg-gray-300 w-full flex justify-center cursor-pointer;
}

.nav-item.active {
  @apply bg-gray-400 text-black;
}

.nav-icon {
  @apply text-xl;
}

.emoji-container {
  @apply flex-1 p-2 bg-white rounded-r-md ml-2;
}

.search-container {
  @apply mb-4 bg-white p-2 rounded-t-md;
}

.search-input {
  @apply w-full p-2 focus:outline-none text-gray-700 border border-gray-300 rounded-md;
}

.category {
  @apply border-t pt-2;
}

.category-title {
  @apply text-sm font-semibold text-gray-700 mb-1;
}

.emoji-grid {
  @apply grid grid-cols-12 gap-1;
}

.emoji-item {
  @apply text-xl cursor-pointer p-1 rounded hover:bg-gray-200 text-center;
}

.emoji-item.selected {
  @apply bg-blue-200;
}

.footer {
  @apply flex justify-between items-center p-2 bg-white text-white rounded-md mt-2;
}

.selected-text {
  @apply text-sm font-semibold text-gray-700; 
}

.copy-button {
  @apply bg-blue-500 px-3 py-1 rounded hover:bg-blue-700 text-white text-sm cursor-pointer;
}

.clear-button {
  @apply bg-red-500 px-3 py-1 rounded hover:bg-red-700 text-white text-sm cursor-pointer;
}
</style>
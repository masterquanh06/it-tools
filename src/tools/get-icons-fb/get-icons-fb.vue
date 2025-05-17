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
      <div class="recent-container" v-if="recentEmojis.length > 0">
        <h3 class="recent-title">Recently Used</h3>
        <div class="recent-grid">
          <span 
            v-for="(emoji, index) in recentEmojis" 
            :key="index" 
            class="emoji-item"
            @click="copyAndSelect(emoji)"
          >
            {{ emoji }}
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

// Expanded emoji name mapping
const emojiNames = {
  // Smileys & Emotion
  "😀": "Grinning Face",
  "😁": "Beaming Face with Smiling Eyes",
  "😂": "Face with Tears of Joy",
  "🤣": "Rolling on the Floor Laughing",
  "😃": "Smiling Face with Big Eyes",
  "😄": "Smiling Face with Smiling Eyes",
  "😅": "Smiling Face with Sweat",
  "😆": "Grinning Squinting Face",
  "😉": "Winking Face",
  "😊": "Smiling Face with Smiling Eyes",
  "😋": "Face Savoring Food",
  "😎": "Smiling Face with Sunglasses",
  "😍": "Smiling Face with Heart-Eyes",
  "🥰": "Smiling Face with Hearts",
  "😘": "Face Blowing a Kiss",
  "🥲": "Smiling Face with Tear",
  "😗": "Kissing Face",
  "😙": "Kissing Face with Smiling Eyes",
  "🥹": "Face Holding Back Tears",
  "😚": "Kissing Face with Closed Eyes",
  "🙂": "Slightly Smiling Face",
  "🫠": "Melting Face",
  "🙃": "Upside-Down Face",
  "😐": "Neutral Face",
  "😑": "Expressionless Face",
  "😶": "Face Without Mouth",
  "🫥": "Dotted Line Face",
  "😶‍🌫️": "Face in Clouds",
  "😏": "Smirking Face",
  "😒": "Unamused Face",
  "🙄": "Face with Rolling Eyes",
  "😬": "Grimacing Face",
  "😮‍💨": "Face Exhaling",
  "🤥": "Lying Face",
  "😌": "Relieved Face",
  "😔": "Pensive Face",
  "😪": "Sleepy Face",
  
  // People & Body
  "👋": "Waving Hand",
  "🤚": "Raised Back of Hand",
  "🖐️": "Hand with Fingers Splayed",
  "✋": "Raised Hand",
  "🖖": "Vulcan Salute",
  "👌": "OK Hand",
  "🤌": "Pinched Fingers",
  "🤏": "Pinching Hand",
  "✌️": "Victory Hand",
  "🤞": "Crossed Fingers",
  "🫰": "Hand with Index Finger and Thumb Crossed",
  "🤟": "Love-You Gesture",
  "🤘": "Sign of the Horns",
  "🤙": "Call Me Hand",
  "👈": "Backhand Index Pointing Left",
  "👉": "Backhand Index Pointing Right",
  "👆": "Backhand Index Pointing Up",
  "🖕": "Middle Finger",
  "👇": "Backhand Index Pointing Down",
  "☝️": "Index Pointing Up",
  "👍": "Thumbs Up",
  "👎": "Thumbs Down",
  "✊": "Raised Fist",
  "👊": "Oncoming Fist",
  "🤛": "Left-Facing Fist",
  "🤜": "Right-Facing Fist",
  "👏": "Clapping Hands",
  "🙌": "Raising Hands",
  "👐": "Open Hands",
  "🤲": "Palms Up Together",
  "🤝": "Handshake",
  "🙏": "Folded Hands",
  
  // Hearts & Love
  "❤️": "Red Heart",
  "🧡": "Orange Heart",
  "💛": "Yellow Heart",
  "💚": "Green Heart",
  "💙": "Blue Heart",
  "💜": "Purple Heart",
  "🖤": "Black Heart",
  "🤍": "White Heart",
  "🤎": "Brown Heart",
  "❤️‍🔥": "Heart on Fire",
  "❤️‍🩹": "Mending Heart",
  "💔": "Broken Heart",
  "💝": "Heart with Ribbon",
  "💘": "Heart with Arrow",
  "💖": "Sparkling Heart",
  "💗": "Growing Heart",
  "💓": "Beating Heart",
  "💞": "Revolving Hearts",
  "💕": "Two Hearts",
  "💌": "Love Letter",
  
  // Food & Drink
  "🍎": "Red Apple",
  "🍏": "Green Apple",
  "🍐": "Pear",
  "🍊": "Tangerine",
  "🍋": "Lemon",
  "🍌": "Banana",
  "🍉": "Watermelon",
  "🍇": "Grapes",
  "🍓": "Strawberry",
  "🫐": "Blueberries",
  "🍈": "Melon",
  "🍒": "Cherries",
  "🍑": "Peach",
  "🥭": "Mango",
  "🍍": "Pineapple",
  "🥥": "Coconut",
  "🥝": "Kiwi Fruit",
  "🍅": "Tomato",
  "🍆": "Eggplant",
  "🥑": "Avocado",
  "🌮": "Taco",
  "🌯": "Burrito",
  "🍔": "Hamburger",
  "🍟": "French Fries",
  "🍕": "Pizza",
  "🥪": "Sandwich",
  "🥙": "Stuffed Flatbread",
  "🧆": "Falafel",
  "🥚": "Egg",
  "🍳": "Cooking",
  "🥞": "Pancakes",
  "🧇": "Waffle",
  "🍞": "Bread",
  "☕": "Hot Beverage",
  "🍵": "Teacup Without Handle",
  "🍶": "Sake",
  "🍾": "Bottle with Popping Cork",
  "🍷": "Wine Glass",
  "🍸": "Cocktail Glass",
  "🍹": "Tropical Drink",
  
  // Animals & Nature
  "🐶": "Dog Face",
  "🐱": "Cat Face",
  "🐭": "Mouse Face",
  "🐹": "Hamster",
  "🐰": "Rabbit Face",
  "🦊": "Fox",
  "🐻": "Bear",
  "🐼": "Panda",
  "🐨": "Koala",
  "🐯": "Tiger Face",
  "🦁": "Lion",
  "🐮": "Cow Face",
  "🐷": "Pig Face",
  "🐵": "Monkey Face",
  "🙈": "See-No-Evil Monkey",
  "🙉": "Hear-No-Evil Monkey",
  "🙊": "Speak-No-Evil Monkey",
  "🐔": "Chicken",
  "🐧": "Penguin",
  "🐦": "Bird",
  "🐤": "Baby Chick",
  "🐣": "Hatching Chick", 
  "🦅": "Eagle",
  "🦆": "Duck",
  "🦉": "Owl",
  "🦇": "Bat",
  "🐺": "Wolf",
  "🐗": "Boar",
  "🐴": "Horse Face",
  "🦄": "Unicorn",
  "🐝": "Honeybee",
  "🪱": "Worm",
  "🐛": "Bug",
  "🦋": "Butterfly",
  "🐌": "Snail",
  
  // Plants & Flowers
  "🌱": "Seedling",
  "🪴": "Potted Plant",
  "🌿": "Herb",
  "☘️": "Shamrock",
  "🍀": "Four Leaf Clover",
  "🍁": "Maple Leaf",
  "🍂": "Fallen Leaf",
  "🍃": "Leaf Fluttering in Wind",
  "🌵": "Cactus",
  "🌴": "Palm Tree",
  "🌳": "Deciduous Tree",
  "🌲": "Evergreen Tree",
  "🪵": "Wood",
  "🌷": "Tulip",
  "🌹": "Rose",
  "🥀": "Wilted Flower",
  "🌺": "Hibiscus",
  "🌸": "Cherry Blossom",
  "🌼": "Blossom",
  "🌻": "Sunflower",
  
  // Travel & Places
  "🚗": "Automobile",
  "🚕": "Taxi",
  "🚙": "Sport Utility Vehicle",
  "🚌": "Bus",
  "🚎": "Trolleybus",
  "🏎️": "Racing Car",
  "🚓": "Police Car",
  "🚑": "Ambulance",
  "🚒": "Fire Engine",
  "🚚": "Delivery Truck",
  "🚛": "Articulated Lorry",
  "🚜": "Tractor",
  "🛵": "Motor Scooter",
  "🏍️": "Motorcycle",
  "🚲": "Bicycle",
  "✈️": "Airplane",
  "🚀": "Rocket",
  "🛸": "Flying Saucer",
  "🚁": "Helicopter",
  "⛵": "Sailboat",
  "🚢": "Ship",
  "🏠": "House",
  "🏡": "House with Garden",
  "🏢": "Office Building",
  "🏣": "Japanese Post Office",
  "🏤": "Post Office",
  "🏥": "Hospital",
  "🏦": "Bank",
  "🏨": "Hotel",
  "🏫": "School",
  "🏛️": "Classical Building",
  "⛪": "Church",
  "🕌": "Mosque",
  "🕍": "Synagogue",
  "🏙️": "Cityscape",
  
  // Objects
  "⌚": "Watch",
  "📱": "Mobile Phone",
  "📲": "Mobile Phone with Arrow",
  "💻": "Laptop",
  "⌨️": "Keyboard",
  "🖥️": "Desktop Computer",
  "🖱️": "Computer Mouse",
  "🖨️": "Printer",
  "🕹️": "Joystick",
  "💽": "Computer Disk",
  "💾": "Floppy Disk",
  "💿": "Optical Disk",
  "📀": "DVD",
  "📷": "Camera",
  "📸": "Camera with Flash",
  "📹": "Video Camera",
  "🎥": "Movie Camera",
  "📽️": "Film Projector",
  "🎞️": "Film Frames",
  "📞": "Telephone Receiver",
  "☎️": "Telephone",
  "📟": "Pager",
  "📠": "Fax Machine",
  "📺": "Television",
  "📻": "Radio",
  "🎙️": "Studio Microphone",
  "🎚️": "Level Slider",
  "🎛️": "Control Knobs",
  "🧭": "Compass",
  "⏱️": "Stopwatch",
  "⏲️": "Timer Clock",
  "⏰": "Alarm Clock",
  "🕰️": "Mantelpiece Clock",
  
  // Symbols
  "💯": "Hundred Points",
  "🔢": "Input Numbers",
  "🔣": "Input Symbols",
  "🔤": "Input Latin Letters",
  "🅰️": "A Button (Blood Type)",
  "🆎": "AB Button (Blood Type)",
  "🅱️": "B Button (Blood Type)",
  "🆑": "CL Button",
  "🆒": "Cool Button",
  "🆓": "Free Button",
  "ℹ️": "Information",
  "🆔": "ID Button",
  "Ⓜ️": "Circled M",
  "🆕": "New Button",
  "🆖": "NG Button",
  "🅾️": "O Button (Blood Type)",
  "🆗": "OK Button",
  "🅿️": "P Button",
  "🆘": "SOS Button",
  "🆙": "Up! Button",
  "🆚": "Vs Button",
  // Flags
  "🏁": "Chequered Flag",
  "🚩": "Triangular Flag",
  "🎌": "Crossed Flags",
  "🏴": "Black Flag",
  "🏳️": "White Flag",
  "🏳️‍🌈": "Rainbow Flag",
  "🏳️‍⚧️": "Transgender Flag",
  "🏴‍☠️": "Pirate Flag"
};

const selectedCategory = ref(null);
const searchQuery = ref('');
const selectedEmojis = ref([]);
const recentEmojis = ref([]);
const maxRecentEmojis = 20;

// Expanded emoji categories
const emojiCategories = ref([
  {
    name: "Smileys & Emotion",
    icon: "😊",
    emojis: ["😀", "😁", "😂", "🤣", "😃", "😄", "😅", "😆", "😉", "😊", "😋", "😎", "😍", "🥰", "😘", "🥲", "😗", "😙", "🥹", "😚", "🙂", "🫠", "🙃", "😐", "😑", "😶", "🫥", "😶‍🌫️", "😏", "😒", "🙄", "😬", "😮‍💨", "🤥", "😌", "😔", "😪"]
  },
  {
    name: "People & Body",
    icon: "👋",
    emojis: ["👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞", "🫰", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏"]
  },
  {
    name: "Hearts & Love",
    icon: "❤️",
    emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "❤️‍🔥", "❤️‍🩹", "💔", "💝", "💘", "💖", "💗", "💓", "💞", "💕", "💌"]
  },
  {
    name: "Food & Drink",
    icon: "🍎",
    emojis: ["🍎", "🍏", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🌮", "🌯", "🍔", "🍟", "🍕", "🥪", "🥙", "🧆", "🥚", "🍳", "🥞", "🧇", "🍞", "☕", "🍵", "🍶", "🍾", "🍷", "🍸", "🍹"]
  },
  {
    name: "Animals & Nature",
    icon: "🐶",
    emojis: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐵", "🙈", "🙉", "🙊", "🐔", "🐧", "🐦", "🐤", "🐣", "🦅", "🦆", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🪱", "🐛", "🦋", "🐌"]
  },
  {
    name: "Plants & Flowers",
    icon: "🌱",
    emojis: ["🌱", "🪴", "🌿", "☘️", "🍀", "🍁", "🍂", "🍃", "🌵", "🌴", "🌳", "🌲", "🪵", "🌷", "🌹", "🥀", "🌺", "🌸", "🌼", "🌻"]
  },
  {
    name: "Travel & Places",
    icon: "🚗",
    emojis: ["🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚚", "🚛", "🚜", "🛵", "🏍️", "🚲", "✈️", "🚀", "🛸", "🚁", "⛵", "🚢", "🏠", "🏡", "🏢", "🏣", "🏤", "🏥", "🏦", "🏨", "🏫", "🏛️", "⛪", "🕌", "🕍", "🏙️"]
  },
  {
    name: "Objects",
    icon: "⌚",
    emojis: ["⌚", "📱", "📲", "💻", "⌨️", "🖥️", "🖱️", "🖨️", "🕹️", "💽", "💾", "💿", "📀", "📷", "📸", "📹", "🎥", "📽️", "🎞️", "📞", "☎️", "📟", "📠", "📺", "📻", "🎙️", "🎚️", "🎛️", "🧭", "⏱️", "⏲️", "⏰", "🕰️"]
  },
  {
    name: "Symbols",
    icon: "💯",
    emojis: ["💯", "🔢", "🔣", "🔤", "🅰️", "🆎", "🅱️", "🆑", "🆒", "🆓", "ℹ️", "🆔", "Ⓜ️", "🆕", "🆖", "🅾️", "🆗", "🅿️", "🆘", "🆙", "🆚", "🈁", "🈂️", "🈷️", "🈶", "🈯", "🉐", "🈹", "🈚", "🈲", "🉑", "🈸", "🈴", "🈳", "㊗️", "㊙️", "🈺", "🈵"]
  },
  {
    name: "Flags",
    icon: "🏁",
    emojis: ["🏁", "🚩", "🎌", "🏴", "🏳️", "🏳️‍🌈", "🏳️‍⚧️", "🏴‍☠️"]
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

// Load recent emojis from localStorage on component mount
const loadRecentEmojis = () => {
  const saved = localStorage.getItem('recentEmojis');
  if (saved) {
    try {
      recentEmojis.value = JSON.parse(saved);
    } catch (e) {
      recentEmojis.value = [];
    }
  }
};

// Save recent emojis to localStorage
const saveRecentEmojis = () => {
  localStorage.setItem('recentEmojis', JSON.stringify(recentEmojis.value));
};

// Add emoji to recent list
const addToRecent = (emoji) => {
  // Remove the emoji if it already exists (to move it to the front)
  recentEmojis.value = recentEmojis.value.filter(e => e !== emoji);
  
  // Add to the front of the array
  recentEmojis.value.unshift(emoji);
  
  // Limit the number of recent emojis
  if (recentEmojis.value.length > maxRecentEmojis) {
    recentEmojis.value = recentEmojis.value.slice(0, maxRecentEmojis);
  }
  
  saveRecentEmojis();
};

// Call loadRecentEmojis when component mounts
// In Vue 3 setup, this would typically use onMounted, but we'll use this approach for simplicity
loadRecentEmojis();

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
    addToRecent(emoji);
  } catch (error) {
    console.error('Copy failed:', error);
  }
};

const copyAndSelect = async (emoji) => {
  if (!selectedEmojis.value.includes(emoji)) {
    selectedEmojis.value.push(emoji);
  }

  addToRecent(emoji);

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

.recent-container {
  @apply mt-4 border-t pt-2;
}

.recent-title {
  @apply text-sm font-semibold text-gray-700 mb-1;
}

.recent-grid {
  @apply flex flex-wrap gap-1;
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
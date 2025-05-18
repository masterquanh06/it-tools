<template>
  <div class="container" ref="containerRef">
    <nav class="navbar">
      <!-- Search icon at the top -->
      <button
        @click="scrollToSearch"
        class="nav-item"
        title="Search Emojis"
      >
          <svg class="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="11" cy="11" r="6" stroke="#222222"/>
<path d="M20 20L17 17" stroke="#222222" stroke-linecap="round"/>
</svg>
      </button>
      <button
        v-for="(category, index) in emojiCategories"
        :key="index"
        @click="toggleCategory(category.name)"
        :class="[
          'nav-item',
          { 'active': selectedCategory === category.name },
          index % 2 === 0 ? 'bg-[#263b66]' : 'bg-[#1c2c4c]'
        ]"
      >
        <span class="nav-icon">{{ category.icon }}</span>
      </button>
    </nav>
    <div class="emoji-container">
      <div class="search-container" ref="searchContainer">
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
        <span class="selected-text">Selected emojis: {{ selectedEmojis.join(' ') }} <span class="auto-copy">(Copies automatically)</span></span>
        <div class="button-group">
          <button @click="copySelected" class="copy-button">COPY</button>
          <button @click="clearSelection" class="clear-button">CLEAR</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
const containerRef = ref(null);
onMounted(() => {
  if (containerRef.value) {
    const parent = containerRef.value.closest('.tool-content');
    if (parent) {
      parent.style.display = 'block';
    }
  }
});

// Comprehensive emoji name mapping
const emojiNames = {
  // Smileys & Emotion
  "😀": "Grinning Face", "😁": "Beaming Face with Smiling Eyes", "😂": "Face with Tears of Joy", "🤣": "Rolling on the Floor Laughing",
  "😃": "Smiling Face with Big Eyes", "😄": "Smiling Face with Smiling Eyes", "😅": "Smiling Face with Sweat", "😆": "Grinning Squinting Face",
  "😉": "Winking Face", "😊": "Smiling Face with Smiling Eyes", "😋": "Face Savoring Food", "😎": "Smiling Face with Sunglasses",
  "😍": "Smiling Face with Heart-Eyes", "🥰": "Smiling Face with Hearts", "😘": "Face Blowing a Kiss", "🥲": "Smiling Face with Tear",
  "😗": "Kissing Face", "😙": "Kissing Face with Smiling Eyes", "🥹": "Face Holding Back Tears", "😚": "Kissing Face with Closed Eyes",
  "🙂": "Slightly Smiling Face", "🫠": "Melting Face", "🙃": "Upside-Down Face", "😐": "Neutral Face", "😑": "Expressionless Face",
  "😶": "Face Without Mouth", "🫥": "Dotted Line Face", "😶‍🌫️": "Face in Clouds", "😏": "Smirking Face", "😒": "Unamused Face",
  "🙄": "Face with Rolling Eyes", "😬": "Grimacing Face", "😮‍💨": "Face Exhaling", "🤥": "Lying Face", "😌": "Relieved Face",
  "😔": "Pensive Face", "😪": "Sleepy Face", "🤤": "Drooling Face", "😴": "Sleeping Face", "😷": "Face with Medical Mask",
  "🤒": "Face with Thermometer", "🤕": "Face with Head-Bandage", "🤢": "Nauseated Face", "🤮": "Face Vomiting", "🤧": "Sneezing Face",
  "🥳": "Partying Face", "🥶": "Cold Face", "🥵": "Hot Face", "🥴": "Woozy Face", "😵": "Face with Spiral Eyes", "🤯": "Exploding Head",
  "😱": "Face Screaming in Fear", "😨": "Fearful Face", "😰": "Anxious Face with Sweat", "😥": "Sad but Relieved Face",
  "😓": "Downcast Face with Sweat", "🤗": "Hugging Face", "🤔": "Thinking Face", "🤐": "Zipper-Mouth Face", "🤨": "Face with Raised Eyebrow",
  "😕": "Confused Face", "😟": "Worried Face", "🙁": "Slightly Frowning Face",
  "☹️": "Frowning Face", "😣": "Persevering Face", "😖": "Confounded Face", "😫": "Tired Face", "😩": "Weary Face", "🥺": "Pleading Face",
  "😢": "Crying Face", "😭": "Loudly Crying Face", "😤": "Face with Steam from Nose", "😡": "Pouting Face", "😠": "Angry Face",
  "🤬": "Face with Symbols over Mouth", "😈": "Smiling Face with Horns", "👿": "Angry Face with Horns", "💀": "Skull", "☠️": "Skull and Crossbones",
  "💩": "Pile of Poo", "🤡": "Clown Face", "👹": "Ogre", "👺": "Goblin", "👻": "Ghost", "👽": "Alien", "👾": "Alien Monster",
  "🤖": "Robot", "😺": "Grinning Cat", "😸": "Grinning Cat with Smiling Eyes", "😹": "Cat with Tears of Joy", "😻": "Smiling Cat with Heart-Eyes",
  "😼": "Cat with Wry Smile", "😽": "Kissing Cat", "🙀": "Weary Cat", "😿": "Crying Cat", "😾": "Pouting Cat",

  // Gestures & People
  "👋": "Waving Hand", "🤚": "Raised Back of Hand", "🖐️": "Hand with Fingers Splayed", "✋": "Raised Hand", "🖖": "Vulcan Salute",
  "👌": "OK Hand", "🤌": "Pinched Fingers", "🤏": "Pinching Hand", "✌️": "Victory Hand", "🤞": "Crossed Fingers", "🫰": "Hand with Index Finger and Thumb Crossed",
  "🤟": "Love-You Gesture", "🤘": "Sign of the Horns", "🤙": "Call Me Hand", "👈": "Backhand Index Pointing Left", "👉": "Backhand Index Pointing Right",
  "👆": "Backhand Index Pointing Up", "🖕": "Middle Finger", "👇": "Backhand Index Pointing Down", "☝️": "Index Pointing Up", "👍": "Thumbs Up",
  "👎": "Thumbs Down", "✊": "Raised Fist", "👊": "Oncoming Fist", "🤛": "Left-Facing Fist", "🤜": "Right-Facing Fist", "👏": "Clapping Hands",
  "🙌": "Raising Hands", "👐": "Open Hands", "🤲": "Palms Up Together", "🤝": "Handshake", "🙏": "Folded Hands", "✍️": "Writing Hand",
  "💅": "Nail Polish", "🤳": "Selfie", "💪": "Flexed Biceps", "🦾": "Mechanical Arm", "🦿": "Mechanical Leg", "🦵": "Leg", "🦶": "Foot",
  "👂": "Ear", "👃": "Nose", "🧠": "Brain", "🫀": "Anatomical Heart", "🫁": "Lungs", "🦷": "Tooth", "👀": "Eyes", "👁️": "Eye",
  "👅": "Tongue", "👄": "Mouth", "🦴": "Bone", "👶": "Baby", "🧒": "Child", "👦": "Boy", "👧": "Girl", "🧑": "Person", "👨": "Man",
  "👩": "Woman", "🧔": "Bearded Person", "👴": "Old Man", "👵": "Old Woman", "👲": "Man with Chinese Cap", "👳": "Person Wearing Turban",
  "👮": "Police Officer", "👷": "Construction Worker", "💂": "Guard", "🕵️": "Detective", "🤴": "Prince", "🤵": "Man in Tuxedo",
  "👰": "Bride with Veil", "🤰": "Pregnant Woman", "🤱": "Breast-Feeding", "👼": "Baby Angel", "🎅": "Santa Claus", "🤶": "Mrs. Claus",
  "🦸": "Superhero", "🦹": "Supervillain", "🧙": "Mage", "🧚": "Fairy", "🧛": "Vampire", "🧜": "Merperson", "🧝": "Elf", "🧞": "Genie",
  "🧟": "Zombie", "🧑‍⚕️": "Health Worker", "🧑‍🎓": "Student", "🧑‍🏫": "Teacher", "🧑‍⚖️": "Judge", "🧑‍🌾": "Farmer", "🧑‍🍳": "Cook",
  "🧑‍💼": "Office Worker", "🧑‍🔧": "Mechanic", "🧑‍🏭": "Factory Worker", "🧑‍💻": "Technologist", "🧑‍🎤": "Singer", "🧑": "Artist",
  "🧑‍🎨": "Painter", "🧑‍✈️": "Pilot", "🧑‍🚀": "Astronaut", "🧑‍🚒": "Firefighter", "👨‍👩‍👧": "Family with Mother, Father, and Child",
  "👨‍👩‍👧‍👦": "Family with Two Children", "👨‍👩‍👧‍👧": "Family with Two Daughters", "👨‍👩‍👦‍👦": "Family with Two Sons",

  // Hearts, Clothes, Activities
  "❤️": "Red Heart", "🧡": "Orange Heart", "💛": "Yellow Heart", "💚": "Green Heart", "💙": "Blue Heart", "💜": "Purple Heart",
  "🖤": "Black Heart", "🤍": "White Heart", "🤎": "Brown Heart", "❤️‍🔥": "Heart on Fire", "❤️‍🩹": "Mending Heart", "💔": "Broken Heart",
  "💝": "Heart with Ribbon", "💘": "Heart with Arrow", "💖": "Sparkling Heart", "💗": "Growing Heart", "💓": "Beating Heart", "💞": "Revolving Hearts",
  "💕": "Two Hearts", "💌": "Love Letter", "👚": "Woman’s Clothes", "👕": "T-Shirt", "👖": "Jeans", "🧥": "Coat", "🥼": "Lab Coat",
  "👔": "Necktie", "👗": "Dress", "👙": "Bikini", "👘": "Kimono", "🥻": "Sari", "🩱": "One-Piece Swimsuit", "🩲": "Briefs", "🩳": "Shorts",
  "🥿": "Flat Shoe", "👞": "Man’s Shoe", "👟": "Running Shoe", "🥾": "Hiking Boot", "🥳": "Party Hat", "🎩": "Top Hat", "🧢": "Billed Cap",
  "👑": "Crown", "🎓": "Graduation Cap", "🧳": "Luggage", "⛳": "Flag in Hole", "🏀": "Basketball", "🏈": "American Football", "⚽": "Soccer Ball",
  "🏐": "Volleyball", "🏉": "Rugby Football", "🎾": "Tennis", "🎱": "Pool 8 Ball", "🏓": "Ping Pong", "🏸": "Badminton", "🥊": "Boxing Glove",
  "🥋": "Martial Arts Uniform", "🎽": "Running Shirt", "🎿": "Ski", "⛸️": "Ice Skate", "🎣": "Fishing Pole", "🎧": "Headphones", "🎤": "Microphone",
  "🎸": "Guitar", "🎹": "Musical Keyboard", "🎺": "Trumpet", "🎻": "Violin", "🥁": "Drum", "🎷": "Saxophone",

  // Foods, Drinks
  "🍎": "Red Apple", "🍏": "Green Apple", "🍐": "Pear", "🍊": "Tangerine", "🍋": "Lemon", "🍌": "Banana", "🍉": "Watermelon", "🍇": "Grapes",
  "🍓": "Strawberry", "🫐": "Blueberries", "🍈": "Melon", "🍒": "Cherries", "🍑": "Peach", "🥭": "Mango", "🍍": "Pineapple", "🥥": "Coconut",
  "🥝": "Kiwi Fruit", "🍅": "Tomato", "🍆": "Eggplant", "🥑": "Avocado", "🥦": "Broccoli", "🥕": "Carrot", "🌽": "Corn", "🌶️": "Hot Pepper",
  "🥒": "Cucumber", "🥬": "Leafy Green", "🥔": "Potato", "🍠": "Roasted Sweet Potato", "🥐": "Croissant", "🥖": "Baguette Bread", "🥨": "Pretzel",
  "🥯": "Bagel", "🥞": "Pancakes", "🧀": "Cheese Wedge", "🍖": "Meat on Bone", "🍗": "Poultry Leg", "🥩": "Cut of Meat", "🥓": "Bacon",
  "🍔": "Hamburger", "🍟": "French Fries", "🍕": "Pizza", "🌭": "Hot Dog", "🥪": "Sandwich", "🌮": "Taco", "🌯": "Burrito", "🥙": "Stuffed Flatbread",
  "🥚": "Egg", "🍳": "Cooking", "🥘": "Shallow Pan of Food", "🍲": "Pot of Food", "🥣": "Bowl with Spoon", "🥗": "Green Salad", "🍿": "Popcorn",
  "🧈": "Butter", "🧂": "Salt", "🥫": "Canned Food", "🍱": "Bento Box", "🍘": "Rice Cracker", "🍙": "Rice Ball", "🍚": "Cooked Rice",
  "🍛": "Curry Rice", "🍜": "Steaming Bowl", "🍝": "Spaghetti", "🍢": "Oden", "🍣": "Sushi", "🍤": "Fried Shrimp",
  "🍥": "Fish Cake with Swirl", "🥮": "Moon Cake", "🍡": "Dango", "🥟": "Dumpling", "🥠": "Fortune Cookie", "🥡": "Takeout Box", "🍮": "Custard",
  "🍦": "Soft Ice Cream", "🍧": "Shaved Ice", "🍨": "Ice Cream", "🍩": "Doughnut", "🍪": "Cookie", "🎂": "Birthday Cake", "🍰": "Shortcake",
  "🧁": "Cupcake", "🥧": "Pie", "🍫": "Chocolate Bar", "🍬": "Candy", "🍭": "Lollipop", "🍯": "Honey Pot", "🍼": "Baby Bottle",
  "🥛": "Glass of Milk", "☕": "Hot Beverage", "🍵": "Teacup Without Handle", "🍶": "Sake", "🍾": "Bottle with Popping Cork", "🍷": "Wine Glass",
  "🍸": "Cocktail Glass", "🍹": "Tropical Drink", "🍺": "Beer Mug", "🍻": "Clinking Beer Mugs", "🥂": "Clinking Glasses", "🥃": "Tumbler Glass",
  "🥤": "Cup with Straw", "🧃": "Beverage Box", "🧉": "Mate", "🧋": "Bubble Tea",

  // Animals
  "🐶": "Dog Face", "🐱": "Cat Face", "🐭": "Mouse Face", "🐹": "Hamster", "🐰": "Rabbit Face", "🦊": "Fox", "🐻": "Bear", "🐼": "Panda",
  "🐨": "Koala", "🐯": "Tiger Face", "🦁": "Lion", "🐮": "Cow Face", "🐷": "Pig Face", "🐵": "Monkey Face", "🙈": "See-No-Evil Monkey",
  "🙉": "Hear-No-Evil Monkey", "🙊": "Speak-No-Evil Monkey", "🐒": "Monkey", "🐴": "Horse Face", "🦄": "Unicorn", "🐝": "Honeybee",
  "🐛": "Bug", "🦋": "Butterfly", "🐌": "Snail", "🐞": "Lady Beetle", "🐜": "Ant", "🪲": "Beetle", "🪳": "Cockroach", "🕷️": "Spider",
  "🕸️": "Spider Web", "🦂": "Scorpion", "🦟": "Mosquito", "🪰": "Fly", "🪱": "Worm", "🦠": "Microbe", "🐢": "Turtle", "🐍": "Snake",
  "🦎": "Lizard", "🦖": "T-Rex", "🦕": "Sauropod", "🐙": "Octopus", "🦑": "Squid", "🦐": "Shrimp", "🦞": "Lobster", "🦀": "Crab",
  "🐡": "Pufferfish", "🐠": "Tropical Fish", "🐟": "Fish", "🐬": "Dolphin", "🦈": "Shark", "🐳": "Spouting Whale", "🐋": "Whale",
  "🐊": "Crocodile", "🐅": "Leopard", "🐆": "Jaguar", "🦓": "Zebra", "🦍": "Gorilla", "🐘": "Elephant", "🦏": "Rhinoceros", "🦛": "Hippopotamus",
  "🐪": "Camel", "🐫": "Two-Hump Camel", "🦒": "Giraffe", "🐃": "Water Buffalo", "🐂": "Ox", "🐄": "Cow", "🐎": "Horse", "🐖": "Pig",
  "🐏": "Ram", "🐑": "Sheep", "🐐": "Goat", "🐓": "Rooster", "🕊️": "Dove", "🐕": "Dog", "🐩": "Poodle", "🐈": "Cat", "🐇": "Rabbit",
  "🦃": "Turkey", "🪿": "Goose", "🐔": "Chicken", "🐣": "Hatching Chick", "🐤": "Baby Chick", "🐥": "Front-Facing Baby Chick", "🦅": "Eagle",
  "🦆": "Duck", "🦢": "Swan", "🦚": "Peacock", "🦜": "Parrot", "🦡": "Badger", "🦦": "Otter", "🦥": "Sloth", "🦨": "Skunk", "🐁": "Mouse",
  "🐀": "Rat", "🐹": "Hamster", "🐰": "Rabbit Face", "🦔": "Hedgehog", "🐿️": "Chipmunk", "🦇": "Bat", "🐺": "Wolf", "🐗": "Boar",
  "🐴": "Horse Face", "🦌": "Deer", "🦄": "Unicorn",

  // Plants, Nature, Weather
  "🌱": "Seedling", "🪴": "Potted Plant", "🌿": "Herb", "☘️": "Shamrock", "🍀": "Four Leaf Clover", "🍁": "Maple Leaf", "🍂": "Fallen Leaf",
  "🍃": "Leaf Fluttering in Wind", "🌵": "Cactus", "🌴": "Palm Tree", "🌳": "Deciduous Tree", "🌲": "Evergreen Tree", "🪵": "Wood",
  "🌷": "Tulip", "🌹": "Rose", "🥀": "Wilted Flower", "🌺": "Hibiscus", "🌸": "Cherry Blossom", "🌼": "Blossom", "🌻": "Sunflower",
  "🌞": "Sun with Face", "🌝": "Full Moon with Face", "🌚": "New Moon with Face", "🌛": "First Quarter Moon with Face", "🌜": "Last Quarter Moon with Face",
  "🌕": "Full Moon", "🌖": "Waning Gibbous Moon", "🌗": "Last Quarter Moon", "🌘": "Waning Crescent Moon", "🌑": "New Moon", "🌒": "Waxing Crescent Moon",
  "🌓": "First Quarter Moon", "🌔": "Waxing Gibbous Moon", "🌙": "Crescent Moon", "🌟": "Glowing Star", "⭐": "White Medium Star",
  "💫": "Dizzy", "🌠": "Shooting Star", "🌌": "Milky Way", "☄️": "Comet", "🌍": "Globe Showing Europe-Africa", "🌎": "Globe Showing Americas",
  "🌏": "Globe Showing Asia-Australia", "🌐": "Globe with Meridians", "🪐": "Ringed Planet", "💥": "Collision", "🌋": "Volcano",
  "🌊": "Water Wave", "🌧️": "Cloud with Rain", "⛈️": "Cloud with Lightning and Rain", "🌩️": "Cloud with Lightning", "🌨️": "Cloud with Snow",
  "❄️": "Snowflake", "☃️": "Snowman", "⛄": "Snowman Without Snow", "🌬️": "Wind Face", "💨": "Dash Symbol", "🌪️": "Tornado", "🌫️": "Fog",
  "🌈": "Rainbow", "☀️": "Sun", "☁️": "Cloud", "⛅": "Sun Behind Cloud", "🌦️": "Sun Behind Rain Cloud"
};

const selectedCategory = ref(null);
const searchQuery = ref('');
const selectedEmojis = ref([]);
const recentEmojis = ref([]);
const maxRecentEmojis = 20;
const searchContainer = ref(null);

// Comprehensive emoji categories
const emojiCategories = ref([
  {
    name: "Smileys & Emotion",
    icon: "😊",
    emojis: ["😀", "😁", "😂", "🤣", "😃", "😄", "😅", "😆", "😉", "😊", "😋", "😎", "😍", "🥰", "😘", "🥲", "😗", "😙", "🥹", "😚", "🙂", "🫠", "🙃", "😐", "😑", "😶", "🫥", "😶‍🌫️", "😏", "😒", "🙄", "😬", "😮‍💨", "🤥", "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "🥳", "🥶", "🥵", "🥴", "😵", "🤯", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤐", "🤨", "😕", "😟", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😡", "😠", "🤬", "😈", "👿", "💀", "☠️", "💩", "🤡", "👹", "👺", "👻", "👽", "👾", "🤖", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾"]
  },
  {
    name: "Gestures & People",
    icon: "👋",
    emojis: ["👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞", "🫰", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✍️", "💅", "🤳", "💪", "🦾", "🦿", "🦵", "🦶", "👂", "👃", "🧠", "🫀", "🫁", "🦷", "👀", "👁️", "👅", "👄", "🦴", "👶", "🧒", "👦", "👧", "🧑", "👨", "👩", "🧔", "👴", "👵", "👲", "👳", "👮", "👷", "💂", "🕵️", "🤴", "🤵", "👰", "🤰", "🤱", "👼", "🎅", "🤶", "🦸", "🦹", "🧙", "🧚", "🧛", "🧜", "🧝", "🧞", "🧟", "🧑‍⚕️", "🧑‍🎓", "🧑‍🏫", "🧑‍⚖️", "🧑‍🌾", "🧑‍🍳", "🧑‍💼", "🧑‍🔧", "🧑‍🏭", "🧑‍💻", "🧑‍🎤", "🧑", "🧑‍🎨", "🧑‍✈️", "🧑‍🚀", "🧑‍🚒", "👨‍👩‍👧", "👨‍👩‍👧‍👦", "👨‍👩‍👧‍👧", "👨‍👩‍👦‍👦"]
  },
  {
    name: "Hearts, Clothes, Activities",
    icon: "❤️",
    emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "❤️‍🔥", "❤️‍🩹", "💔", "💝", "💘", "💖", "💗", "💓", "💞", "💕", "💌", "👚", "👕", "👖", "🧥", "🥼", "👔", "👗", "👙", "👘", "🥻", "🩱", "🩲", "🩳", "🥿", "👞", "👟", "🥾", "🥳", "🎩", "🧢", "👑", "🎓", "🧳", "⛳", "🏀", "🏈", "⚽", "🏐", "🏉", "🎾", "🎱", "🏓", "🏸", "🥊", "🥋", "🎽", "🎿", "⛸️", "🎣", "🎧", "🎤", "🎸", "🎹", "🎺", "🎻", "🥁", "🎷"]
  },
  {
    name: "Foods, Drinks",
    icon: "🍎",
    emojis: ["🍎", "🍏", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥕", "🌽", "🌶️", "🥒", "🥬", "🥔", "🍠", "🥐", "🥖", "🥨", "🥯", "🥞", "🧀", "🍖", "🍗", "🥩", "🥓", "🍔", "🍟", "🍕", "🌭", "🥪", "🌮", "🌯", "🥙", "🥚", "🍳", "🥘", "🍲", "🥣", "🥗", "🍿", "🧈", "🧂", "🥫", "🍱", "🍘", "🍙", "🍚", "🍛", "🍜", "🍝", "🍢", "🍣", "🍤", "🍥", "🥮", "🍡", "🥟", "🥠", "🥡", "🍮", "🍦", "🍧", "🍨", "🍩", "🍪", "🎂", "🍰", "🧁", "🥧", "🍫", "🍬", "🍭", "🍯", "🍼", "🥛", "☕", "🍵", "🍶", "🍾", "🍷", "🍸", "🍹", "🍺", "🍻", "🥂", "🥃", "🥤", "🧃", "🧉", "🧋"]
  },
  {
    name: "Animals",
    icon: "🐶",
    emojis: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐵", "🙈", "🙉", "🙊", "🐒", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", "🐞", "🐜", "🪲", "🪳", "🕷️", "🕸️", "🦂", "🦟", "🪰", "🪱", "🦠", "🐢", "🐍", "🦎", "🦖", "🦕", "🐙", "🦑", "🦐", "🦞", "🦀", "🐡", "🐠", "🐟", "🐬", "🦈", "🐳", "🐋", "🐊", "🐅", "🐆", "🦓", "🦍", "🐘", "🦏", "🦛", "🐪", "🐫", "🦒", "🐃", "🐂", "🐄", "🐎", "🐖", "🐏", "🐑", "🐐", "🐓", "🕊️", "🐕", "🐩", "🐈", "🐇", "🦃", "🪿", "🐔", "🐣", "🐤", "🐥", "🦅", "🦆", "🦢", "🦚", "🦜", "🦡", "🦦", "🦥", "🦨", "🐁", "🐀", "🐹", "🦔", "🐿️", "🦇", "🐺", "🐗", "🦌"]
  },
  {
    name: "Plants, Nature, Weather",
    icon: "🌱",
    emojis: ["🌱", "🪴", "🌿", "☘️", "🍀", "🍁", "🍂", "🍃", "🌵", "🌴", "🌳", "🌲", "🪵", "🌷", "🌹", "🥀", "🌺", "🌸", "🌼", "🌻", "🌞", "🌝", "🌚", "🌛", "🌜", "🌕", "🌖", "🌗", "🌘", "🌑", "🌒", "🌓", "🌔", "🌙", "🌟", "⭐", "🌠", "🌌", "☄️", "🌍", "🌎", "🌏", "🌐", "🪐", "💥", "🌋", "🌊", "🌧️", "⛈️", "🌩️", "🌨️", "❄️", "☃️", "⛄", "🌬️", "💨", "🌪️", "🌫️", "🌈", "☀️", "☁️", "⛅", "🌦️"]
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
  recentEmojis.value = recentEmojis.value.filter(e => e !== emoji);
  recentEmojis.value.unshift(emoji);
  if (recentEmojis.value.length > maxRecentEmojis) {
    recentEmojis.value = recentEmojis.value.slice(0, maxRecentEmojis);
  }
  saveRecentEmojis();
};

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
    // Auto-copy handled by selection
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

const toggleCategory = (name) => {
  if (selectedCategory.value === name) {
    selectedCategory.value = null; // Deselect to show all emojis
  } else {
    selectedCategory.value = name; // Select the category
  }
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
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

// Scroll to search input
const scrollToSearch = () => {
  if (searchContainer.value) {
    searchContainer.value.scrollIntoView({ behavior: 'smooth' });
    searchContainer.value.querySelector('input')?.focus();
  }
};

// Auto-copy when selection changes
watch(selectedEmojis, (newValue) => {
  if (newValue.length > 0) {
    copyToClipboard(newValue.join(' '));
  }
}, { immediate: true });
</script>

<style scoped>
.container {
  @apply flex w-full  bg-gray-100 h-screen;
}

.navbar {
  @apply bg-[#263b66] text-white rounded-l-md w-12 flex-col;
}

.nav-item {
  @apply px-2 py-1 rounded w-full flex justify-center cursor-pointer text-xl;
}

.nav-icon {
  @apply text-2xl;
}

.emoji-container {
  @apply flex-1 bg-white rounded-r-md overflow-y-auto;
}

.search-container {
  @apply mb-2 bg-white p-2 rounded-t-md;
}

.search-input {
  @apply w-full p-2 text-sm focus:outline-none text-gray-700 border border-gray-300 rounded-md;
}

.category {
  @apply border-t pt-2;
}

.category-title {
  @apply text-sm font-semibold text-gray-700 mb-1;
}

.emoji-grid {
  @apply grid grid-cols-12 gap-0.5;
}

.emoji-item {
  @apply text-xl cursor-pointer p-0.5 rounded hover:bg-gray-200 text-center;
}

.emoji-item.selected {
  @apply bg-blue-200;
}

.recent-container {
  @apply mt-2 border-t pt-2;
}

.recent-title {
  @apply text-sm font-semibold text-gray-700 mb-1;
}

.recent-grid {
  @apply flex flex-wrap gap-1;
}

.footer {
  @apply flex justify-between items-center p-4 bg-[#263b66] text-white mt-2 sticky bottom-0;
}

.selected-text {
  @apply text-sm font-semibold text-white overflow-x-auto;
}

.auto-copy {
  @apply text-xs italic ml-1;
}

.button-group {
  @apply flex space-x-2;
}

.copy-button {
  @apply bg-blue-500 px-2 py-1 rounded hover:bg-blue-700 text-white text-sm cursor-pointer;
}

.clear-button {
  @apply bg-gray-500 px-2 py-1 rounded hover:bg-gray-700 text-white text-sm cursor-pointer;
}

</style>
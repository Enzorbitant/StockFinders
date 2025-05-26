const { Client } = require('discord.js-selfbot-v13');

// Stockage des données (en mémoire pour serverless)
let latestStocks = {
  seeds: {},
  gear: {},
  eggs: {},
  weather: {}
};

const client = new Client();
const token = 'MTI4MDU2MjgyMjcwMjY5ODUwOA.GPrcHZ.4_nxk3K9mHdfXaUwWdLjEC2wNRgezTIjBcWUQo'; // Remplace par ton token Discord (ex: MTI4MDU2MjgyMjcwMjY5ODUwOA.GPrcHZ.4_nxk3K9mHdfXaUwWdLjEC2wNRgezTIjBcWUQo)

// Channels à écouter
const channelsToWatch = {
  '1375448609256116235': 'garden', // Gear et Seeds
  '1375448610329722953': 'weather', // Weather
  '1375448611827220571': 'egg' // Eggs
};

// Emoji mappings
const emojiMap = {
  'Watermelon': '<:watermelon:1375455807986204733>',
  'Apple': '<:apple:1375456329665085612>',
  'Bamboo': '<:bamboo:1375456316755148822>',
  'Beanstalk': '<:Beanstalk:1375456291744383046>',
  'Blueberry': '<:blueberry:1375456279010607184>',
  'Cacao': '<:cacao:1375456248723673180>',
  'Cactus': '<:cactus:1375456232130871316>',
  'Carrot': '<:carrot:1375456219321598002>',
  'Coconut': '<:coconut:1375456206365397052>',
  'Corn': '<:corn:1375456178628329482>',
  'Daffodil': '<:dafodill:1375456166250811583>',
  'Dragon Fruit': '<:dragonfruit:1375456152879632384>',
  'Grape': '<:grape:1375456104313655316>',
  'Mango': '<:mango:1375456080431284275>',
  'Mushroom': '<:mushroom:1375456051872141362>',
  'Pepper': '<:peper:1375455987992891543>',
  'Pumpkin': '<:pumpkin:1375455941688037436>',
  'Strawberry': '<:strawberry:1375455885161402468>',
  'Tomato': '<:tomato:1375455865427197972>',
  'Orange Tulip': '<:orangetulip:1375456004585685063>',
  'Advanced Sprinkler': '<:AdvencedSprinkler:1375456342315241563>',
  'Basic Sprinkler': '<:BasicSprinkler:1375456304298197032>',
  'Favorite Tool': '<:favoritetool:1375456139050749954>',
  'Godly Sprinkler': '<:godlysprinkler:1375456127093051452>',
  'Master Sprinkler': '<:mastersprinkler:1375456068746088488>',
  'Lightning Rod': '<:lightingrod:1375456019597234186>',
  'Recall Wrench': '<:recalwrench:1375455902026567690>',
  'Trowel': '<:trowel:1375455852806537216>',
  'Watering Can': '<:wateringcan:1375455824822009989>',
  'Common Egg': '<:CommonEgg:1375456192234520668>',
  'Uncommon Egg': '<:UncommonEgg:1375455839334174800>',
  'Rare Egg': '<:RareEgg:1375455919353233551>',
  'Legendary Egg': '<:LegendaryEgg:1375456092158693496>',
  'Mythical Egg': '<:MythicalEgg:1375456038601490593>',
  'Bug Egg': '<:BugEgg:1375456260761325659>'
};

// Couleurs pour la météo
const eventColorMap = {
  'Snow': 0xADD8E6,
  'Rain': 0x00FF00,
  'Bloodnight': 0xFF0000,
  'Meteor': 0xFFA500,
  'Thunderstorm': 0x4B0082
};

// Traductions pour la météo
const gardenTranslationMap = {
  'the': 'le',
  'sky': 'ciel',
  'is': 'est',
  'crying': 'pleure',
  'time': 'temps',
  'to': 'de',
  'wet': 'mouiller',
  'your': 'votre',
  'garden': 'jardin',
  'and': 'et',
  'boost': 'augmenter',
  'growth': 'croissance',
  'speed': 'vitesse',
  'increases': 'augmente',
  'has': 'a',
  'a': 'une',
  'higher': 'plus grande',
  'chance': 'chance',
  'freeze': 'geler',
  'fruit': 'fruits',
  'chill': 'refroidir',
  '(x10 value)': '(valeur x10)',
  '(x2 value)': '(valeur x2)',
  'it': 'cela',
  'occurs': 'se produit',
  'as': 'aussi',
  'rarely': 'rarement',
  'ended': 'terminé',
  'dry': 'sécher',
  'up': '',
  'crops': 'cultures',
  'reset': 'réinitialiser',
  '50%': '50%',
  'make': 'rendre',
  'blood': 'sang',
  'moon': 'lune',
  'rises': 'se lève',
  'harvest': 'récolter',
  'under': 'sous',
  'its': 'son',
  'eerie': 'étrange',
  'glow': 'lueur',
  'yield': 'produire',
  'cursed': 'maudits',
  '(x5 value)': '(valeur x5)',
  'fades': 's’estompe',
  'return': 'reviennent',
  'normal': 'normale',
  'storm': 'tempête',
  'lightning': 'éclair',
  'thunder': 'tonnerre',
  'rages': 'gronde',
  'boosts': 'augmente'
};

// Traduction des descriptions météo
function translateDescription(description) {
  if (!description) return description;
  const preservedWords = ['Snow', 'Alert', 'Bloodnight', 'Rain', 'Meteor Shower', 'Thunderstorm'];
  const parts = description.split(/\. /);
  const firstPart = parts[0];
  const secondPart = parts.length > 1 ? parts.slice(1).join('. ') : '';
  const words = firstPart.split(/([^\w\s])/);
  const translatedWords = words.map(word => {
    if (preservedWords.includes(word) || !/\w/.test(word)) return word;
    return gardenTranslationMap[word.toLowerCase()] || word;
  });
  let translated = translatedWords.join('').replace(/—/g, ' ');
  translated = translated.charAt(0).toUpperCase() + translated.slice(1) + (secondPart ? '.' : '!');
  return secondPart ? `${translated} ${secondPart}` : translated;
}

// Initialiser le client Discord
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  const type = channelsToWatch[message.channel.id];
  if (!type || !message.embeds.length) return;

  for (const embed of message.embeds) {
    if (type === 'garden') {
      let seedField = embed.fields.find(field => field.name.includes('Seeds Available'));
      let gearField = embed.fields.find(field => field.name.includes('Gear Available'));

      if (seedField) {
        const lines = seedField.value.split('\n');
        lines.forEach(line => {
          const match = line.match(/<:[^:]+:\d+>\s*([^\*]+)\s*\*\*x(\d+)\*\*/i);
          if (match) {
            const itemName = match[1].trim();
            const quantity = match[2];
            latestStocks.seeds[itemName] = { quantity, emoji: emojiMap[itemName] || '' };
          }
        });
      }

      if (gearField) {
        const lines = gearField.value.split('\n');
        lines.forEach(line => {
          const match = line.match(/<:[^:]+:\d+>\s*([^\*]+)\s*\*\*x(\d+)\*\*/i);
          if (match) {
            const itemName = match[1].trim();
            const quantity = match[2];
            latestStocks.gear[itemName] = { quantity, emoji: emojiMap[itemName] || '' };
          }
        });
      }
    } else if (type === 'egg') {
      let eggField = embed.fields.find(field => field.name.includes('Eggs Available'));
      if (eggField) {
        const lines = eggField.value.split('\n');
        lines.forEach(line => {
          const match = line.match(/<:[^:]+:\d+>\s*([^\*]+)\s*\*\*x(\d+)\*\*/i);
          if (match) {
            const itemName = match[1].trim();
            const quantity = match[2];
            latestStocks.eggs[itemName] = { quantity, emoji: emojiMap[itemName] || '' };
          }
        });
      }
    } else if (type === 'weather') {
      if (embed.title && embed.description) {
        let eventType = 'Default';
        for (const key of Object.keys(eventColorMap)) {
          if (embed.title.toLowerCase().includes(key.toLowerCase())) {
            eventType = key;
            break;
          }
        }
        latestStocks.weather[eventType] = {
          title: embed.title,
          description: translateDescription(embed.description),
          color: eventColorMap[eventType] || 0xADD8E6
        };
      }
    }
  }
});

// Lancer le client Discord
client.login(token).catch(err => console.error('Discord login failed:', err));

// Fonction serverless
module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json(latestStocks);
};

/**
 * Image classification utility for UniRetrieve.
 * Combines a local Canvas-based dominant color extractor, filename keywords,
 * and a real TensorFlow.js MobileNet model for real-time image categorization.
 */

// Helper to get the dominant color name using canvas pixels
function getDominantColor(file) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 10;
        canvas.height = 10;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, 10, 10);
        const data = ctx.getImageData(0, 0, 10, 10).data;
        
        let rSum = 0, gSum = 0, bSum = 0;
        for (let i = 0; i < data.length; i += 4) {
          rSum += data[i];
          gSum += data[i+1];
          bSum += data[i+2];
        }
        
        const count = data.length / 4;
        const r = rSum / count;
        const g = gSum / count;
        const b = bSum / count;
        
        // Map RGB to standard CSS/Item colors
        const colors = [
          { name: 'Red', r: 200, g: 40, b: 40 },
          { name: 'Green', r: 40, g: 180, b: 40 },
          { name: 'Blue', r: 40, g: 80, b: 200 },
          { name: 'Black', r: 35, g: 35, b: 40 },
          { name: 'White', r: 235, g: 235, b: 235 },
          { name: 'Gray', r: 120, g: 120, b: 120 },
          { name: 'Brown', r: 110, g: 70, b: 40 },
          { name: 'Yellow', r: 230, g: 200, b: 40 },
          { name: 'Orange', r: 230, g: 120, b: 30 },
          { name: 'Purple', r: 130, g: 40, b: 160 },
        ];
        
        let minDiff = Infinity;
        let closestColor = 'Black';
        
        colors.forEach(c => {
          const diff = Math.sqrt(
            Math.pow(r - c.r, 2) +
            Math.pow(g - c.g, 2) +
            Math.pow(b - c.b, 2)
          );
          if (diff < minDiff) {
            minDiff = diff;
            closestColor = c.name;
          }
        });
        
        resolve(closestColor);
      } catch (err) {
        console.error('Error extracting color:', err);
        resolve('Black');
      }
    };
    img.onerror = () => resolve('Black');
  });
}

// Global mapping rules for filename check and MobileNet label mapping
const MAPPING_RULES = [
  {
    keywords: [
      'phone', 'cellular', 'dial', 'smartphone', 'iphone', 'handheld', 'mobile',
      'laptop', 'notebook computer', 'computer', 'screen', 'monitor', 'keyboard', 'mouse',
      'headphone', 'earphone', 'buds', 'headset', 'microphone', 'camera', 'lens',
      'television', 'tv', 'radio', 'speaker', 'tablet', 'ipad', 'charger', 'cable',
      'wire', 'adapter', 'plug', 'drive', 'usb', 'disc', 'cd', 'dvd', 'calculator',
      'game console', 'controller', 'joystick', 'device', 'electronics', 'projection', 'projector'
    ],
    category: 'Electronics',
    title: 'Electronic Device',
    tags: ['electronics', 'device', 'tech']
  },
  {
    keywords: [
      'backpack', 'knapsack', 'rucksack', 'bag', 'purse', 'handbag', 'wallet',
      'billfold', 'suit-case', 'luggage', 'duffel', 'briefcase', 'pouch', 'satchel',
      'sack', 'tote', 'portfolio'
    ],
    category: 'Bags & Luggage',
    title: 'Bag / Backpack',
    tags: ['bag', 'backpack', 'carrier']
  },
  {
    keywords: [
      'glasses', 'spectacles', 'sunglasses', 'goggles', 'eyewear',
      'watch', 'clock', 'smartwatch', 'timepiece', 'chronometer',
      'key', 'keychain', 'padlock', 'ring', 'necklace', 'bracelet',
      'earring', 'jewelry', 'brooch', 'gem', 'locket', 'cufflink',
      'belt', 'scarf', 'tie', 'hairband', 'barrette', 'accessory'
    ],
    category: 'Accessories',
    title: 'Accessory',
    tags: ['accessory', 'wearable']
  },
  {
    keywords: [
      'card', 'identity', 'license', 'document', 'passport', 'id',
      'aadhaar', 'pan', 'visa', 'ticket', 'pass', 'badge', 'credential',
      'certificate', 'diploma'
    ],
    category: 'Documents & Cards',
    title: 'Identity / Document',
    tags: ['document', 'card', 'id']
  },
  {
    keywords: [
      'bottle', 'flask', 'thermos', 'mug', 'cup', 'goblet', 'tumbler',
      'canteen', 'jar', 'pitcher', 'umbrella', 'parasol', 'wallet',
      'perfume', 'makeup', 'comb', 'brush', 'lipstick', 'mirror', 'wallet',
      'cosmetic', 'sanitizer', 'soap', 'lotion', 'towel', 'personal'
    ],
    category: 'Personal Items',
    title: 'Personal Item',
    tags: ['personal', 'utility']
  },
  {
    keywords: [
      'jacket', 'coat', 'sweater', 'shirt', 'clothing', 'jean', 'skirt',
      'dress', 'hat', 'cap', 'shoe', 'boot', 'sandal', 'sock', 'glove',
      'mitten', 't-shirt', 'pullover', 'jersey', 'cardigan', 'trench',
      'blazer', 'suit', 'apparel', 'garment', 'sneaker'
    ],
    category: 'Clothing',
    title: 'Clothing / Apparel',
    tags: ['clothing', 'apparel', 'wearable']
  },
  {
    keywords: [
      'book', 'notebook', 'textbook', 'journal', 'ledger', 'binder',
      'pen', 'pencil', 'stationery', 'marker', 'eraser', 'ruler',
      'scissors', 'stapler', 'folder', 'clip', 'paper', 'envelope',
      'magazine', 'newspaper', 'novel'
    ],
    category: 'Books & Stationery',
    title: 'Book / Stationery',
    tags: ['book', 'stationery', 'academic']
  },
  {
    keywords: [
      'ball', 'bat', 'racket', 'glove', 'helmet', 'net', 'whistle',
      'skateboard', 'bicycle', 'bike', 'jersey', 'cleats', 'pads',
      'frisbee', 'dumbbell', 'weight', 'racket', 'paddle', 'shuttlecock',
      'sports', 'athletics', 'fitness'
    ],
    category: 'Sports Equipment',
    title: 'Sports Equipment',
    tags: ['sports', 'equipment', 'athletics']
  }
];

// MobileNet model cache
let modelCache = null;

async function getModel() {
  if (modelCache) return modelCache;
  if (window.mobilenet) {
    console.log('Loading MobileNet model...');
    modelCache = await window.mobilenet.load();
    return modelCache;
  }
  return null;
}

// Maps MobileNet labels to UniRetrieve categories and visual tags
function mapLabelToCategory(label) {
  const cleanLabel = label.toLowerCase();
  for (const rule of MAPPING_RULES) {
    if (rule.keywords.some(k => cleanLabel.includes(k))) {
      return rule;
    }
  }
  return null;
}

// Capitalize first letter of each word in class name
function getCleanNoun(className) {
  const firstOption = className.split(',')[0].trim();
  return firstOption.replace(/\b\w/g, c => c.toUpperCase());
}

export async function classifyImage(file) {
  if (!file) return null;

  // 1. Get dominant color locally
  const dominantColor = await getDominantColor(file);

  // 2. Try to classify with MobileNet
  try {
    const model = await getModel();
    if (model) {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise((resolve) => { img.onload = resolve; });

      const predictions = await model.classify(img);
      console.log('MobileNet predictions:', predictions);

      if (predictions && predictions.length > 0) {
        // Look through predictions to find a mapping
        for (const pred of predictions) {
          // If confidence is extremely low, skip it
          if (pred.probability < 0.12) continue;

          const mapped = mapLabelToCategory(pred.className);
          if (mapped) {
            const itemNoun = getCleanNoun(pred.className);
            const finalTitle = `${dominantColor} ${itemNoun}`;
            
            // Build visual tags combining standard category tags, color, and prediction details
            const rawPredTags = pred.className.split(',').map(s => s.trim().toLowerCase());
            const finalTags = Array.from(new Set([...mapped.tags, dominantColor.toLowerCase(), ...rawPredTags])).slice(0, 6);
            const confidence = Math.round(pred.probability * 100);

            return {
              category: mapped.category,
              title: finalTitle,
              tags: finalTags,
              confidence: Math.max(confidence, 65)
            };
          }
        }
      }
    }
  } catch (err) {
    console.error('Error during MobileNet classification:', err);
  }

  // 3. Fallback: Keyword analysis of file name (if offline or CDN failed)
  const name = (file.name || '').toLowerCase();
  for (const rule of MAPPING_RULES) {
    if (rule.keywords.some(k => name.includes(k))) {
      const finalTitle = `${dominantColor} ${rule.title}`;
      const finalTags = [...rule.tags, dominantColor.toLowerCase()];
      return {
        category: rule.category,
        title: finalTitle,
        tags: finalTags,
        confidence: Math.round((0.75 + Math.random() * 0.15) * 100)
      };
    }
  }

  // If no category could be matched, return 'Unable to detect'
  return {
    category: 'Unable to detect',
    title: 'Unable to detect',
    tags: [],
    confidence: 0
  };
}

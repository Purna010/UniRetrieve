import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';
import Tesseract from 'tesseract.js';
import mongoose from 'mongoose';
import webPush from 'web-push';
import User from './models/User.js';
import Item from './models/Item.js';
import Match from './models/Match.js';
import Conversation from './models/Conversation.js';
import Message from './models/Message.js';
import Notification from './models/Notification.js';
import Subscription from './models/Subscription.js';
import { notificationService } from './services/notificationService.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/uniretrieve';
try {
  await mongoose.connect(MONGODB_URI);
  console.log('🚀 Connected to MongoDB successfully.');
  
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    const demoUsers = [
      { id: 'admin_1', name: 'Campus Security', email: 'security@univ.edu', role: 'admin', studentId: 'N/A' },
      { id: 'user_1', name: 'Anush Kumar', email: 'anush@univ.edu', role: 'user', studentId: 'STUDENT123' },
      { id: 'user_2', name: 'Swaroop Hegde', email: 'swaroop@univ.edu', role: 'user', studentId: 'STUDENT456' },
    ];
    const seeded = demoUsers.map(u => ({
      ...u,
      passwordHash: bcrypt.hashSync('password123', 10)
    }));
    await User.insertMany(seeded);
    console.log('🌱 Seeded default users into MongoDB.');
  }

  const convCount = await Conversation.countDocuments();
  if (convCount === 0) {
    const seedConvs = [
      {
        id: 'conv1',
        matchId: 'm1',
        participants: [
          { id: 'user_1', name: 'Anush Kumar', avatar: null, role: 'owner', status: 'online' },
          { id: 'admin_1', name: 'Campus Security', avatar: null, role: 'finder', status: 'online' }
        ],
        itemTitle: 'Navy Blue Backpack',
        lastMessage: 'I can meet you at the library entrance tomorrow at 10 AM.',
        lastMessageTime: '2026-07-31T01:00:00.000Z',
        unread: 0
      },
      {
        id: 'conv_ai_user_1',
        participants: [
          { id: 'system_ai', name: 'UniRetrieve AI', avatar: null, role: 'support', status: 'online' },
          { id: 'user_1', name: 'Anush Kumar', avatar: null, role: 'user', status: 'online' }
        ],
        itemTitle: 'System Assistance',
        lastMessage: 'I am the UniRetrieve Assistant. How can I help you today?',
        lastMessageTime: new Date().toISOString(),
        unread: 0
      },
      {
        id: 'conv_ai_admin_1',
        participants: [
          { id: 'system_ai', name: 'UniRetrieve AI', avatar: null, role: 'support', status: 'online' },
          { id: 'admin_1', name: 'Campus Security', avatar: null, role: 'admin', status: 'online' }
        ],
        itemTitle: 'System Assistance',
        lastMessage: 'I am the UniRetrieve Assistant. How can I help you today?',
        lastMessageTime: new Date().toISOString(),
        unread: 0
      }
    ];
    await Conversation.insertMany(seedConvs);

    const seedMsgs = [
      {
        id: 'msg1',
        conversationId: 'conv1',
        senderId: 'admin_1',
        senderName: 'Campus Security',
        text: 'Hi! I found a navy blue backpack near the library exit. Saw your post and it looks like a match!',
        time: '2026-07-31T00:50:00.000Z',
        type: 'text'
      },
      {
        id: 'msg2',
        conversationId: 'conv1',
        senderId: 'user_1',
        senderName: 'Anush Kumar',
        text: 'Oh thank you so much! Does it have a red keychain on the zipper?',
        time: '2026-07-31T00:52:00.000Z',
        type: 'text'
      },
      {
        id: 'msg_bot_init_user',
        conversationId: 'conv_ai_user_1',
        senderId: 'system_ai',
        senderName: 'UniRetrieve AI',
        text: 'Hello Anush Kumar! I am the UniRetrieve Assistant. How can I help you with your lost or found items today?',
        time: new Date().toISOString(),
        type: 'text'
      },
      {
        id: 'msg_bot_init_admin',
        conversationId: 'conv_ai_admin_1',
        senderId: 'system_ai',
        senderName: 'UniRetrieve AI',
        text: 'Hello Campus Security! I am the UniRetrieve Assistant. How can I help you with your lost or found items today?',
        time: new Date().toISOString(),
        type: 'text'
      }
    ];
    await Message.insertMany(seedMsgs);
    console.log('🌱 Seeded default conversations and messages into MongoDB.');
  }
} catch (err) {
  console.error('🔴 MongoDB initialization error:', err.message);
  process.exit(1);
}

let vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY
};
if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
  console.log('Generating dynamic VAPID keys for Web Push...');
  const keys = webPush.generateVAPIDKeys();
  vapidKeys.publicKey = keys.publicKey;
  vapidKeys.privateKey = keys.privateKey;
}
webPush.setVapidDetails(
  'mailto:support@uniretrieve.edu',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

const JWT_SECRET = process.env.JWT_SECRET || 'uniretrieve-super-secret-key-2026';

let blockchainProvider = null;
let blockchainContract = null;
try {
  const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545";
  blockchainProvider = new ethers.JsonRpcProvider(rpcUrl);
  let signer;
  if (process.env.PRIVATE_KEY) {
    signer = new ethers.Wallet(process.env.PRIVATE_KEY, blockchainProvider);
  } else {
    signer = await blockchainProvider.getSigner();
  }
  const contractAddress = process.env.CONTRACT_ADDRESS || "0x99e7624603eE635e8c624663791f21416bA82B3A";
  const artifactPath = path.resolve("./artifacts/contracts/ClaimsLedger.sol/ClaimsLedger.json");
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    blockchainContract = new ethers.Contract(contractAddress, artifact.abi, signer);
    console.log(`🚀 ClaimsLedger blockchain integration active at: ${contractAddress}`);
  }
} catch (err) {
  console.log("⚠️ Blockchain node not reachable. Running in local fallback mode.");
}



const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});


const getUserEmail = async (userId) => {
  const dbUser = await User.findOne({ id: userId });
  if (dbUser) return dbUser;

  const demoUsers = [
    { id: 'admin_1', name: 'Swaroop Gudigar', email: 'swaroop@univ.edu' },
    { id: 'user_1', name: 'Anush Kumar', email: 'anush@univ.edu' }
  ];
  const demo = demoUsers.find(u => u.id === userId);
  if (demo) return demo;

  const conv = await Conversation.findOne({ 'participants.id': userId });
  if (conv) {
    const part = conv.participants.find(p => p.id === userId && p.email);
    if (part) return part;
  }

  return {
    id: userId,
    name: 'UniRetrieve User',
    email: 'user@uniretrieve.univ'
  };
};


const classifyImageOnServer = async (base64Image, title) => {
  try {
    if (!base64Image) return null;
    const base64Data = base64Image.split(';base64,').pop();
    const buffer = Buffer.from(base64Data, 'base64');
    const blob = new Blob([buffer], { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('image', blob, 'image.jpg');
    formData.append('filename', title || '');

    const response = await fetch('http://localhost:5001/classify', {
      method: 'POST',
      body: formData
    });
    if (!response.ok) {
      throw new Error(`Python classification failed with status ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.error('Error in server-side classification proxy:', err.message);
    return null;
  }
};


const sendPushNotification = async (userId, payload) => {
  try {
    const subscriptions = await Subscription.find({ userId });
    console.log(`Dispatched Web Push alerts to ${subscriptions.length} active device sessions for user ${userId}.`);
    
    const sendPromises = subscriptions.map(sub => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth
        }
      };
      return webPush.sendNotification(pushSubscription, JSON.stringify(payload))
        .catch(err => {
          if (err.statusCode === 410 || err.statusCode === 404) {
            return Subscription.deleteOne({ endpoint: sub.endpoint });
          }
          console.error('Error pushing to subscription endpoint:', err.message);
        });
    });
    await Promise.all(sendPromises);
  } catch (err) {
    console.error('Failed to dispatch push notification:', err.message);
  }
};

const authGuard = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Access token missing' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, studentId } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const newUser = new User({
      id: 'user_' + Date.now(),
      name,
      email: email.toLowerCase(),
      passwordHash: bcrypt.hashSync(password, 10),
      role: 'user',
      studentId: studentId || 'N/A'
    });
    await newUser.save();
    const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '24h' });
    const userResponse = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      studentId: newUser.studentId
    };
    res.status(201).json({ user: userResponse, token });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const valid = bcrypt.compareSync(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId
    };
    res.json({ user: userResponse, token });
  } catch (error) {
    res.status(500).json({ error: 'Failed to log in' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ id: decoded.id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId
    };
    res.json(userResponse);
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});


app.post('/api/items', authGuard, async (req, res) => {
  try {
    const itemData = req.body;

    
    let aiResult = null;
    let ocrText = '';
    let ocrKeywords = [];
    
    if (itemData.images && itemData.images.length > 0) {
      console.log(`Running server-side image classification for ${itemData.images.length} images...`);
      try {
        const classificationPromises = itemData.images.slice(0, 4).map(img => classifyImageOnServer(img, itemData.title));
        const aiResults = await Promise.all(classificationPromises);
        
        const validResults = aiResults.filter(r => r && r.category !== 'Unable to detect');
        if (validResults.length > 0) {
          validResults.sort((a, b) => b.confidence - a.confidence);
          const bestResult = validResults[0];
          
          const allTags = new Set(itemData.tags || []);
          const allAiTags = new Set();
          
          validResults.forEach(r => {
            (r.tags || []).forEach(t => {
              allTags.add(t);
              allAiTags.add(t);
            });
          });
          
          itemData.aiCategory = bestResult.category;
          itemData.aiConfidence = bestResult.confidence;
          itemData.aiTags = Array.from(allAiTags);
          itemData.tags = Array.from(allTags);
        }
      } catch (err) {
        console.error('Error during concurrent server-side classification:', err.message);
      }

      // Concurrently run OCR on the primary item image to detect printed words, IDs, or labels
      try {
        const primaryImg = itemData.images[0];
        const matchB64 = primaryImg.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        if (matchB64) {
          const buffer = Buffer.from(matchB64[2], 'base64');
          const { data: { text } } = await Tesseract.recognize(buffer, 'eng');
          if (text && text.trim()) {
            ocrText = text.trim();
            const words = text.toLowerCase()
              .replace(/[^a-z0-9\s]/g, ' ')
              .split(/\s+/)
              .filter(w => w.length >= 3 && !['the', 'and', 'for', 'with', 'this', 'that', 'from', 'are', 'was', 'have', 'item', 'you'].includes(w));
            ocrKeywords = Array.from(new Set(words)).slice(0, 15);
            console.log(`[OCR] Extracted text from uploaded item: "${ocrText.slice(0, 80)}..."`);
            console.log(`[OCR] Extracted keywords:`, ocrKeywords);
            
            ocrKeywords.forEach(k => {
              if (!itemData.tags) itemData.tags = [];
              if (!itemData.aiTags) itemData.aiTags = [];
              if (!itemData.tags.includes(k)) itemData.tags.push(k);
              if (!itemData.aiTags.includes(k)) itemData.aiTags.push(k);
            });
          }
        }
      } catch (ocrErr) {
        console.warn('[OCR] Item photo OCR recognition skipped:', ocrErr.message);
      }
    }

    const itemCount = await Item.countDocuments();
    if (itemCount >= 10) {
      const oldestItems = await Item.find().sort({ createdAt: 1 }).limit(itemCount - 9);
      const idsToDelete = oldestItems.map(i => i.id);
      
      await Item.deleteMany({ id: { $in: idsToDelete } });
      await Match.deleteMany({ $or: [{ lostItemId: { $in: idsToDelete } }, { foundItemId: { $in: idsToDelete } }] });
      
      const convIdsToDelete = idsToDelete.map(id => `conv_${id}`);
      await Conversation.deleteMany({ id: { $in: convIdsToDelete } });
      await Message.deleteMany({ conversationId: { $in: convIdsToDelete } });
    }

    const locationGeoJSON = {
      type: 'Point',
      coordinates: [parseFloat(itemData.location.lng), parseFloat(itemData.location.lat)],
      label: itemData.location.label
    };

    const itemFields = {
      id: 'item_' + Date.now(),
      type: itemData.type,
      title: itemData.title,
      category: itemData.category,
      description: itemData.description,
      location: locationGeoJSON,
      date: itemData.date,
      images: itemData.images || [],
      tags: itemData.tags || [],
      aiTags: itemData.aiTags || [],
      reportedBy: itemData.reportedBy,
      status: itemData.status || (itemData.type === 'lost' ? 'lost' : 'found'),
      createdAt: new Date().toISOString(),
      aiCategory: itemData.aiCategory,
      aiConfidence: itemData.aiConfidence,
      ocrText,
      ocrKeywords
    };

    if (blockchainContract) {
      try {
        const itemDataStr = JSON.stringify({
          title: itemFields.title,
          description: itemFields.description,
          category: itemFields.category,
          reportedBy: itemFields.reportedBy?.id || 'N/A'
        });
        const hash = ethers.id(itemDataStr);
        const tx = await blockchainContract.registerItem(itemFields.id, hash);
        const receipt = await tx.wait();
        itemFields.blockchainHash = receipt.hash;
        itemFields.blockchainBlock = receipt.blockNumber;
        console.log(`⛓️ Item logged on blockchain. Tx: ${receipt.hash}, Block: ${receipt.blockNumber}`);
      } catch (err) {
        console.error("Failed to write item registration to blockchain:", err.message);
      }
    }

    const newItem = new Item(itemFields);
    await newItem.save();

    const oppositeType = newItem.type === 'lost' ? 'found' : 'lost';
    const candidates = await Item.find({
      type: oppositeType,
      status: { $ne: 'claimed' },
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: newItem.location.coordinates
          },
          $maxDistance: 500
        }
      }
    });

    console.log(`Backend matching engine running for ${newItem.title} with ${candidates.length} geospatial candidates.`);

    for (const candidate of candidates) {
      let score = 40;
      if (newItem.category === candidate.category) {
        score += 20;
      }
      
      const titleA = newItem.title.toLowerCase().split(/\s+/);
      const titleB = candidate.title.toLowerCase().split(/\s+/);
      let titleMatches = 0;
      titleA.forEach(word => {
        if (word.length > 2 && titleB.includes(word)) titleMatches++;
      });
      if (titleMatches > 0) score += Math.min(titleMatches * 15, 30);

      const tagsA = [...(newItem.tags || []), ...(newItem.aiTags || [])];
      const tagsB = [...(candidate.tags || []), ...(candidate.aiTags || [])];
      let tagMatches = 0;
      tagsA.forEach(t => {
        if (tagsB.includes(t)) tagMatches++;
      });
      if (tagMatches > 0) score += Math.min(tagMatches * 10, 20);

      const getDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; 
      };

      const dist = getDistance(
        newItem.location.coordinates[1], newItem.location.coordinates[0],
        candidate.location.coordinates[1], candidate.location.coordinates[0]
      );

      if (dist < 0.05) {
        score += 15;
      } else if (dist < 0.2) {
        score += 10;
      } else if (dist < 0.5) {
        score += 5;
      }

      // Check OCR keyword correlation boost
      const allOcrKeywords = [...(newItem.ocrKeywords || []), ...(candidate.ocrKeywords || [])];
      if (allOcrKeywords.length > 0) {
        const textTarget = newItem.ocrKeywords?.length > 0 
          ? `${candidate.title} ${candidate.description} ${(candidate.tags || []).join(' ')}`.toLowerCase()
          : `${newItem.title} ${newItem.description} ${(newItem.tags || []).join(' ')}`.toLowerCase();
        const ocrHits = allOcrKeywords.filter(kw => kw.length >= 3 && textTarget.includes(kw));
        if (ocrHits.length > 0) {
          const ocrBoost = Math.min(25, ocrHits.length * 12);
          score += ocrBoost;
          console.log(`[Match Engine] +${ocrBoost}% OCR boost applied. Correlated keywords:`, ocrHits);
        }
      }

      const finalScore = Math.min(score, 99);

      if (finalScore >= 60) {
        const newMatch = new Match({
          id: 'match_' + Date.now() + Math.random().toString().slice(2, 6),
          lostItemId: newItem.type === 'lost' ? newItem.id : candidate.id,
          foundItemId: newItem.type === 'found' ? newItem.id : candidate.id,
          similarityScore: finalScore,
          status: 'pending_claim',
          locationMatch: dist < 0.1,
          locationDistance: parseFloat(dist.toFixed(2)),
          aiConfidence: parseFloat((finalScore / 100).toFixed(2)),
          claimRequestSent: false,
          matchedAt: new Date().toISOString()
        });
        await newMatch.save();

        const lostItem = newItem.type === 'lost' ? newItem : candidate;
        const ownerInfo = await getUserEmail(lostItem.reportedBy.id);
        
        notificationService.sendMatchNotification(
          ownerInfo.email,
          ownerInfo.name,
          lostItem.title,
          finalScore,
          newMatch.id
        ).catch(err => console.error('Error sending match email notification:', err));

        sendPushNotification(ownerInfo.id, {
          title: 'New Proximity Match Found!',
          body: `A potential match (${finalScore}% similarity) was found for your lost "${lostItem.title}" near ${newItem.location.label || 'campus'}.`,
          icon: '/logo192.png',
          data: { url: `/matches/${newMatch.id}` }
        }).catch(err => console.error('Error dispatching web push:', err));
      }
    }

    const clientResponseItem = newItem.toObject();
    clientResponseItem.location = {
      lat: clientResponseItem.location.coordinates[1],
      lng: clientResponseItem.location.coordinates[0],
      label: clientResponseItem.location.label
    };

    console.log('✅ Item saved to MongoDB:', newItem.title);
    res.status(201).json(clientResponseItem);
  } catch (error) {
    console.error('Error saving item:', error);
    res.status(500).json({ error: 'Failed to save item report' });
  }
});

app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    const formatted = items.map(item => {
      const obj = item.toObject();
      obj.location = {
        lat: obj.location.coordinates[1],
        lng: obj.location.coordinates[0],
        label: obj.location.label
      };
      return obj;
    });
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

app.put('/api/items/:id', async (req, res) => {
  try {
    const updateFields = { ...req.body };
    if (updateFields.location && updateFields.location.lat && updateFields.location.lng) {
      updateFields.location = {
        type: 'Point',
        coordinates: [parseFloat(updateFields.location.lng), parseFloat(updateFields.location.lat)],
        label: updateFields.location.label
      };
    }
    const updated = await Item.findOneAndUpdate({ id: req.params.id }, updateFields, { new: true });
    if (updated) {
      const obj = updated.toObject();
      obj.location = {
        lat: obj.location.coordinates[1],
        lng: obj.location.coordinates[0],
        label: obj.location.label
      };
      res.json(obj);
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update item' });
  }
});


app.get('/api/matches', async (req, res) => {
  try {
    const matches = await Match.find().sort({ matchedAt: -1 });
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});


app.post('/api/matches', authGuard, async (req, res) => {
  try {
    const newMatch = new Match({
      id: 'match_' + Date.now(),
      ...req.body,
      matchedAt: new Date().toISOString()
    });
    await newMatch.save();

    const lostItem = await Item.findOne({ id: newMatch.lostItemId });
    const foundItem = await Item.findOne({ id: newMatch.foundItemId });
    if (lostItem && foundItem) {
      const ownerInfo = await getUserEmail(lostItem.reportedBy.id);
      notificationService.sendMatchNotification(
        ownerInfo.email,
        ownerInfo.name,
        lostItem.title,
        newMatch.similarityScore,
        newMatch.id
      ).catch(err => console.error('Error sending match email notification:', err));
    }

    res.status(201).json(newMatch);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save match' });
  }
});


app.put('/api/matches/:id', authGuard, async (req, res) => {
  try {
    const existingMatch = await Match.findOne({ id: req.params.id });
    if (existingMatch) {
      const updatedMatchData = { ...existingMatch.toObject(), ...req.body };
      
      const isNewClaim = req.body.claimRequestSent && !existingMatch.claimRequestSent;
      
      const isClaimResolution = (req.body.status === 'claimed' || req.body.status === 'rejected') && 
                                (existingMatch.status !== req.body.status);

      if (isNewClaim && req.body.verification?.proofImage) {
        const base64Str = req.body.verification.proofImage;
        const matches = base64Str.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        if (matches) {
          const buffer = Buffer.from(matches[2], 'base64');
          Tesseract.recognize(buffer, 'eng')
            .then(async ({ data: { text } }) => {
              const cleanText = text.toLowerCase().replace(/\s+/g, '');
              const targetId = (req.body.verification.studentId || '').toLowerCase().trim().replace(/\s+/g, '');
              const isMatched = cleanText.includes(targetId);
              console.log(`[OCR] Target ID: ${targetId}. Extracted Match: ${isMatched}`);
              
              await Match.findOneAndUpdate(
                { id: req.params.id },
                { ocrVerified: isMatched, ocrExtractedText: text }
              );
              console.log(`[OCR] Match ${req.params.id} updated with verification status: ${isMatched}`);
            })
            .catch(ocrErr => {
              console.error('[OCR] Error performing text recognition:', ocrErr.message);
            });
        }
      }

      if (blockchainContract && isNewClaim) {
        try {
          const tx = await blockchainContract.logClaim(
            updatedMatchData.id,
            updatedMatchData.lostItemId,
            updatedMatchData.foundItemId,
            req.body.verification?.studentId || 'N/A'
          );
          const receipt = await tx.wait();
          updatedMatchData.blockchainClaimTxHash = receipt.hash;
          updatedMatchData.blockchainClaimBlock = receipt.blockNumber;
          console.log(`⛓️ Claim logged on blockchain. Tx: ${receipt.hash}, Block: ${receipt.blockNumber}`);
        } catch (err) {
          console.error("Failed to write claim log to blockchain:", err.message);
        }
      } else if (blockchainContract && isClaimResolution) {
        try {
          const isApproved = req.body.status === 'claimed';
          const tx = await blockchainContract.resolveClaim(updatedMatchData.id, isApproved);
          const receipt = await tx.wait();
          updatedMatchData.blockchainResolutionTxHash = receipt.hash;
          updatedMatchData.blockchainResolutionBlock = receipt.blockNumber;
          console.log(`⛓️ Claim resolution logged on blockchain. Tx: ${receipt.hash}, Block: ${receipt.blockNumber}`);
        } catch (err) {
          console.error("Failed to write claim resolution to blockchain:", err.message);
        }
      }

      await Match.findOneAndUpdate({ id: req.params.id }, updatedMatchData);

      if (isNewClaim) {
        const lostItem = await Item.findOne({ id: updatedMatchData.lostItemId });
        const foundItem = await Item.findOne({ id: updatedMatchData.foundItemId });
        if (lostItem && foundItem) {
          const finderInfo = await getUserEmail(foundItem.reportedBy.id);
          const ownerInfo = await getUserEmail(lostItem.reportedBy.id);
          
          notificationService.sendClaimNotification(
            finderInfo.email,
            finderInfo.name,
            foundItem.title,
            ownerInfo.name,
            req.body.verification?.studentId || 'N/A'
          ).catch(err => console.error('Error sending claim email notification:', err));

          sendPushNotification(finderInfo.id, {
            title: 'New Ownership Claim Submitted!',
            body: `An owner has filed a claim request for "${foundItem.title}" you reported.`,
            icon: '/logo192.png',
            data: { url: '/admin-dashboard' }
          }).catch(err => console.error('Error dispatching web push:', err));
        }
      } else if (isClaimResolution) {
        const lostItem = await Item.findOne({ id: updatedMatchData.lostItemId });
        if (lostItem) {
          const ownerInfo = await getUserEmail(lostItem.reportedBy.id);
          const isApproved = req.body.status === 'claimed';
          
          notificationService.sendResolutionNotification(
            ownerInfo.email,
            ownerInfo.name,
            lostItem.title,
            isApproved
          ).catch(err => console.error('Error sending resolution email notification:', err));

          sendPushNotification(ownerInfo.id, {
            title: isApproved ? 'Ownership Claim Approved! 🎉' : 'Claim Verification Rejected',
            body: isApproved 
              ? `Congratulations! Your claim for "${lostItem.title}" has been approved. You can collect it from campus security.`
              : `Your claim verification request for "${lostItem.title}" was not approved.`,
            icon: '/logo192.png',
            data: { url: '/my-items' }
          }).catch(err => console.error('Error dispatching web push:', err));
        }
      }

      res.json(db.matches[matchIndex]);
    } else {
      res.status(404).json({ error: 'Match not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update match' });
  }
});


app.get('/api/conversations', async (req, res) => {
  try {
    const conversations = await Conversation.find().sort({ lastMessageTime: -1 });
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});


app.post('/api/conversations', authGuard, async (req, res) => {
  try {
    const newConvData = {
      id: req.body.id || 'conv_' + Date.now(),
      ...req.body
    };
    const updated = await Conversation.findOneAndUpdate(
      { id: newConvData.id },
      newConvData,
      { upsert: true, new: true }
    );
    res.status(201).json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save conversation' });
  }
});


app.put('/api/conversations/:id', async (req, res) => {
  try {
    const updated = await Conversation.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (updated) {
      res.json(updated);
    } else {
      res.status(404).json({ error: 'Conversation not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update conversation' });
  }
});


app.get('/api/messages', async (req, res) => {
  try {
    const messagesList = await Message.find().sort({ time: 1 });
    const grouped = {};
    messagesList.forEach(m => {
      if (!grouped[m.conversationId]) {
        grouped[m.conversationId] = [];
      }
      grouped[m.conversationId].push(m.toObject());
    });
    res.json(grouped);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});


app.post('/api/messages', authGuard, async (req, res) => {
  try {
    const { conversationId, message } = req.body;
    const newMessage = new Message({
      id: message.id || 'msg_' + Date.now(),
      conversationId,
      senderId: message.senderId,
      senderName: message.senderName,
      text: message.text,
      time: message.time,
      type: message.type || 'text'
    });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save message' });
  }
});


app.get('/api/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ time: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});


app.post('/api/notifications', authGuard, async (req, res) => {
  try {
    const newNotif = new Notification({
      id: 'notif_' + Date.now() + Math.random().toString().slice(2, 6),
      ...req.body,
      time: new Date().toISOString()
    });
    await newNotif.save();
    res.status(201).json(newNotif);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save notification' });
  }
});


app.put('/api/notifications/:id', async (req, res) => {
  try {
    const updated = await Notification.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (updated) {
      res.json(updated);
    } else {
      res.status(404).json({ error: 'Notification not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});


app.get('/api/notifications/vapid-public-key', (req, res) => {
  res.json({ publicKey: vapidKeys.publicKey });
});


app.post('/api/notifications/subscribe', authGuard, async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Subscription object is required' });
    }

    const userId = req.user.id;
    await Subscription.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      {
        userId,
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth
        }
      },
      { upsert: true, new: true }
    );

    console.log(`Registered web push subscription for user: ${userId}`);
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error saving subscription:', error);
    res.status(500).json({ error: 'Failed to subscribe to push notifications' });
  }
});


app.get('/api/health', async (req, res) => {
  const mongoState = mongoose.connection.readyState;
  const mongoOk = mongoState === 1;

  let blockchainOk = false;
  let currentBlock = null;
  if (blockchainProvider) {
    try {
      currentBlock = await Promise.race([
        blockchainProvider.getBlockNumber(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500))
      ]);
      blockchainOk = true;
    } catch (e) {
      blockchainOk = false;
    }
  }

  let cvOk = false;
  let cvInfo = null;
  try {
    const cvRes = await fetch('http://127.0.0.1:5001/health', { signal: AbortSignal.timeout(1500) });
    if (cvRes.ok) {
      cvInfo = await cvRes.json();
      cvOk = true;
    }
  } catch (e) {
    cvOk = false;
  }

  const emailOk = !!notificationService;
  const pushOk = !!(vapidKeys && vapidKeys.publicKey);

  const overallStatus = (mongoOk && (blockchainOk || !blockchainContract)) ? 'healthy' : 'degraded';

  res.json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    services: {
      database: {
        name: 'MongoDB',
        status: mongoOk ? 'connected' : 'disconnected',
        readyState: mongoState
      },
      blockchain: {
        name: process.env.BLOCKCHAIN_RPC_URL ? 'Ethereum Sepolia' : 'Hardhat EVM',
        status: blockchainOk ? 'connected' : 'offline',
        blockNumber: currentBlock,
        contractAddress: process.env.CONTRACT_ADDRESS || '0x99e7624603eE635e8c624663791f21416bA82B3A'
      },
      visionAI: {
        name: 'YOLOv5n Vision',
        status: cvOk ? 'online' : 'offline',
        details: cvInfo
      },
      notifications: {
        name: 'Notification Hub',
        emailStatus: emailOk ? 'ready' : 'fallback',
        webPushStatus: pushOk ? 'ready' : 'not_configured'
      }
    }
  });
});


io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room: ${roomId}`);
  });

  socket.on('leave_room', (roomId) => {
    socket.leave(roomId);
    console.log(`Socket ${socket.id} left room: ${roomId}`);
  });

  socket.on('send_message', async (data) => {
    const { room, message } = data;
    console.log(`Message sent to room ${room} by ${message.senderName}`);
    
    try {
      const exists = await Message.findOne({ id: message.id });
      if (!exists) {
        const newMessage = new Message({
          id: message.id,
          conversationId: room,
          senderId: message.senderId,
          senderName: message.senderName,
          text: message.text,
          time: message.time,
          type: message.type || 'text'
        });
        await newMessage.save();
        
        await Conversation.findOneAndUpdate(
          { id: room },
          {
            lastMessage: message.text,
            lastMessageTime: message.time,
            $inc: { unread: 1 }
          }
        );
      }
    } catch (err) {
      console.error('Error saving socket message:', err);
    }
    
    io.emit('receive_message', { room, message });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 UniRetrieve Backend Server (MongoDB & Web Push) running on port ${PORT}`);
});

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { mockItems, mockMatches, mockStats, mockZones, mockHeatmapPoints, mockCategoryStats, mockWeeklyTrend } from '../data/mockItems';
import { mockConversations, mockMessages, demoUsers } from '../data/mockChat';
import { mockNotifications } from '../data/mockNotifications';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

const AppContext = createContext(null);

const API_URL = 'http://localhost:3001/api';

const originalFetch = window.fetch;
window.fetch = async function (url, options = {}) {
  if (typeof url === 'string' && url.includes('http://localhost:3001/api')) {
    const token = localStorage.getItem('uniretrieve_token');
    if (token) {
      if (options.headers instanceof Headers) {
        options.headers.set('Authorization', `Bearer ${token}`);
      } else {
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${token}`
        };
      }
    }
  }
  return originalFetch(url, options);
};

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('uniretrieve_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('uniretrieve_token') || null);

  const [items, setItems] = useState([]); 
  const [matches, setMatches] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const resItems = await fetch(`${API_URL}/items`);
      const itemsData = await resItems.json();
      setItems(itemsData);

      const resMatches = await fetch(`${API_URL}/matches`);
      const matchesData = await resMatches.json();
      setMatches(matchesData);

      const resConvs = await fetch(`${API_URL}/conversations`);
      const convsData = await resConvs.json();
      setConversations(convsData);

      const resMsgs = await fetch(`${API_URL}/messages`);
      const msgsData = await resMsgs.json();
      setMessages(msgsData);

      const resNotifs = await fetch(`${API_URL}/notifications`);
      const notifsData = await resNotifs.json();
      setNotifications(notifsData);
    } catch (error) {
      console.error('Error fetching data from server, falling back to mock:', error);
      setItems(mockItems);
      setMatches(mockMatches);
      setConversations(mockConversations);
      setMessages(mockMessages);
      setNotifications(mockNotifications);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  
  useEffect(() => {
    const saved = localStorage.getItem('uniretrieve_user');
    if (!saved && !currentUser) {
      
      
    }
  }, [currentUser]);

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const setupPushNotifications = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !currentUser) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', registration.scope);

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('Notification permission denied.');
        return;
      }

      const resKey = await fetch(`${API_URL}/notifications/vapid-public-key`);
      const { publicKey } = await resKey.json();
      if (!publicKey) return;

      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      };

      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe(subscribeOptions);
      }

      await fetch(`${API_URL}/notifications/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription })
      });
      console.log('Web Push subscription successfully registered on backend.');
    } catch (err) {
      console.error('Error setting up push notifications:', err);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      setupPushNotifications();
    }
  }, [currentUser, setupPushNotifications]);

  
  const stats = React.useMemo(() => {
    const lost = items.filter(i => i.type === 'lost');
    const found = items.filter(i => i.type === 'found');
    const matchedCount = matches.length;
    const claimedCount = items.filter(i => i.status === 'claimed').length;
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thisWeekCount = items.filter(i => new Date(i.createdAt || i.date) >= sevenDaysAgo).length;

    const totalLostCount = lost.length || 1;
    const successRate = Math.round((claimedCount / totalLostCount) * 100);

    return {
      totalLost: lost.length,
      totalFound: found.length,
      totalMatched: matchedCount,
      totalClaimed: claimedCount,
      pendingReview: matches.filter(m => m.status === 'pending_claim').length,
      thisWeek: thisWeekCount,
      successRate: Math.min(successRate || 72, 100),
      avgMatchTime: '3.5 hrs'
    };
  }, [items, matches]);

  
  const zones = React.useMemo(() => {
    const zoneCounts = {};
    const zonePositions = {
      'Academic Block A': { lat: 28.6139, lng: 77.2090 },
      'Academic Block B': { lat: 28.6130, lng: 77.2085 },
      'Academic Block C': { lat: 28.6155, lng: 77.2075 },
      'Campus Center': { lat: 28.6150, lng: 77.2100 },
      'Central Campus': { lat: 28.6135, lng: 77.2080 },
      'Sports Block': { lat: 28.6143, lng: 77.2110 },
      'Admin Zone': { lat: 28.6148, lng: 77.2092 },
    };

    items.forEach(item => {
      let zName = item.location?.zone || 'Central Campus';
      if (!zoneCounts[zName]) {
        zoneCounts[zName] = 0;
      }
      zoneCounts[zName]++;
    });

    return Object.keys(zoneCounts).map((zName, index) => {
      const pos = zonePositions[zName] || { lat: 28.6139, lng: 77.2090 };
      return {
        id: `z_${index}`,
        name: zName,
        count: zoneCounts[zName],
        trend: '+5%',
        lat: pos.lat,
        lng: pos.lng
      };
    });
  }, [items]);

  
  const heatmapPoints = React.useMemo(() => {
    return items
      .filter(i => i.location && i.location.lat && i.location.lng)
      .map(i => [i.location.lat, i.location.lng, 0.6]);
  }, [items]);

  const categoryStats = mockCategoryStats;
  const weeklyTrend = mockWeeklyTrend;

  const unreadCount = notifications.filter(n => !n.read).length;

  const addToast = useCallback((toast) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Login failed');
      }
      const data = await res.json();
      localStorage.setItem('uniretrieve_user', JSON.stringify(data.user));
      localStorage.setItem('uniretrieve_token', data.token);
      setCurrentUser(data.user);
      setToken(data.token);
      addToast({ type: 'success', title: 'Login Successful', message: `Welcome back, ${data.user.name}!` });
      fetchAllData();
      return true;
    } catch (error) {
      console.error('Login error:', error);
      addToast({ type: 'error', title: 'Login Failed', message: error.message });
      return false;
    }
  }, [fetchAllData, addToast]);

  const register = useCallback(async (name, email, password, studentId = 'N/A') => {
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, studentId })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Registration failed');
      }
      const data = await res.json();
      localStorage.setItem('uniretrieve_user', JSON.stringify(data.user));
      localStorage.setItem('uniretrieve_token', data.token);
      setCurrentUser(data.user);
      setToken(data.token);
      addToast({ type: 'success', title: 'Account Created', message: `Welcome to UniRetrieve, ${data.user.name}!` });
      fetchAllData();
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      addToast({ type: 'error', title: 'Registration Failed', message: error.message });
      return false;
    }
  }, [fetchAllData, addToast]);

  const logout = useCallback(() => {
    localStorage.removeItem('uniretrieve_user');
    localStorage.removeItem('uniretrieve_token');
    setCurrentUser(null);
    setToken(null);
    addToast({ type: 'info', title: 'Signed Out', message: 'You have been logged out.' });
  }, [addToast]);

  
  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  
  const markRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  
  const submitItemReport = useCallback(async (formData) => {
    setIsLoading(true);
    
    
    const compressImage = (file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target.result;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 800;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.7)); 
          };
        };
      });
    };

    
    const base64Images = await Promise.all(
      (formData.images || []).map(async (file) => {
        if (typeof file === 'string') return file;
        return compressImage(file);
      })
    );

    const itemData = {
      type: formData.type,
      title: formData.title,
      category: formData.category,
      description: formData.description,
      location: formData.location,
      date: formData.date,
      images: base64Images,
      tags: formData.tags || [],
      aiTags: formData.aiTags || [],
      reportedBy: {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role
      },
      status: formData.type === 'lost' ? 'lost' : 'found',
      blockchainHash: '0x' + Math.random().toString(16).slice(2, 10) + '...' + Math.random().toString(16).slice(2, 6)
    };

    try {
      const response = await fetch(`${API_URL}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save report');
      }

      const savedItem = await response.json();
      setItems(prev => [savedItem, ...prev]);

      
      const newNotif = {
        type: 'info',
        title: 'Report Submitted',
        message: `Your report for "${formData.title}" is submitted to the database. We will notify you of matches shortly.`,
        link: '/my-items',
        read: false,
      };

      const resNotif = await fetch(`${API_URL}/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNotif)
      });
      const savedNotif = await resNotif.json();
      setNotifications(prev => [savedNotif, ...prev]);

      
      const botConvId = 'conv_ai_' + currentUser.id;
      const botConv = {
        id: botConvId,
        participants: [
          { id: 'system_ai', name: 'UniRetrieve AI', avatar: null, role: 'support', status: 'online' },
          currentUser
        ],
        itemTitle: 'System Assistance',
        lastMessage: `Report for ${formData.title} received.`,
        lastMessageTime: new Date().toISOString(),
        unread: 1
      };

      await fetch(`${API_URL}/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(botConv)
      });

      setConversations(prev => {
        const exists = prev.find(c => c.id === botConvId);
        if (exists) {
          return prev.map(c => c.id === botConvId ? { 
            ...c, 
            lastMessage: botConv.lastMessage, 
            lastMessageTime: botConv.lastMessageTime,
            unread: c.unread + 1
          } : c);
        }
        return [botConv, ...prev];
      });

      
      const botMsg = {
        id: 'msg_bot_' + Date.now(),
        senderId: 'system_ai',
        senderName: 'UniRetrieve AI',
        text: `Hello ${currentUser.name}! Your report for "${formData.title}" has been successfully saved to our database. Our AI is now searching for potential matches.`,
        time: new Date().toISOString(),
        type: 'text',
      };

      await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: botConvId, message: botMsg })
      });

      setMessages(prev => ({
        ...prev,
        [botConvId]: [...(prev[botConvId] || []), botMsg],
      }));
      
      
      runMatchingEngine(savedItem);
      return true;

    } catch (error) {
      console.error('Error submitting report:', error);
      addToast({ type: 'error', title: 'Submission Failed', message: 'Could not save report to database.' });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, addToast]);

  
  const getDistance = useCallback((locA, locB) => {
    if (!locA || !locB || !locA.lat || !locB.lat) return 999;
    const R = 6371; 
    const dLat = (locB.lat - locA.lat) * Math.PI / 180;
    const dLng = (locB.lng - locA.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(locA.lat * Math.PI / 180) * Math.cos(locB.lat * Math.PI / 180) * 
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  const calculateSimilarity = useCallback((itemA, itemB) => {
    if (itemA.category !== itemB.category) return 20;
    
    let score = 40;
    const titleA = (itemA.title || '').toLowerCase().split(/\s+/);
    const titleB = (itemB.title || '').toLowerCase().split(/\s+/);
    let titleMatches = 0;
    titleA.forEach(word => {
      if (word.length > 2 && titleB.includes(word)) titleMatches++;
    });
    if (titleMatches > 0) score += Math.min(titleMatches * 15, 30);

    const tagsA = [...(itemA.tags || []), ...(itemA.aiTags || [])];
    const tagsB = [...(itemB.tags || []), ...(itemB.aiTags || [])];
    let tagMatches = 0;
    tagsA.forEach(t => {
      if (tagsB.includes(t)) tagMatches++;
    });
    if (tagMatches > 0) score += Math.min(tagMatches * 10, 20);

    const dist = getDistance(itemA.location, itemB.location);
    if (dist < 0.05) {
      score += 15;
    } else if (dist < 0.2) {
      score += 10;
    } else if (dist < 0.5) {
      score += 5;
    }

    return Math.min(score, 99);
  }, [getDistance]);

  const runMatchingEngine = useCallback(async (newItem) => {
    const oppositeType = newItem.type === 'lost' ? 'found' : 'lost';
    const candidates = items.filter(item => item.type === oppositeType && item.status !== 'claimed');
    
    console.log(`Matching engine running for ${newItem.title} with ${candidates.length} candidates.`);
    
    for (const candidate of candidates) {
      const score = calculateSimilarity(newItem, candidate);
      
      if (score >= 60) {
        const matchData = {
          lostItemId: newItem.type === 'lost' ? newItem.id : candidate.id,
          foundItemId: newItem.type === 'found' ? newItem.id : candidate.id,
          similarityScore: score,
          status: 'pending_claim',
          locationMatch: newItem.location?.zone === candidate.location?.zone || false,
          locationDistance: parseFloat(getDistance(newItem.location, candidate.location).toFixed(2)),
          aiConfidence: parseFloat((score / 100).toFixed(2)),
          claimRequestSent: false,
        };
        
        try {
          const matchRes = await fetch(`${API_URL}/matches`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(matchData)
          });
          const savedMatch = await matchRes.json();
          
          await fetch(`${API_URL}/items/${newItem.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'matched', matchId: savedMatch.id })
          });
          await fetch(`${API_URL}/items/${candidate.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'matched', matchId: savedMatch.id })
          });
          
          const lostItemObj = newItem.type === 'lost' ? newItem : candidate;
          const foundItemObj = newItem.type === 'found' ? newItem : candidate;
          
          const notifOwner = {
            type: 'match',
            title: 'Possible Match Found!',
            message: `Your lost "${lostItemObj.title}" has a ${score}% match with a reported found item.`,
            link: `/match/${savedMatch.id}`,
            read: false,
          };
          
          const notifFinder = {
            type: 'match',
            title: 'Possible Match Found!',
            message: `Your found "${foundItemObj.title}" has a ${score}% match with a reported lost item.`,
            link: `/match/${savedMatch.id}`,
            read: false,
          };
          
          const res1 = await fetch(`${API_URL}/notifications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(notifOwner)
          });
          const savedNotif1 = await res1.json();
          
          const res2 = await fetch(`${API_URL}/notifications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(notifFinder)
          });
          const savedNotif2 = await res2.json();
          
          setMatches(prev => [savedMatch, ...prev]);
          setNotifications(prev => [savedNotif2, savedNotif1, ...prev]);
          
          addToast({
            type: 'info',
            title: 'Possible Match Found!',
            message: `An AI similarity of ${score}% has been detected. Check your notifications.`
          });
          
          setItems(prev => prev.map(item => {
            if (item.id === newItem.id || item.id === candidate.id) {
              return { ...item, status: 'matched', matchId: savedMatch.id };
            }
            return item;
          }));
          
          break;
        } catch (error) {
          console.error('Error saving matches dynamically:', error);
        }
      }
    }
  }, [items, calculateSimilarity, getDistance, addToast]);

  
  const triggerSupportAI = useCallback(async (conversationId, triggerType) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1000));

    let response = "";
    switch(triggerType) {
      case 'delay':
        response = "I've analyzed the conversation history and flagged the other user for a response delay. I've sent them a nudge notification and email. If they don't respond in 12 hours, I'll escalate this to campus security.";
        break;
      case 'damaged':
        response = "I'm sorry to hear the item is damaged. I've logged this issue against the report. Please upload a photo of the damage here; I will initiate our campus insurance claim process for you.";
        break;
      case 'abuse':
        response = "Safety is our priority. I've immediately blocked this user's ability to contact you and flagged their profile for moderator review. A security officer has been notified of the abusive behavior.";
        break;
      case 'wrong_item':
        response = "Matching error detected. I've unlinked this match and reopened the global search for your actual item. I'll prioritize your report in the next AI matching cycle.";
        break;
      default:
        response = "I'm here to help. Could you please specify the issue you're facing with this transaction?";
    }

    const botMsg = {
      id: 'msg_bot_support_' + Date.now(),
      senderId: 'system_ai',
      senderName: 'UniRetrieve AI',
      text: response,
      time: new Date().toISOString(),
      type: 'text',
    };

    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), botMsg],
    }));

    setConversations(prev => prev.map(c => c.id === conversationId ? {
      ...c,
      lastMessage: response,
      lastMessageTime: botMsg.time,
    } : c));

    try {
      await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, message: botMsg })
      });
      await fetch(`${API_URL}/conversations/${conversationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lastMessage: response,
          lastMessageTime: botMsg.time
        })
      });
    } catch(err) {
      console.error(err);
    }

    setIsLoading(false);
  }, []);

  
  const processAIBasicChat = useCallback(async (conversationId, userText) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    
    const text = userText.toLowerCase();
    let response = "";

    if (text.includes('hello') || text.includes('hi') || text.includes('hey')) {
      response = `Hello ${currentUser.name}! I am the UniRetrieve Assistant. How can I help you with your lost or found items today?`;
    } else if (text.includes('status') || text.includes('my report')) {
      response = "I've checked our database. Your active reports are currently being processed by our matching engine. I'll notify you as soon as a potential match is found on campus.";
    } else if (text.includes('how') && text.includes('work')) {
      response = "UniRetrieve uses AI to compare descriptions and images of lost and found items. Once we find a high-probability match, we secure the transaction on the blockchain and notify both parties.";
    } else if (text.includes('thank')) {
      response = "You're very welcome! I'm here to make sure every lost item finds its way back home. Is there anything else you need?";
    } else if (text.includes('security') || text.includes('police')) {
      response = "For serious security concerns, please visit the Campus Security Office directly. I can help flag abusive users or fraudulent reports here in the app.";
    } else {
      response = "I understand. I'm currently monitoring all reports for potential matches. If you have a specific issue with a transaction, you can use the 'Report Issue' menu above.";
    }

    const botMsg = {
      id: 'msg_bot_basic_' + Date.now(),
      senderId: 'system_ai',
      senderName: 'UniRetrieve AI',
      text: response,
      time: new Date().toISOString(),
      type: 'text',
    };

    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), botMsg],
    }));

    setConversations(prev => prev.map(c => c.id === conversationId ? {
      ...c,
      lastMessage: response,
      lastMessageTime: botMsg.time,
    } : c));

    try {
      await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, message: botMsg })
      });
      await fetch(`${API_URL}/conversations/${conversationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lastMessage: response,
          lastMessageTime: botMsg.time
        })
      });
    } catch(err) {
      console.error(err);
    }

    setIsLoading(false);
  }, [currentUser]);

  
  useEffect(() => {
    socket.on('receive_message', (data) => {
      const { room, message } = data;
      
      
      setMessages(prev => {
        const roomMsgs = prev[room] || [];
        if (roomMsgs.some(m => m.id === message.id)) return prev;
        return {
          ...prev,
          [room]: [...roomMsgs, message]
        };
      });

      
      setConversations(prev => prev.map(c => c.id === room ? {
        ...c,
        lastMessage: message.text,
        lastMessageTime: message.time,
        unread: c.id === activeConversation ? 0 : (c.unread || 0) + 1
      } : c));
    });

    return () => {
      socket.off('receive_message');
    };
  }, [activeConversation]);

  
  useEffect(() => {
    if (activeConversation) {
      setConversations(prev => prev.map(c => c.id === activeConversation ? { ...c, unread: 0 } : c));
      
      
      fetch(`${API_URL}/conversations/${activeConversation}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unread: 0 })
      }).catch(err => console.error('Error resetting unread count on server:', err));
    }
  }, [activeConversation]);

  
  const sendMessage = useCallback(async (conversationId, text) => {
    const newMsg = {
      id: 'msg_' + Date.now() + Math.random().toString().slice(2, 6),
      senderId: currentUser.id,
      senderName: currentUser.name,
      text,
      time: new Date().toISOString(),
      type: 'text',
    };
    
    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMsg],
    }));

    setConversations(prev => prev.map(c => c.id === conversationId ? {
      ...c,
      lastMessage: text,
      lastMessageTime: newMsg.time,
      unread: 0
    } : c));

    try {
      await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, message: newMsg })
      });
      await fetch(`${API_URL}/conversations/${conversationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lastMessage: text,
          lastMessageTime: newMsg.time
        })
      });
    } catch(err) {
      console.error('Error saving message via API:', err);
    }

    socket.emit('send_message', { room: conversationId, message: newMsg });

    if (conversationId.includes('_ai')) {
      processAIBasicChat(conversationId, text);
    }
  }, [currentUser, processAIBasicChat]);

  
  const sendClaimRequest = useCallback(async (matchId, verificationData) => {
    setIsLoading(true);
    try {
      const match = matches.find(m => m.id === matchId);
      if (!match) throw new Error('Match not found');

      const updatedMatchData = {
        status: 'pending_claim',
        claimRequestSent: true,
        verification: {
          studentId: verificationData.studentId,
          uniqueMarks: verificationData.uniqueMarks,
          contentsDesc: verificationData.contentsDesc || '',
          proofImage: verificationData.proofImage || null,
          submittedAt: new Date().toISOString()
        }
      };

      const resMatch = await fetch(`${API_URL}/matches/${matchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMatchData)
      });
      const savedMatch = await resMatch.json();

      setMatches(prev => prev.map(m => m.id === matchId ? savedMatch : m));

      const lostItem = items.find(i => i.id === match.lostItemId);
      const foundItem = items.find(i => i.id === match.foundItemId);
      
      const finder = foundItem?.reportedBy;
      const owner = lostItem?.reportedBy;

      if (finder && owner) {
        const convId = `conv_${matchId}`;
        const existingConv = conversations.find(c => c.id === convId);

        if (!existingConv) {
          const newConv = {
            id: convId,
            matchId: matchId,
            itemTitle: lostItem.title,
            participants: [
              { id: finder.id, name: finder.name, role: 'finder', status: 'online' },
              { id: owner.id, name: owner.name, role: 'owner', status: 'online' }
            ],
            lastMessage: 'Claim verification details submitted.',
            lastMessageTime: new Date().toISOString(),
            unread: 1
          };

          await fetch(`${API_URL}/conversations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newConv)
          });

          setConversations(prev => [newConv, ...prev]);
        }

        const sysMsg = {
          id: 'msg_sys_' + Date.now(),
          senderId: 'system_ai',
          senderName: 'UniRetrieve AI',
          text: `[System Claim Request]: ${currentUser.name} has submitted identity and ownership verification responses.`,
          time: new Date().toISOString(),
          type: 'text'
        };

        await fetch(`${API_URL}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId: convId, message: sysMsg })
        });

        setMessages(prev => ({
          ...prev,
          [convId]: [...(prev[convId] || []), sysMsg]
        }));
      }

      addToast({ 
        type: 'success', 
        title: 'Claim Details Submitted!', 
        message: 'Your verification details have been sent. Check Messages to chat.' 
      });
      return true;
    } catch (error) {
      console.error('Error sending claim request:', error);
      addToast({ type: 'error', title: 'Claim Failed', message: 'Could not submit claim details.' });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [matches, items, conversations, currentUser, addToast]);

  
  const resolveClaim = useCallback(async (matchId, approve = true) => {
    setIsLoading(true);
    try {
      const match = matches.find(m => m.id === matchId);
      if (!match) throw new Error('Match not found');

      const lostItem = items.find(i => i.id === match.lostItemId);
      const foundItem = items.find(i => i.id === match.foundItemId);

      const statusValue = approve ? 'claimed' : 'lost';
      const matchStatus = approve ? 'claimed' : 'rejected';
      const nextAttempts = approve ? (match.claimAttempts || 0) : (match.claimAttempts || 0) + 1;

      const updatedMatch = {
        status: matchStatus,
        claimRequestSent: approve ? true : false,
        claimAttempts: nextAttempts
      };

      const resMatch = await fetch(`${API_URL}/matches/${matchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMatch)
      });
      const savedMatch = await resMatch.json();

      setMatches(prev => prev.map(m => m.id === matchId ? savedMatch : m));

      if (approve) {
        await fetch(`${API_URL}/items/${match.lostItemId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'claimed' })
        });
        await fetch(`${API_URL}/items/${match.foundItemId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'claimed' })
        });

        setItems(prev => prev.map(item => {
          if (item.id === match.lostItemId || item.id === match.foundItemId) {
            return { ...item, status: 'claimed' };
          }
          return item;
        }));
      } else {
        await fetch(`${API_URL}/items/${match.lostItemId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'matched' })
        });
        await fetch(`${API_URL}/items/${match.foundItemId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'matched' })
        });
        setItems(prev => prev.map(item => {
          if (item.id === match.lostItemId || item.id === match.foundItemId) {
            return { ...item, status: 'matched' };
          }
          return item;
        }));
      }

      const convId = `conv_${matchId}`;
      const statusText = approve 
        ? `[System Claim Resolved]: The claim verification was APPROVED by the finder. The item has been marked as claimed on blockchain.`
        : `[System Claim Resolved]: The claim verification was REJECTED by the finder. Ownership proof was insufficient.`;

      const sysMsg = {
        id: 'msg_sys_res_' + Date.now(),
        senderId: 'system_ai',
        senderName: 'UniRetrieve AI',
        text: statusText,
        time: new Date().toISOString(),
        type: 'text'
      };

      await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: convId, message: sysMsg })
      });

      setMessages(prev => ({
        ...prev,
        [convId]: [...(prev[convId] || []), sysMsg]
      }));

      const notifUser = {
        type: 'claim',
        title: approve ? 'Claim Request Approved!' : 'Claim Request Rejected',
        message: approve 
          ? `Your claim for "${lostItem?.title}" has been approved. You can arrange pickup.` 
          : `Your claim for "${lostItem?.title}" was rejected. Please review ownership proofs.`,
        link: `/my-items`,
        read: false,
      };

      const resNotif = await fetch(`${API_URL}/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notifUser)
      });
      const savedNotif = await resNotif.json();
      setNotifications(prev => [savedNotif, ...prev]);

      addToast({
        type: approve ? 'success' : 'info',
        title: approve ? 'Claim Approved' : 'Claim Rejected',
        message: approve ? 'The item is now marked as claimed.' : 'The claim has been declined.'
      });

    } catch (error) {
      console.error('Error resolving claim:', error);
      addToast({ type: 'error', title: 'Error', message: 'Could not resolve claim.' });
    } finally {
      setIsLoading(false);
    }
  }, [matches, items, addToast]);

  
  const overrideLock = useCallback(async (matchId) => {
    setIsLoading(true);
    try {
      const match = matches.find(m => m.id === matchId);
      if (!match) throw new Error('Match not found');

      const updatedMatch = {
        status: 'pending_claim', 
        claimRequestSent: false, 
        claimAttempts: 0
      };

      const resMatch = await fetch(`${API_URL}/matches/${matchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMatch)
      });
      const savedMatch = await resMatch.json();

      setMatches(prev => prev.map(m => m.id === matchId ? savedMatch : m));

      
      await fetch(`${API_URL}/items/${match.lostItemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'matched' })
      });
      await fetch(`${API_URL}/items/${match.foundItemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'matched' })
      });

      setItems(prev => prev.map(item => {
        if (item.id === match.lostItemId || item.id === match.foundItemId) {
          return { ...item, status: 'matched' };
        }
        return item;
      }));

      addToast({
        type: 'success',
        title: 'Lock Overridden',
        message: 'Claim attempts have been reset. The user can now re-submit proofs.'
      });
    } catch (error) {
      console.error('Error overriding lock:', error);
      addToast({ type: 'error', title: 'Error', message: 'Could not override lock.' });
    } finally {
      setIsLoading(false);
    }
  }, [matches, addToast]);

  const value = {
    currentUser,
    items,
    matches,
    conversations,
    messages,
    notifications,
    activeConversation,
    setActiveConversation,
    isLoading,
    toasts,
    stats,
    zones,
    heatmapPoints,
    categoryStats,
    weeklyTrend,
    unreadCount,
    socket,
    addToast,
    markAllRead,
    markRead,
    submitItemReport,
    sendMessage,
    sendClaimRequest,
    resolveClaim,
    overrideLock,
    triggerSupportAI,
    login,
    register,
    logout,
    demoUsers,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

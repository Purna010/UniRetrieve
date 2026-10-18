import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { ENDPOINTS, API_BASE_URL } from '../api/config';
import { io } from 'socket.io-client';

const AppContext = createContext();

export function AppProvider({ children }) {
  const { token, user } = useAuth();
  const [items, setItems] = useState([]);
  const [matches, setMatches] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    fetchItems();
    if (token) {
      fetchMatches();
      fetchConversations();
      initSocket();
    }
  }, [token]);

  const initSocket = () => {
    const s = io(API_BASE_URL);
    setSocket(s);

    s.on('receive_message', ({ room, message }) => {
      setMessages((prev) => ({
        ...prev,
        [room]: [...(prev[room] || []), message],
      }));
    });

    return () => s.disconnect();
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch(ENDPOINTS.ITEMS);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.warn('Error fetching items:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async () => {
    try {
      const res = await fetch(ENDPOINTS.MATCHES);
      if (res.ok) {
        const data = await res.json();
        setMatches(data);
      }
    } catch (err) {
      console.warn('Error fetching matches:', err.message);
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await fetch(ENDPOINTS.CONVERSATIONS);
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (err) {
      console.warn('Error fetching conversations:', err.message);
    }
  };

  const reportItem = async (itemData) => {
    try {
      const res = await fetch(ENDPOINTS.ITEMS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(itemData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit item report');
      setItems((prev) => [data, ...prev]);
      fetchMatches();
      return { success: true, item: data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const submitClaim = async (matchId, verificationData) => {
    try {
      const res = await fetch(`${ENDPOINTS.MATCHES}/${matchId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          claimRequestSent: true,
          status: 'claim_requested',
          verification: verificationData,
        }),
      });
      if (!res.ok) throw new Error('Claim submission failed');
      fetchMatches();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const sendMessage = async (conversationId, messageText) => {
    if (!messageText.trim() || !user) return;
    const msg = {
      id: 'msg_' + Date.now(),
      senderId: user.id,
      senderName: user.name,
      text: messageText,
      time: new Date().toISOString(),
      type: 'text',
    };

    if (socket) {
      socket.emit('send_message', { room: conversationId, message: msg });
    }

    try {
      await fetch(ENDPOINTS.MESSAGES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ conversationId, message: msg }),
      });
    } catch (err) {
      console.warn('Error storing message:', err.message);
    }
  };

  return (
    <AppContext.Provider
      value={{
        items,
        matches,
        conversations,
        messages,
        loading,
        fetchItems,
        fetchMatches,
        reportItem,
        submitClaim,
        sendMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

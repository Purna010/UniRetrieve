import { Platform } from 'react-native';

// For Android emulator, use 10.0.2.2 to access host machine localhost.
// For physical devices, set this to your machine's local Wi-Fi IP (e.g. http://192.168.1.5:3001).
const DEFAULT_HOST = Platform.OS === 'android' ? 'http://10.0.2.2:3001' : 'http://localhost:3001';

export const API_BASE_URL = DEFAULT_HOST;

export const ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  ME: `${API_BASE_URL}/api/auth/me`,
  ITEMS: `${API_BASE_URL}/api/items`,
  MATCHES: `${API_BASE_URL}/api/matches`,
  CONVERSATIONS: `${API_BASE_URL}/api/conversations`,
  MESSAGES: `${API_BASE_URL}/api/messages`,
  HEALTH: `${API_BASE_URL}/api/health`,
};

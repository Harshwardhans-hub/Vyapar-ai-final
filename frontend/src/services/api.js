import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// ─── JWT Token Management ────────────────────────────────────
function getToken() {
  return localStorage.getItem('vyapar_ai_token');
}

function setToken(token) {
  localStorage.setItem('vyapar_ai_token', token);
}

function clearToken() {
  localStorage.removeItem('vyapar_ai_token');
}

// Attach token to every request if present
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Error Interceptor ───────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;

    // Structured error object
    const apiError = {
      status,
      code: data?.code || 'UNKNOWN_ERROR',
      message: data?.error || error.message,
      isNetwork: !error.response,
      isRateLimit: status === 429,
      isAuth: status === 401,
    };

    // Auto-clear token on auth failure
    if (apiError.isAuth) {
      clearToken();
    }

    console.warn(`[Vyapar AI] ${apiError.code}: ${apiError.message}`);
    return Promise.reject(apiError);
  }
);

// ─── Auth ────────────────────────────────────────────────────
export const authenticate = async (email, role = 'customer') => {
  const res = await api.post('/api/auth/token', { email, role });
  if (res.data.token) {
    setToken(res.data.token);
  }
  return res.data;
};

export const logout = () => {
  clearToken();
};

// ─── Recommendations ────────────────────────────────────────
export const getRecommendations = async (query, mood = 'Comfort', preferences = {}) => {
  const res = await api.post('/api/recommend', { query, mood, preferences });
  return res.data;
};

// ─── Chat ────────────────────────────────────────────────────
export const sendChatMessage = async (message, context = {}) => {
  const res = await api.post('/api/chat', { message, context });
  return res.data;
};

// ─── Event Tracking (fire & forget — never throws) ──────────
export const trackEvent = async (eventType, catalogId = null, metadata = {}) => {
  try {
    await api.post('/api/event', {
      event_type: eventType,
      catalog_id: catalogId,
      metadata,
      session_id: getSessionId(),
    });
  } catch (e) {
    // Silent fail for tracking — don't break UX
  }
};

// ─── Social Proof ────────────────────────────────────────────
export const getSocialProof = async (ids = []) => {
  const params = ids.length ? `?ids=${ids.join(',')}` : '';
  const res = await api.get(`/api/social-proof${params}`);
  return res.data;
};

// ─── Analytics ───────────────────────────────────────────────
export const getAnalytics = async (days = 7) => {
  const res = await api.get(`/api/analytics?days=${days}`);
  return res.data;
};

// ─── Catalog (with pagination) ───────────────────────────────
export const getCatalog = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await api.get(`/api/catalog?${params}`);
  return res.data;
};

// ─── Session ID ──────────────────────────────────────────────
function getSessionId() {
  let sid = sessionStorage.getItem('vyapar_ai_session');
  if (!sid) {
    sid = `ses_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem('vyapar_ai_session', sid);
  }
  return sid;
}

// ─── Season Detection ────────────────────────────────────────
export function getCurrentSeason() {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'Spring';
  if (month >= 6 && month <= 8) return 'Summer';
  if (month >= 9 && month <= 11) return 'Autumn';
  return 'Winter';
}

export function getSeasonEmoji(season) {
  const map = { Spring: '🌸', Summer: '☀️', Autumn: '🍂', Winter: '❄️' };
  return map[season] || '🌍';
}

export function getSeasonGradient(season) {
  const map = {
    Spring: 'from-green-400 to-emerald-600',
    Summer: 'from-yellow-400 to-orange-500',
    Autumn: 'from-orange-400 to-red-600',
    Winter: 'from-blue-400 to-indigo-600',
  };
  return map[season] || 'from-primary-500 to-primary-700';
}

export default api;

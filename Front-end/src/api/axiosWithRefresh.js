import axios from 'axios';


const API_BASE = 'https://pais-production.up.railway.app';

const refreshClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

let refreshPromise = null;

export function clearAuthStorage() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('role');
  localStorage.removeItem('user');
}

function notifySessionExpired() {
  window.dispatchEvent(new CustomEvent('pais:session-expired'));
}

async function runRefresh() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token');
  }

  const { data } = await refreshClient.post('/api/auth/refresh', { refreshToken });

  if (!data?.success || !data?.data?.accessToken) {
    throw new Error('Invalid refresh response');
  }

  const { accessToken, refreshToken: newRefresh } = data.data;
  localStorage.setItem('accessToken', accessToken);
  if (newRefresh) {
    localStorage.setItem('refreshToken', newRefresh);
  }

  return accessToken;
}

function getSharedRefreshPromise() {
  if (!refreshPromise) {
    refreshPromise = runRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    if (originalRequest._retryAfterRefresh) {
      return Promise.reject(error);
    }

    const authHeader = originalRequest.headers?.Authorization;
    if (!authHeader || !String(authHeader).startsWith('Bearer ')) {
      return Promise.reject(error);
    }

    if (!localStorage.getItem('refreshToken')) {
      clearAuthStorage();
      notifySessionExpired();
      return Promise.reject(error);
    }

    try {
      const accessToken = await getSharedRefreshPromise();
      originalRequest._retryAfterRefresh = true;
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return axios(originalRequest);
    } catch {
      clearAuthStorage();
      notifySessionExpired();
      return Promise.reject(error);
    }
  }
);

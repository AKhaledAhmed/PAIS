import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { clearAuthStorage } from '../api/axiosWithRefresh';

const AuthContext = createContext();

const API_BASE = 'https://pais-production.up.railway.app';

/** Backend / older sessions may use different role strings */
export function normalizeRole(r) {
  if (r == null || r === '') return null;
  const x = String(r).trim().toLowerCase();
  if (x === 'patient' || x === 'user') return 'client';
  return x;
}

/** Default app entry for each role (session already in localStorage). */
export function getDashboardPathForRole(role) {
  const r = normalizeRole(role);
  if (r === 'admin') return '/admin';
  if (r === 'pharmacy') return '/pharmacist';
  if (r === 'client') return '/find-medicine';
  return null;
}

/**
 * Login payloads differ: some APIs return `client`, others `user` / nested `data`.
 */
function pickUserFromAuthPayload(authData, userRole) {
  if (!authData || typeof authData !== 'object') return null;
  const role = normalizeRole(userRole);
  const nested = authData.data && typeof authData.data === 'object' ? authData.data : null;

  const fromNested =
    nested &&
    (nested.client || nested.user || nested.patient || nested.pharmacy || nested.admin);

  const direct =
    authData.client ||
    authData.user ||
    authData.patient ||
    authData.pharmacy ||
    authData.admin ||
    fromNested;

  if (direct && typeof direct === 'object') return direct;

  if (role === 'client' && authData.firstName != null && authData.email) {
    const { accessToken, refreshToken, token, ...rest } = authData;
    if (Object.keys(rest).length) return rest;
  }

  return null;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const savedToken = localStorage.getItem('accessToken');
      const savedRoleRaw = localStorage.getItem('role');
      const savedUserRaw = localStorage.getItem('user');
      const savedRole = normalizeRole(savedRoleRaw);

      if (!savedToken || !savedRole) {
        if (!cancelled) setLoading(false);
        return;
      }

      if (!cancelled) setRole(savedRole);

      if (savedRoleRaw != null && String(savedRoleRaw) !== String(savedRole)) {
        localStorage.setItem('role', savedRole);
      }

      let parsedUser = null;
      if (savedUserRaw) {
        try {
          parsedUser = JSON.parse(savedUserRaw);
        } catch {
          parsedUser = null;
        }
      }
      if (parsedUser && typeof parsedUser === 'object') {
        if (!cancelled) setUser(parsedUser);
        if (!cancelled) setLoading(false);
        return;
      }

      // Token + role but missing / invalid `user` (e.g. old bug or API shape change)
      if (savedRole === 'client') {
        try {
          const res = await axios.get(`${API_BASE}/api/client/me`, {
            headers: { Authorization: `Bearer ${savedToken}` },
          });
          if (!cancelled && res.data?.success && res.data?.data) {
            const u = res.data.data;
            setUser(u);
            localStorage.setItem('user', JSON.stringify(u));
          }
        } catch {
          /* leave user null */
        }
      }

      if (!cancelled) setLoading(false);
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function onSessionExpired() {
      setUser(null);
      setRole(null);
    }
    window.addEventListener('pais:session-expired', onSessionExpired);
    return () => window.removeEventListener('pais:session-expired', onSessionExpired);
  }, []);

  const login = (authData, userRole) => {
    clearAuthStorage();

    const { accessToken, refreshToken } = authData;
    const userData = pickUserFromAuthPayload(authData, userRole);
    const roleNorm = normalizeRole(userRole);

    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    if (roleNorm) localStorage.setItem('role', roleNorm);
    localStorage.setItem('user', JSON.stringify(userData));

    if (roleNorm) setRole(roleNorm);
    setUser(userData);
  };

  
  // const logout = async () => {
  //   const accessToken = localStorage.getItem('accessToken');
  //   const refreshToken = localStorage.getItem('refreshToken');

  //   try {
  //     if (accessToken && refreshToken) {
  //       await axios.post(
  //         'https://pais-production.up.railway.app/api/auth/logout',
  //         { refreshToken },
  //         {
  //           headers: {
  //             Authorization: `Bearer ${accessToken}`,
  //             'Content-Type': 'application/json',
  //           },
  //         }
  //       );
  //     }
  //   } catch (error) {
  //     console.error('Logout API failed:', error);
  //   }

  //   localStorage.removeItem('accessToken');
  //   localStorage.removeItem('refreshToken');
  //   localStorage.removeItem('role');
  //   localStorage.removeItem('user');

  //   setRole(null);
  //   setUser(null);
  // };


  const logout = async () => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      if (accessToken && refreshToken) {
        await axios.post(
          'https://pais-production.up.railway.app/api/auth/logout',
          { refreshToken },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
      }
    } catch (error) {
      console.error('Logout API failed:', error);
    }
    clearAuthStorage();
    setRole(null);
    setUser(null);
  };


  return (
    <AuthContext.Provider value={{ user, role, login, logout, loading, isAuthenticated: !!role }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
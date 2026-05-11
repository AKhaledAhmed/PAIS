import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export  const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const savedToken = localStorage.getItem('accessToken');
    const savedRole = localStorage.getItem('role');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedRole) {
      setRole(savedRole);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  
  const login = (authData, userRole) => {
    const { accessToken, refreshToken } = authData;
    const userData = authData.client || authData.pharmacy || authData.admin|| null;

    localStorage.setItem('accessToken', accessToken);
   if(refreshToken) localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('role', userRole);
    localStorage.setItem('user', JSON.stringify(userData));

    setRole(userRole);
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
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
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
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user on startup if token exists
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('pactflow_token');
      if (token) {
        try {
          const currentUser = await api.auth.getMe();
          setUser(currentUser);
        } catch (err) {
          console.error('Session expired or invalid:', err.message);
          localStorage.removeItem('pactflow_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const userData = await api.auth.login(email, password);
    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    const newUser = await api.auth.register(userData);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('pactflow_token');
    setUser(null);
  };

  const updatePolicy = async (policyProfile) => {
    const updatedPolicy = await api.auth.updatePolicy(policyProfile);
    setUser((prev) => ({
      ...prev,
      policyProfile: updatedPolicy,
    }));
    return updatedPolicy;
  };

  // Instant 1-Click Demo Switcher (Alex Rivera vs Sarah Chen)
  const quickLoginDemo = async (role) => {
    setLoading(true);
    try {
      const email = role === 'client' ? 'client@pactflow.dev' : 'freelancer@pactflow.dev';
      const password = 'password123';
      const userData = await api.auth.login(email, password);
      setUser(userData);
      return userData;
    } catch (err) {
      console.error('Quick demo login error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updatePolicy,
        quickLoginDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

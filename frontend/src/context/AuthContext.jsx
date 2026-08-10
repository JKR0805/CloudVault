import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No token');
      
      const res = await apiClient.get('/auth/me');
      setUser(res.data.data);
    } catch (err) {
      setUser(null);
      localStorage.removeItem('access_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const login = async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    const { session, user } = res.data.data;
    localStorage.setItem('access_token', session.access_token);
    setUser(user);
    return user;
  };

  const signup = async (email, password, full_name) => {
    const res = await apiClient.post('/auth/signup', { email, password, full_name });
    return res.data;
  };

  const resetPassword = async (email) => {
    const res = await apiClient.post('/auth/reset-password', { email });
    return res.data;
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.error(err);
    }
    localStorage.removeItem('access_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, fetchMe, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

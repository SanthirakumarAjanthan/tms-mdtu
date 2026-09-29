import { createContext, useState, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);
export default AuthContext;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tms_user')); } catch { return null; }
  });

  // login accepts NIC or email as identifier
  const login = useCallback(async (identifier, password) => {
    const { data } = await api.post('/auth/login', { identifier, password });
    localStorage.setItem('tms_token', data.token);
    localStorage.setItem('tms_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  // Public self-registration
  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('tms_token');
    localStorage.removeItem('tms_user');
    setUser(null);
  }, []);

  /** Update stored user data (name, email, nic) after a profile edit */
  const updateUser = useCallback((patch) => {
    setUser(prev => {
      const updated = { ...prev, ...patch };
      localStorage.setItem('tms_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, register }}>
      {children}
    </AuthContext.Provider>
  );
}


import { createContext, useContext, useState, useEffect } from 'react';
import { updateProfile } from '../api/customer/authAPI';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user,  setUser]  = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const login = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem('user',  JSON.stringify(userData));
    localStorage.setItem('token', tokenData);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.clear();
  };

  // Update profile — calls API, then refreshes user in state + localStorage
  const update = async (payload) => {
    const updatedUser = await updateProfile(payload);
    const merged = { ...user, ...updatedUser };
    setUser(merged);
    localStorage.setItem('user', JSON.stringify(merged));
    return merged;
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, update }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
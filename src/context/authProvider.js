import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState();

  useEffect(() => {
    const storedToken = sessionStorage.getItem('authToken');
    if (storedToken) {
      setAuthToken(storedToken);
    }
  }, [authToken]);

  const login = async (username, password) => {
    try {
      const response = await axios.post('https://biodynamics.tech/api_tokens/user/login', { username, password });
      const { jwtoken } = response.data;
      localStorage.setItem('authToken', jwtoken);
      setAuthToken(jwtoken);
    } catch (error) {
      throw new Error('Error al iniciar sesión');
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider value={{ authToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

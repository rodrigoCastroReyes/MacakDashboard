import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(null);
  const [managerAdminUserId, setManagerAdminUserId] = useState(null);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthentication = async () => {
      if (!authToken || !managerAdminUserId || !userId) {
        return;
      }

      if (userId !== managerAdminUserId) {
        navigate('/authentication/sign-in');
      }
    };

    checkAuthentication();
  }, [authToken, managerAdminUserId, userId, navigate]);

  const login = async (username, password) => {
    try {
      const response = await axios.post('https://biodynamics.tech/api_tokens/user/login', { username, password });
      const { id, jwtoken, event_id } = response.data;
      localStorage.setItem('authToken', jwtoken);
      setAuthToken(jwtoken);
      setUserId(id);

      const managerAdminResponse = await axios.post('https://biodynamics.tech/api_tokens/manager_admin', {
        user_id: id,
        event_id: event_id
      });

      const { user_id } = managerAdminResponse.data;
      setManagerAdminUserId(user_id);

      console.log("User Id: ", id);
      console.log("Manager id", user_id);
      if (user_id === id && username === "admin") {
        navigate("/resumen");
        return "manager_admin";
      } else {
        navigate("/authentication/sign-in"); 
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw new Error('Error al iniciar sesión. Por favor, verifica tus credenciales.');
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setAuthToken(null);
    setManagerAdminUserId(null);
    setUserId(null);
    navigate('/authentication/sign-in');
  };

  return (
    <AuthContext.Provider value={{ authToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

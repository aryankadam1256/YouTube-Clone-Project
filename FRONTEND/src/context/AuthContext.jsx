import React, { createContext, useState, useEffect } from "react";
import { getCurrentUser, logoutUser, loginUser } from "../api/userApi";
import { useNavigate } from "react-router-dom";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const loadUser = async () => {
    try {
      const data = await getCurrentUser();
      setUser(data.data);
    } catch (error) {
      console.error("Failed to load user:", error);
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (credentials) => {
    const data = await loginUser(credentials);
    setUser(data.data.user);
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

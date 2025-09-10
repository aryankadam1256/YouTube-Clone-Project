// src/context/AuthContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext();

const initialState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
      return { ...state, isLoading: true, error: null };
    
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return { 
        ...state, 
        isLoading: false, 
        isAuthenticated: true, 
        user: action.payload,
        error: null 
      };
    
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return { 
        ...state, 
        isLoading: false, 
        isAuthenticated: false, 
        user: null,
        error: action.payload 
      };
    
    case 'LOGOUT':
      return { 
        ...state, 
        isAuthenticated: false, 
        user: null,
        error: null 
      };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('accessToken');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          const response = await authAPI.getCurrentUser();
          dispatch({ 
            type: 'LOGIN_SUCCESS', 
            payload: response.data.data 
          });
        } catch (error) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authAPI.login(credentials);
      const { user, accessToken } = response.data.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

//   const register = async (userData) => {
//     dispatch({ type: 'REGISTER_START' });
//     try {
//       const formData = new FormData();
//       Object.keys(userData).forEach(key => {
//         if (userData[key]) {
//           formData.append(key, userData[key]);
//         }
//       });
      
//       const response = await authAPI.register(formData);
//       // Auto login after registration
//       const loginResult = await login({
//         username: userData.username,
//         password: userData.password
//       });
      
//       return loginResult;
//     } catch (error) {
//       const errorMessage = error.response?.data?.message || 'Registration failed';
//       dispatch({ type: 'REGISTER_FAILURE', payload: errorMessage });
//       return { success: false, error: errorMessage };
//     }
//   };
// src/context/AuthContext.jsx - Update the register function

const register = async (userData) => {
    dispatch({ type: 'REGISTER_START' });
    try {
        const formData = new FormData();
        Object.keys(userData).forEach(key => {
            if (userData[key]) {
                formData.append(key, userData[key]);
            }
        });
        
        const response = await authAPI.register(formData);
        
        // After successful registration, auto login
        const loginResult = await login({
            username: userData.username,
            password: userData.password
        });
        
        return loginResult;
    } catch (error) {
        console.error('Registration error:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
        dispatch({ type: 'REGISTER_FAILURE', payload: errorMessage });
        return { success: false, error: errorMessage };
    }
};
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
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
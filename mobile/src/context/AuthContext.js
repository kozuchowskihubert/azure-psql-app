import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const API_URL = 'https://haos.fm/api';
  const USE_MOCK_AUTH = true; // Set to false when backend is available

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const sessionId = await SecureStore.getItemAsync('haos_session');
      if (sessionId) {
        const response = await axios.get(`${API_URL}/auth/me`, {
          headers: {
            Cookie: `haos_session=${sessionId}`,
          },
        });
        if (response.data.authenticated) {
          setUser(response.data.user);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    // Mock authentication for testing when backend is unavailable
    if (USE_MOCK_AUTH) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      const mockUser = {
        id: 1,
        email: email,
        name: email.split('@')[0],
        subscription: 'free',
      };
      setUser(mockUser);
      await SecureStore.setItemAsync('haos_mock_user', JSON.stringify(mockUser));
      return { success: true };
    }

    // Real authentication
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      
      if (response.data.sessionId) {
        await SecureStore.setItemAsync('haos_session', response.data.sessionId);
        setUser(response.data.user);
        return { success: true };
      }
      
      // If no sessionId in response, treat as failed
      return { 
        success: false, 
        error: 'Invalid response from server' 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const signUp = async (email, password, name) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
        display_name: name,
      });
      
      if (response.data.success) {
        // Auto-login after signup
        return await login(email, password);
      }
      
      // If registration didn't succeed
      return { 
        success: false, 
        error: response.data.error || 'Registration failed' 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Sign up failed' 
      };
    }
  };

  const loginWithGoogle = async () => {
    // Google OAuth will be implemented with expo-auth-session
    // This is a placeholder for the OAuth flow
    try {
      // TODO: Implement Google OAuth with expo-auth-session
      console.log('Google login not yet implemented');
      return { success: false, error: 'Google login coming soon' };
    } catch (error) {
      return { success: false, error: 'Google login failed' };
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('haos_session');
      await AsyncStorage.clear();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const value = {
    user,
    isLoading,
    login,
    signUp,
    loginWithGoogle,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

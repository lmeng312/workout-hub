import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds - slow networks / cold starts may need more time
});

// Holds a reference to the signOut function from AuthContext
let _signOut = null;
export const setSignOutHandler = (handler) => {
  _signOut = handler;
};

// Track whether a refresh is already in progress to avoid duplicate calls
let isRefreshing = false;
let refreshSubscribers = [];

function onTokenRefreshed(newToken) {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback) {
  refreshSubscribers.push(callback);
}

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 responses — attempt silent refresh before signing out
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401, and not for auth endpoints themselves
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/')
    ) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const refreshToken = await AsyncStorage.getItem('refreshToken');

          if (!refreshToken) {
            throw new Error('No refresh token');
          }

          // Call refresh endpoint directly with axios to avoid interceptor loops
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { token: newAccessToken, refreshToken: newRefreshToken } = response.data;

          // Store the new tokens
          await AsyncStorage.setItem('userToken', newAccessToken);
          await AsyncStorage.setItem('refreshToken', newRefreshToken);

          isRefreshing = false;
          onTokenRefreshed(newAccessToken);

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          refreshSubscribers = [];

          // Refresh failed — sign out
          if (_signOut) {
            await _signOut();
          }
          return Promise.reject(refreshError);
        }
      } else {
        // Another refresh is already in progress — queue this request
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }
    }

    return Promise.reject(error);
  }
);

export default api;

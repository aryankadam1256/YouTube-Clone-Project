// src/api/index.js
import axios from 'axios';

const API_BASE_URL = '/api/v1';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, try to refresh
      try {
        const refreshResponse = await axios.post(`${API_BASE_URL}/users/refresh-token`, {}, {
          withCredentials: true
        });
        
        const newAccessToken = refreshResponse.data.data.accessToken;
        localStorage.setItem('accessToken', newAccessToken);
        
        // Retry the original request
        error.config.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient.request(error.config);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => apiClient.post('/users/register', userData),
  login: (credentials) => apiClient.post('/users/login', credentials),
  logout: () => apiClient.post('/users/logout'),
  getCurrentUser: () => apiClient.get('/users/current-user'),
  refreshToken: () => apiClient.post('/users/refresh-token'),
};

// Video API calls
export const videoAPI = {
  getAllVideos: (params) => apiClient.get('/videos', { params }),
  getVideoById: (videoId) => apiClient.get(`/videos/${videoId}`),
  uploadVideo: (formData) => apiClient.post('/videos/publish', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateVideo: (videoId, data) => apiClient.patch(`/videos/${videoId}`, data),
  deleteVideo: (videoId) => apiClient.delete(`/videos/${videoId}`),
  togglePublishStatus: (videoId) => apiClient.patch(`/videos/${videoId}/toggle-publish`),
};

// Comment API calls
export const commentAPI = {
//   getVideoComments: (videoId) => apiClient.get(`/comments/update-comment/${videoId}`),
  getVideoComments: (videoId) => apiClient.get(`/comments/${videoId}`),
  addComment: (videoId, comment) => apiClient.post(`/comments/add-comment/${videoId}`, { comment }),
  updateComment: (commentId, newcomment) => apiClient.patch(`/comments/update-comment/${commentId}`, { newcomment }),
  deleteComment: (commentId) => apiClient.delete(`/comments/delete-comment/${commentId}`),
};

// Like API calls
export const likeAPI = {
  toggleVideoLike: (videoId) => apiClient.patch(`/likes/toggle-videolike/${videoId}`),
  toggleCommentLike: (commentId) => apiClient.patch(`/likes/toggle-commentlike/${commentId}`),
  getLikedVideos: () => apiClient.get('/likes/getlikedvideos'),
  getVideoLikeCount: (videoId) => apiClient.get(`/likes/video-like-count/${videoId}`),
};

// Dashboard API calls
export const dashboardAPI = {
  getChannelStats: (channelId) => apiClient.get(`/dashboards/get-channel-stats/${channelId}`),
  getChannelVideos: (channelId) => apiClient.get(`/dashboards/get-channel-videos/${channelId}`),
};

// Recommendation API calls
export const recommendAPI = {
  home: () => apiClient.get('/recommendations'),
  related: (videoId) => apiClient.get(`/recommendations/${videoId}/related`),
  byTags: (tags) => apiClient.get('/recommendations/tags', { params: { tags } }),
  logWatch: (videoId) => apiClient.post('/events/watch', { videoId }),
  logLike: (videoId) => apiClient.post('/events/like', { videoId }),
};

// Search API calls
export const searchAPI = {
  getSuggestions: (q) => apiClient.get('/search/suggest', { params: { q } }),
  searchVideos: (q, params) => apiClient.get('/search/videos', { params: { q, ...params } }),
};

// Subscription API calls
export const subscriptionAPI = {
  toggle: (channelId) => apiClient.patch(`/subscriptions/toggle-subscription/${channelId}`),
  subscribers: (channelId) => apiClient.get(`/subscriptions/subscribers/${channelId}`),
  subscribedChannels: (subscriberId) => apiClient.get(`/subscriptions/subscribed-channels/${subscriberId}`),
};

// Channel API (profile by username)
export const channelAPI = {
  getByUsername: (username) => apiClient.get(`/users/c/${username}`),
};

export default apiClient;
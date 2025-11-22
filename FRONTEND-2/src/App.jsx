import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import VideoDetail from './pages/VideoDetail';
import Upload from './pages/Upload';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Search from './pages/Search';
import Channel from './pages/Channel';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-brand-blue"></div>
          <div className="text-sm text-slate-600">Loading...</div>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes - Wrapped in AppLayout */}
          <Route path="/" element={
            <AppLayout>
              <Home />
            </AppLayout>
          } />

          <Route path="/video/:videoId" element={
            <AppLayout>
              <VideoDetail />
            </AppLayout>
          } />

          <Route path="/search" element={
            <AppLayout>
              <Search />
            </AppLayout>
          } />

          <Route path="/channel/:username" element={
            <AppLayout>
              <Channel />
            </AppLayout>
          } />

          <Route path="/profile" element={
            <AppLayout>
              <Profile />
            </AppLayout>
          } />

          {/* Protected Routes */}
          <Route path="/upload" element={
            <ProtectedRoute>
              <AppLayout>
                <Upload />
              </AppLayout>
            </ProtectedRoute>
          } />

          {/* Auth Routes (No Layout) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
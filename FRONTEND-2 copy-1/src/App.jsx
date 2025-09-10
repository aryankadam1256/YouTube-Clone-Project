// // src/App.jsx
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider, useAuth } from './context/AuthContext';
// import Navbar from './components/Navbar';
// import Sidebar from './components/Sidebar';
// import Home from './pages/Home';
// import VideoDetail from './pages/VideoDetail';
// import Upload from './pages/Upload';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import Profile from './pages/Profile';
// import './index.css';

// // Protected Route Component
// const ProtectedRoute = ({ children }) => {
//   const { isAuthenticated, isLoading } = useAuth();
  
//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
//       </div>
//     );
//   }
  
//   return isAuthenticated ? children : <Navigate to="/login" />;
// };

// // Layout Component
// const Layout = ({ children }) => {
//   const { isAuthenticated } = useAuth();
  
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Navbar />
//       <div className="flex">
//         {isAuthenticated && <Sidebar />}
//         <main className={`flex-1 ${isAuthenticated ? 'ml-64' : ''}`}>
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// };

// function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <Layout>
//           <Routes>
//             {/* Public Routes */}
//             <Route path="/login" element={<Login />} />
//             <Route path="/register" element={<Register />} />
            
//             {/* Protected Routes */}
//             <Route path="/" element={
//               <ProtectedRoute>
//                 <Home />
//               </ProtectedRoute>
//             } />
//             <Route path="/video/:videoId" element={
//               <ProtectedRoute>
//                 <VideoDetail />
//               </ProtectedRoute>
//             } />
//             <Route path="/upload" element={
//               <ProtectedRoute>
//                 <Upload />
//               </ProtectedRoute>
//             } />
//             <Route path="/profile" element={
//               <ProtectedRoute>
//                 <Profile />
//               </ProtectedRoute>
//             } />
            
//             {/* Redirect to home by default */}
//             <Route path="*" element={<Navigate to="/" />} />
//           </Routes>
//         </Layout>
//       </Router>
//     </AuthProvider>
//   );
// }

// export default App;
// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import VideoDetail from './pages/VideoDetail';
import Upload from './pages/Upload';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import './index.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Layout Component
const Layout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        {isAuthenticated && <Sidebar />}
        <main className={`flex-1 ${isAuthenticated ? 'ml-64' : ''} pt-16`}>
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="/video/:videoId" element={
              <ProtectedRoute>
                <VideoDetail />
              </ProtectedRoute>
            } />
            <Route path="/upload" element={
              <ProtectedRoute>
                <Upload />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            {/* Redirect to home by default */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
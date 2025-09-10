// src/pages/Profile.jsx
// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { dashboardAPI, videoAPI } from '../api';
// import VideoCard from '../components/VideoCard';

// const Profile = () => {
//   const { user } = useAuth();
//   const [userVideos, setUserVideos] = useState([]);
//   const [stats, setStats] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     if (user) {
//       fetchUserData();
//     }
//   }, [user]);

//   const fetchUserData = async () => {
//     try {
//       setIsLoading(true);
      
//       // Fetch user videos
//       const videosResponse = await videoAPI.getAllVideos({ userId: user._id });
//       setUserVideos(videosResponse.data.data || []);
      
//       // Fetch channel stats
//       try {
//         const statsResponse = await dashboardAPI.getChannelStats(user._id);
//         setStats(statsResponse.data.data);
//       } catch (error) {
//         console.log('Stats not available');
//       }
      
//     } catch (error) {
//       console.error('Error fetching user data:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="pt-20 px-6">
//         <div className="max-w-6xl mx-auto">
//           <div className="animate-pulse">
//             <div className="h-48 bg-gray-300 rounded-lg mb-6"></div>
//             <div className="h-8 bg-gray-300 rounded mb-4 w-1/3"></div>
//             <div className="grid grid-cols-4 gap-4 mb-8">
//               {[...Array(4)].map((_, i) => (
//                 <div key={i} className="h-20 bg-gray-300 rounded"></div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="pt-20 px-6">
//       <div className="max-w-6xl mx-auto">
//         {/* Cover Image */}
//         <div className="relative h-48 bg-gradient-to-r from-red-500 to-red-600 rounded-lg mb-6 overflow-hidden">
//           {user?.coverImage && (
//             <img
//               src={user.coverImage}
//               alt="Cover"
//               className="w-full h-full object-cover"
//             />
//           )}
//         </div>

//         {/* Profile Info */}
//         <div className="flex items-start space-x-6 mb-8">
//           <img
//             src={user?.avatar || '/default-avatar.png'}
//             alt={user?.username}
//             className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
//           />
//           <div className="flex-1">
//             <h1 className="text-3xl font-bold text-gray-900 mb-2">{user?.fullname}</h1>
//             <p className="text-gray-600 text-lg mb-4">@{user?.username}</p>
//             <p className="text-gray-500">{user?.email}</p>
//           </div>
//         </div>

//         {/* Stats */}
//         {stats && (
//           <div className="grid grid-cols-4 gap-6 mb-8">
//             <div className="bg-white p-6 rounded-lg shadow">
//               <div className="text-2xl font-bold text-gray-900">{stats.totalVideos}</div>
//               <div className="text-gray-600">Videos</div>
//             </div>
//             <div className="bg-white p-6 rounded-lg shadow">
//               <div className="text-2xl font-bold text-gray-900">{stats.totalViews}</div>
//               <div className="text-gray-600">Views</div>
//             </div>
//             <div className="bg-white p-6 rounded-lg shadow">
//               <div className="text-2xl font-bold text-gray-900">{stats.totalSubscribers}</div>
//               <div className="text-gray-600">Subscribers</div>
//             </div>
//             <div className="bg-white p-6 rounded-lg shadow">
//               <div className="text-2xl font-bold text-gray-900">{stats.totalLikes}</div>
//               <div className="text-gray-600">Likes</div>
//             </div>
//           </div>
//         )}

//         {/* User Videos */}
//         <div>
//           <h2 className="text-2xl font-bold mb-6">Your Videos ({userVideos.length})</h2>
//           {userVideos.length === 0 ? (
//             <div className="text-center py-12">
//               <div className="text-gray-500 text-xl mb-4">No videos uploaded yet</div>
//               <p className="text-gray-400">Upload your first video to get started!</p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//               {userVideos.map((video) => (
//                 <VideoCard key={video._id} video={video} />
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Profile;

// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, videoAPI } from '../api';
import VideoCard from '../components/VideoCard';

const Profile = () => {
  const { user } = useAuth();
  const [userVideos, setUserVideos] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      
      const videosResponse = await videoAPI.getAllVideos({ userId: user._id });
      setUserVideos(videosResponse.data.data || []);
      
      try {
        const statsResponse = await dashboardAPI.getChannelStats(user._id);
        setStats(statsResponse.data.data);
      } catch (error) {
        console.log('Stats not available');
        setStats({
          totalVideos: userVideos.length,
          totalViews: 0,
          totalSubscribers: 0,
          totalLikes: 0
        });
      }
      
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="profile-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div>Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header"></div>
      
      <div className="profile-info">
        <img
          src={user?.avatar || '/default-avatar.png'}
          alt={user?.username}
          className="profile-avatar"
        />
        <div className="profile-details">
          <h1 className="profile-name">{user?.fullname || user?.username}</h1>
          <p className="profile-username">@{user?.username}</p>
          <p className="profile-email">{user?.email}</p>
        </div>
      </div>

      {stats && (
        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-number">{stats.totalVideos || userVideos.length}</div>
            <div className="stat-label">Videos</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.totalViews || 0}</div>
            <div className="stat-label">Views</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.totalSubscribers || 0}</div>
            <div className="stat-label">Subscribers</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.totalLikes || 0}</div>
            <div className="stat-label">Likes</div>
          </div>
        </div>
      )}

      <div>
        <h2 className="page-title">Your Videos ({userVideos.length})</h2>
        {userVideos.length === 0 ? (
          <div className="text-center" style={{padding: '60px 20px'}}>
            <div style={{fontSize: '18px', marginBottom: '8px', color: '#606060'}}>No videos uploaded yet</div>
            <p style={{color: '#909090', marginBottom: '20px'}}>Upload your first video to get started!</p>
            <a href="/upload" className="btn btn-primary">Upload Video</a>
          </div>
        ) : (
          <div className="video-grid">
            {userVideos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
// // src/pages/Home.jsx
// import React, { useState, useEffect } from 'react';
// import VideoCard from '../components/VideoCard';
// import { videoAPI } from '../api';

// const Home = () => {
//   const [videos, setVideos] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchVideos();
//   }, []);

//   const fetchVideos = async () => {
//     try {
//       setIsLoading(true);
//       const response = await videoAPI.getAllVideos();
//       setVideos(response.data.data || []);
//     } catch (error) {
//       console.error('Error fetching videos:', error);
//       setError('Failed to load videos');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="pt-20 px-6">
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//           {[...Array(8)].map((_, index) => (
//             <div key={index} className="animate-pulse">
//               <div className="bg-gray-300 aspect-video rounded-lg mb-4"></div>
//               <div className="h-4 bg-gray-300 rounded mb-2"></div>
//               <div className="h-3 bg-gray-300 rounded w-3/4"></div>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="pt-20 px-6">
//         <div className="text-center py-12">
//           <div className="text-red-600 text-xl mb-4">{error}</div>
//           <button
//             onClick={fetchVideos}
//             className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="pt-20 px-6">
//       <div className="max-w-7xl mx-auto">
//         <h1 className="text-2xl font-bold mb-6">Latest Videos</h1>
        
//         {videos.length === 0 ? (
//           <div className="text-center py-12">
//             <div className="text-gray-500 text-xl mb-4">No videos available</div>
//             <p className="text-gray-400">Be the first to upload a video!</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//             {videos.map((video) => (
//               <VideoCard key={video._id} video={video} />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Home;
// src/pages/Home.jsx
// import React, { useState, useEffect } from 'react';
// import VideoCard from '../components/VideoCard';
// import { videoAPI } from '../api';

// const Home = () => {
//   const [videos, setVideos] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchVideos();
//   }, []);

//   const fetchVideos = async () => {
//     try {
//       setIsLoading(true);
//       const response = await videoAPI.getAllVideos();
//       setVideos(response.data.data || []);
//     } catch (error) {
//       console.error('Error fetching videos:', error);
//       setError('Failed to load videos');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="px-6 py-6">
//         <div className="max-w-7xl mx-auto">
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//             {[...Array(8)].map((_, index) => (
//               <div key={index} className="animate-pulse">
//                 <div className="bg-gray-300 aspect-video rounded-lg mb-4"></div>
//                 <div className="h-4 bg-gray-300 rounded mb-2"></div>
//                 <div className="h-3 bg-gray-300 rounded w-3/4"></div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="px-6 py-8">
//         <div className="max-w-7xl mx-auto">
//           <div className="text-center py-12">
//             <div className="text-red-600 text-xl mb-4">{error}</div>
//             <button
//               onClick={fetchVideos}
//               className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
//             >
//               Try Again
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="px-6 py-8">
//       <div className="max-w-7xl mx-auto">
//         <h1 className="text-2xl font-bold mb-6 text-gray-900">Latest Videos</h1>
        
//         {videos.length === 0 ? (
//           <div className="text-center py-12">
//             <div className="text-gray-500 text-xl mb-4">No videos available</div>
//             <p className="text-gray-400">Be the first to upload a video!</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//             {videos.map((video) => (
//               <VideoCard key={video._id} video={video} />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Home;

// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import VideoCard from '../components/VideoCard';
import { videoAPI } from '../api';

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      const response = await videoAPI.getAllVideos();
      setVideos(response.data.data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
      setError('Failed to load videos');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="main-content">
        <h1 className="page-title">Latest Videos</h1>
        <div className="video-grid">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="video-card">
              <div style={{background: '#f0f0f0', height: '180px'}}></div>
              <div className="video-info">
                <div style={{background: '#f0f0f0', height: '20px', marginBottom: '8px'}}></div>
                <div style={{background: '#f0f0f0', height: '16px', width: '60%'}}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content">
        <div className="text-center" style={{paddingTop: '80px'}}>
          <div style={{color: '#cc0000', fontSize: '18px', marginBottom: '16px'}}>{error}</div>
          <button onClick={fetchVideos} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <h1 className="page-title">Latest Videos</h1>
      
      {videos.length === 0 ? (
        <div className="text-center" style={{paddingTop: '80px'}}>
          <div style={{fontSize: '18px', marginBottom: '8px', color: '#606060'}}>No videos available</div>
          <p style={{color: '#909090'}}>Be the first to upload a video!</p>
          <a href="/upload" className="btn btn-primary" style={{marginTop: '16px'}}>Upload Video</a>
        </div>
      ) : (
        <div className="video-grid">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
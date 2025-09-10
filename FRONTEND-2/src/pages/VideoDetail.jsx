// // src/pages/VideoDetail.jsx
// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import { videoAPI, likeAPI } from '../api';
// import { useAuth } from '../context/AuthContext';
// import CommentBox from '../components/CommentBox';

// const VideoDetail = () => {
//   const { videoId } = useParams();
//   const { user } = useAuth();
//   const [video, setVideo] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isLiked, setIsLiked] = useState(false);

//   useEffect(() => {
//     if (videoId) {
//       fetchVideo();
//     }
//   }, [videoId]);

//   const fetchVideo = async () => {
//     try {
//       setIsLoading(true);
//       const response = await videoAPI.getVideoById(videoId);
//       setVideo(response.data.data);
//     } catch (error) {
//       console.error('Error fetching video:', error);
//       setError('Failed to load video');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleLike = async () => {
//     try {
//       await likeAPI.toggleVideoLike(videoId);
//       setIsLiked(!isLiked);
//     } catch (error) {
//       console.error('Error toggling like:', error);
//     }
//   };

//   const formatViews = (views) => {
//     if (views >= 1000000) {
//       return `${(views / 1000000).toFixed(1)}M views`;
//     } else if (views >= 1000) {
//       return `${(views / 1000).toFixed(1)}K views`;
//     }
//     return `${views} views`;
//   };

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     });
//   };

//   if (isLoading) {
//     return (
//       <div className="pt-20 px-6">
//         <div className="max-w-5xl mx-auto">
//           <div className="animate-pulse">
//             <div className="bg-gray-300 aspect-video rounded-lg mb-4"></div>
//             <div className="h-8 bg-gray-300 rounded mb-4"></div>
//             <div className="flex items-center space-x-4 mb-4">
//               <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
//               <div className="flex-1">
//                 <div className="h-4 bg-gray-300 rounded mb-2"></div>
//                 <div className="h-3 bg-gray-300 rounded w-1/3"></div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error || !video) {
//     return (
//       <div className="pt-20 px-6">
//         <div className="max-w-5xl mx-auto text-center py-12">
//           <div className="text-red-600 text-xl mb-4">{error || 'Video not found'}</div>
//           <button
//             onClick={fetchVideo}
//             className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="px-6 py-6">
//       <div className="max-w-5xl mx-auto">
//         {/* Video Player */}
//         <div className="bg-black rounded-lg overflow-hidden mb-6">
//           <video
//             controls
//             className="w-full aspect-video"
//             src={video.videoFile}
//             poster={video.thumbnail}
//           >
//             Your browser does not support the video tag.
//           </video>
//         </div>

//         {/* Video Info */}
//         <div className="mb-6">
//           <h1 className="text-2xl font-bold text-gray-900 mb-2">{video.title}</h1>
          
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center text-gray-600 space-x-4">
//               <span>{formatViews(video.views)}</span>
//               <span>•</span>
//               <span>{formatDate(video.createdAt)}</span>
//             </div>
            
//             <div className="flex items-center space-x-4">
//               <button
//                 onClick={handleLike}
//                 className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-colors ${
//                   isLiked
//                     ? 'bg-blue-600 text-white border-blue-600'
//                     : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
//                 }`}
//               >
//                 <span>👍</span>
//                 <span>Like</span>
//               </button>
              
//               <button className="flex items-center space-x-2 px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
//                 <span>📤</span>
//                 <span>Share</span>
//               </button>
//             </div>
//           </div>

//           {/* Channel Info */}
//           <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
//             <img
//               src={video.owner?.avatar || '/default-avatar.png'}
//               alt={video.owner?.username}
//               className="w-12 h-12 rounded-full object-cover"
//             />
//             <div className="flex-1">
//               <h3 className="font-semibold text-lg">{video.owner?.username}</h3>
//               <p className="text-gray-600">{video.owner?.fullname}</p>
//             </div>
//             <button className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700">
//               Subscribe
//             </button>
//           </div>

//           {/* Description */}
//           {video.description && (
//             <div className="mt-4 p-4 bg-gray-50 rounded-lg">
//               <h4 className="font-semibold mb-2">Description</h4>
//               <p className="text-gray-700 whitespace-pre-wrap">{video.description}</p>
//             </div>
//           )}
//         </div>

//         {/* Comments Section */}
//         <CommentBox videoId={videoId} />
//       </div>
//     </div>
//   );
// };

// export default VideoDetail;
// src/pages/VideoDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { videoAPI } from '../api';

const VideoDetail = () => {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVideo();
  }, [videoId]);

  const fetchVideo = async () => {
    try {
      setIsLoading(true);
      const response = await videoAPI.getVideoById(videoId);
      setVideo(response.data.data);
    } catch (error) {
      console.error('Error fetching video:', error);
      setError('Failed to load video');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="video-player-page">
        <div className="video-player-container">
          <div className="video-main">
            <div style={{background: '#f0f0f0', height: '400px', borderRadius: '8px'}}></div>
            <div style={{background: '#f0f0f0', height: '20px', margin: '16px 0'}}></div>
            <div style={{background: '#f0f0f0', height: '16px', width: '60%'}}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="video-player-page">
        <div className="text-center" style={{paddingTop: '80px'}}>
          <div style={{color: '#cc0000', fontSize: '18px', marginBottom: '16px'}}>
            {error || 'Video not found'}
          </div>
          <a href="/" className="btn btn-primary">Go Home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="video-player-page">
      <div className="video-player-container">
        <div className="video-main">
          {/* Video Player */}
          <div className="video-player-wrapper">
            <video 
              className="video-player"
              controls
              poster={video.thumbnail}
              preload="metadata"
            >
              <source src={video.videoFile} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Video Info */}
          <div className="video-info">
            <h1 className="video-title">{video.title}</h1>
            
            <div className="video-metadata">
              <span>{video.views || 0} views</span>
              <span>•</span>
              <span>{new Date(video.createdAt).toLocaleDateString()}</span>
            </div>

            <div className="video-actions">
              <button className="btn btn-secondary">👍 Like</button>
              <button className="btn btn-secondary">👎 Dislike</button>
              <button className="btn btn-secondary">📤 Share</button>
            </div>
          </div>

          {/* Channel Info */}
          <div className="video-channel">
            <img 
              src={video.ownerDetails?.avatar || '/default-avatar.png'} 
              alt={video.ownerDetails?.username}
              className="channel-avatar"
            />
            <div className="channel-info">
              <div className="channel-name">{video.ownerDetails?.username}</div>
              <div className="channel-subscribers">1.2K subscribers</div>
            </div>
            <button className="btn btn-primary">Subscribe</button>
          </div>

          {/* Description */}
          {video.description && (
            <div className="video-description">
              <h3>Description</h3>
              <p>{video.description}</p>
            </div>
          )}
        </div>

        {/* Sidebar with related videos */}
        <div className="video-sidebar">
          <h3>Related Videos</h3>
          <div className="related-videos">
            <p style={{color: '#606060', textAlign: 'center', padding: '20px'}}>
              No related videos available
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetail;
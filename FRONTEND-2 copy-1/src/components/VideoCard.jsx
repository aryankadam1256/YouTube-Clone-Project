// src/components/VideoCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const VideoCard = ({ video }) => {
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M views`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K views`;
    }
    return `${views} views`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <Link to={`/video/${video._id}`} className="block group">
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
            {formatDuration(video.duration)}
          </div>
        </div>

        {/* Video Info */}
        <div className="p-4">
          <div className="flex space-x-3">
            {/* Channel Avatar */}
            <img
              src={video.ownerDetails?.avatar || '/default-avatar.png'}
              alt={video.ownerDetails?.username}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />

            {/* Video Details */}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {video.title}
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                {video.ownerDetails?.username}
              </p>
              <div className="flex items-center text-gray-500 text-sm mt-1 space-x-2">
                <span>{formatViews(video.views)}</span>
                <span>•</span>
                <span>{formatDate(video.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
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
    <Link
      to={`/video/${video._id}`}
      className="group block transition-all hover:scale-[1.02]"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-200">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Duration Badge */}
        <span className="absolute bottom-2 right-2 rounded-md bg-black/80 px-1.5 py-0.5 text-xs font-semibold text-white">
          {formatDuration(video.duration)}
        </span>
      </div>

      {/* Video Info */}
      <div className="mt-3 flex gap-3">
        {/* Channel Avatar */}
        <img
          src={video.ownerDetails?.avatar || '/default-avatar.png'}
          alt={video.ownerDetails?.username}
          className="h-9 w-9 flex-shrink-0 rounded-full object-cover"
        />

        {/* Video Details */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="mb-1 font-semibold text-slate-900 line-clamp-2 group-hover:text-brand-blue transition-colors">
            {video.title}
          </h3>

          {/* Channel Name */}
          <p className="text-sm text-slate-600 mb-0.5">
            {video.ownerDetails?.username}
          </p>

          {/* Views and Date */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>{formatViews(video.views)}</span>
            <span>•</span>
            <span>{formatDate(video.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
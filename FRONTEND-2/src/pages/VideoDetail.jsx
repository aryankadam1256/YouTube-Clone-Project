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
// src/pages/VideoDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { videoAPI, recommendAPI, likeAPI, subscriptionAPI, dashboardAPI, channelAPI } from '../api';
import VideoCard from '../components/VideoCard';
import { useAuth } from '../context/AuthContext';
import CommentBox from '../components/CommentBox';

const VideoDetail = () => {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [related, setRelated] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [subCount, setSubCount] = useState(0);
  const [subLoading, setSubLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    fetchVideo();
  }, [videoId]);

  const fetchVideo = async () => {
    try {
      setIsLoading(true);
      const response = await videoAPI.getVideoById(videoId);
      setVideo(response.data.data);
      // fetch like count
      try {
        const likeRes = await likeAPI.getVideoLikeCount(videoId);
        setLikeCount(likeRes.data.data.count || 0);
        setLiked(!!likeRes.data.data.liked);
      } catch {}
      // fetch subscriber count via dashboard and subscription status via channel profile
      try {
        const ownerId = response.data.data?.ownerDetails?._id;
        const ownerUsername = response.data.data?.ownerDetails?.username;
        if (ownerId) {
          const statsRes = await dashboardAPI.getChannelStats(ownerId);
          setSubCount(statsRes.data.data?.totalSubscribers || 0);
        }
        if (ownerUsername) {
          const profileRes = await channelAPI.getByUsername(ownerUsername);
          setIsSubscribed(!!profileRes.data.data?.isSubscribed);
        }
      } catch {}
      if (isAuthenticated) {
        recommendAPI.logWatch(videoId).catch(() => {});
      }
      fetchRelated();
    } catch (error) {
      console.error('Error fetching video:', error);
      setError('Failed to load video');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRelated = async () => {
    try {
      setRelatedLoading(true);
      const response = await recommendAPI.related(videoId);
      setRelated(response.data.data || []);
    } catch (error) {
      console.error('Error fetching related videos:', error);
      setRelated([]);
    } finally {
      setRelatedLoading(false);
    }
  };

  const handleToggleLike = async () => {
    try {
      await likeAPI.toggleVideoLike(videoId);
      setLiked((v) => !v);
      setLikeCount((c) => (liked ? Math.max(0, c - 1) : c + 1));
      if (isAuthenticated) recommendAPI.logLike(videoId).catch(() => {});
    } catch (e) {
      console.error('Error toggling like:', e);
    }
  };

  const handleToggleSubscribe = async () => {
    if (!video?.ownerDetails?._id) return;
    try {
      setSubLoading(true);
      await subscriptionAPI.toggle(video.ownerDetails._id);
      // Optimistic update of isSubscribed and count
      setIsSubscribed((prev) => !prev);
      setSubCount((c) => (isSubscribed ? Math.max(0, c - 1) : c + 1));
      // Refresh exact count
      const statsRes = await dashboardAPI.getChannelStats(video.ownerDetails._id);
      setSubCount(statsRes.data.data?.totalSubscribers || 0);
    } catch (e) {
      console.error('Error toggling subscribe:', e);
    } finally {
      setSubLoading(false);
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
              <button className="btn btn-secondary" onClick={handleToggleLike}>
                {liked ? '👍 Liked' : '👍 Like'} {likeCount ? `(${likeCount})` : ''}
              </button>
              {/* Dislike not implemented */}
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
              <div className="channel-subscribers">{subCount} subscribers</div>
            </div>
            <button className="btn btn-primary" onClick={handleToggleSubscribe} disabled={subLoading || (video.ownerDetails?._id === (JSON.parse(localStorage.getItem('user')||'{}')._id))}>
              {subLoading ? 'Please wait...' : (isSubscribed ? 'Subscribed' : 'Subscribe')}
            </button>
          </div>

          {/* Description */}
          {video.description && (
            <div className="video-description">
              <h3>Description</h3>
              <p>{video.description}</p>
            </div>
          )}

          {/* Comments */}
          <CommentBox videoId={videoId} />
        </div>

        {/* Sidebar with related videos */}
        <div className="video-sidebar">
          <h3>Related Videos</h3>
          <div className="related-videos">
            {relatedLoading ? (
              <p style={{color: '#606060', textAlign: 'center', padding: '20px'}}>
                Loading...
              </p>
            ) : related.length === 0 ? (
              <p style={{color: '#606060', textAlign: 'center', padding: '20px'}}>
                No related videos available
              </p>
            ) : (
              related.map((item) => (
                <VideoCard key={item._id} video={item} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetail;
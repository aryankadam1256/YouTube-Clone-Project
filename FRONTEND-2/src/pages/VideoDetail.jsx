import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ThumbsUp, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import { videoAPI, recommendAPI, likeAPI, subscriptionAPI, dashboardAPI, channelAPI } from '../api';
import VideoPlayer from '../components/VideoPlayer';
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
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  useEffect(() => {
    fetchVideo();
  }, [videoId]);

  const fetchVideo = async () => {
    try {
      setIsLoading(true);
      const response = await videoAPI.getVideoById(videoId);
      setVideo(response.data.data);

      try {
        const likeRes = await likeAPI.getVideoLikeCount(videoId);
        setLikeCount(likeRes.data.data.count || 0);
        setLiked(!!likeRes.data.data.liked);
      } catch { }

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
      } catch { }

      if (isAuthenticated) {
        recommendAPI.logWatch(videoId).catch(() => { });
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
    if (!isAuthenticated) return;
    try {
      await likeAPI.toggleVideoLike(videoId);
      setLiked((v) => !v);
      setLikeCount((c) => (liked ? Math.max(0, c - 1) : c + 1));
      recommendAPI.logLike(videoId).catch(() => { });
    } catch (e) {
      console.error('Error toggling like:', e);
    }
  };

  const handleToggleSubscribe = async () => {
    if (!isAuthenticated || !video?.ownerDetails?._id) return;
    try {
      setSubLoading(true);
      await subscriptionAPI.toggle(video.ownerDetails._id);
      setIsSubscribed((prev) => !prev);
      setSubCount((c) => (isSubscribed ? Math.max(0, c - 1) : c + 1));

      const statsRes = await dashboardAPI.getChannelStats(video.ownerDetails._id);
      setSubCount(statsRes.data.data?.totalSubscribers || 0);
    } catch (e) {
      console.error('Error toggling subscribe:', e);
    } finally {
      setSubLoading(false);
    }
  };

  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
        <div className="space-y-4">
          <div className="aspect-video rounded-xl bg-slate-200 animate-pulse"></div>
          <div className="h-6 bg-slate-200 rounded w-3/4 animate-pulse"></div>
          <div className="h-4 bg-slate-200 rounded w-1/4 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="mb-4 text-lg font-medium text-error">
          {error || 'Video not found'}
        </div>
        <Link
          to="/"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-brand-gradient px-6 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
      {/* Main Content (Left) */}
      <div className="space-y-4">
        {/* Video Player */}
        <VideoPlayer src={video.videoFile} poster={video.thumbnail} />

        {/* Video Title */}
        <h1 className="text-xl font-bold text-slate-900">
          {video.title}
        </h1>

        {/* Video Metadata & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Views & Date */}
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>{formatViews(video.views)} views</span>
            <span>•</span>
            <span>{new Date(video.createdAt).toLocaleDateString()}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleLike}
              disabled={!isAuthenticated}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${liked
                  ? 'bg-blue-50 text-brand-blue'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
            >
              <ThumbsUp className="h-4 w-4" />
              <span>{likeCount > 0 ? formatViews(likeCount) : 'Like'}</span>
            </button>

            <button className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors">
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Channel Info & Subscribe */}
        <div className="flex items-center justify-between rounded-xl bg-slate-100 p-4">
          <Link
            to={`/channel/${video.ownerDetails?.username}`}
            className="flex items-center gap-3"
          >
            <img
              src={video.ownerDetails?.avatar || '/default-avatar.png'}
              alt={video.ownerDetails?.username}
              className="h-10 w-10 rounded-full object-cover"
            />
            <div>
              <div className="font-semibold text-slate-900">
                {video.ownerDetails?.username}
              </div>
              <div className="text-xs text-slate-600">
                {formatViews(subCount)} subscribers
              </div>
            </div>
          </Link>

          <button
            onClick={handleToggleSubscribe}
            disabled={subLoading || !isAuthenticated}
            className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${isSubscribed
                ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                : 'bg-brand-gradient text-white hover:opacity-90'
              }`}
          >
            {subLoading ? 'Loading...' : isSubscribed ? 'Subscribed' : 'Subscribe'}
          </button>
        </div>

        {/* Description Box */}
        {video.description && (
          <div className="rounded-xl bg-slate-100 p-4">
            <div className={`text-sm text-slate-700 ${descriptionExpanded ? '' : 'line-clamp-3'}`}>
              {video.description}
            </div>
            <button
              onClick={() => setDescriptionExpanded(!descriptionExpanded)}
              className="mt-2 flex items-center gap-1 text-sm font-medium text-slate-900 hover:text-brand-blue transition-colors"
            >
              {descriptionExpanded ? (
                <>
                  <span>Show less</span>
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  <span>Show more</span>
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Comments Section */}
        <div className="pt-4">
          <CommentBox videoId={videoId} />
        </div>
      </div>

      {/* Recommended Videos Sidebar (Right) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Recommended
        </h3>

        {relatedLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video rounded-xl bg-slate-200 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-full mb-1"></div>
                <div className="h-3 bg-slate-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : related.length === 0 ? (
          <p className="text-center text-sm text-slate-500 py-8">
            No related videos available
          </p>
        ) : (
          <div className="space-y-4">
            {related.map((item) => (
              <VideoCard key={item._id} video={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoDetail;
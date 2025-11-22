import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, videoAPI } from '../api';
import VideoCard from '../components/VideoCard';

const Profile = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [userVideos, setUserVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('videos'); // 'videos', 'playlists', 'about'

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);

      // Fetch channel stats
      const statsResponse = await dashboardAPI.getChannelStats(user._id);
      setStats(statsResponse.data.data);

      // Fetch user's videos
      const videosResponse = await dashboardAPI.getChannelVideos(user._id);
      setUserVideos(videosResponse.data.data || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num;
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-48 sm:h-56 bg-slate-200 rounded-xl mb-4"></div>
        <div className="h-32 w-32 rounded-full bg-slate-200 -mt-16 ml-8 border-4 border-white"></div>
        <div className="mt-4 ml-8 space-y-2">
          <div className="h-6 bg-slate-200 rounded w-48"></div>
          <div className="h-4 bg-slate-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="-mx-4 lg:-mx-8">
      {/* Cover Banner */}
      <div className="relative h-48 sm:h-56 overflow-hidden rounded-t-xl">
        {user?.coverImage ? (
          <img
            src={user.coverImage}
            alt="Cover"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-brand-gradient"></div>
        )}
      </div>

      {/* Profile Header */}
      <div className="px-4 lg:px-8">
        {/* Avatar (Overlapping Banner) */}
        <div className="-mt-16 mb-4">
          <img
            src={user?.avatar || '/default-avatar.png'}
            alt={user?.username}
            className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg"
          />
        </div>

        {/* User Info */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            {user?.fullname}
          </h1>
          <p className="text-slate-600 mb-2">@{user?.username}</p>
          <p className="text-sm text-slate-500">{user?.email}</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="mb-6 flex flex-wrap gap-6 text-center sm:text-left">
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {formatNumber(stats.totalVideos)}
              </div>
              <div className="text-sm text-slate-600">Videos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {formatNumber(stats.totalSubscribers)}
              </div>
              <div className="text-sm text-slate-600">Subscribers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {formatNumber(stats.totalViews)}
              </div>
              <div className="text-sm text-slate-600">Total Views</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {formatNumber(stats.totalLikes)}
              </div>
              <div className="text-sm text-slate-600">Likes</div>
            </div>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="border-b border-slate-200 mb-6">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('videos')}
              className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'videos'
                  ? 'border-b-2 border-brand-blue text-brand-blue'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Videos
            </button>
            <button
              onClick={() => setActiveTab('playlists')}
              className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'playlists'
                  ? 'border-b-2 border-brand-blue text-brand-blue'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Playlists
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'about'
                  ? 'border-b-2 border-brand-blue text-brand-blue'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              About
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'videos' && (
            <div>
              <h2 className="mb-6 text-xl font-semibold text-slate-900">
                Your Videos ({userVideos.length})
              </h2>

              {userVideos.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 py-16">
                  <div className="mb-2 text-lg font-medium text-slate-600">
                    No videos uploaded yet
                  </div>
                  <p className="mb-6 text-sm text-slate-500">
                    Start sharing your content with the world!
                  </p>
                  <a
                    href="/upload"
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-brand-gradient px-6 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
                  >
                    Upload Video
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
                  {userVideos.map((video) => (
                    <VideoCard key={video._id} video={video} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'playlists' && (
            <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 py-16">
              <div className="mb-2 text-lg font-medium text-slate-600">
                Playlists coming soon
              </div>
              <p className="text-sm text-slate-500">
                Organize your videos into playlists
              </p>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="rounded-xl bg-slate-50 p-6">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">
                Channel Description
              </h3>
              <div className="space-y-3 text-sm text-slate-700">
                <div>
                  <span className="font-medium">Username:</span> @{user?.username}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {user?.email}
                </div>
                <div>
                  <span className="font-medium">Full Name:</span> {user?.fullname}
                </div>
                <div>
                  <span className="font-medium">Joined:</span>{' '}
                  {new Date(user?.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
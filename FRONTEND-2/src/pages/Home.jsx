import React, { useState, useEffect } from 'react';
import VideoCard from '../components/VideoCard';
import { videoAPI, recommendAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchVideos();
  }, [isAuthenticated]);

  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      let response;

      if (isAuthenticated) {
        response = await recommendAPI.home();
      } else {
        response = await videoAPI.getAllVideos({ page: 1, limit: 20, sortBy: 'views', sortType: 'desc' });
      }

      setVideos(response.data.data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
      setError('Failed to load videos');

      if (isAuthenticated) {
        try {
          const fallbackResponse = await videoAPI.getAllVideos({ page: 1, limit: 20, sortBy: 'views', sortType: 'desc' });
          setVideos(fallbackResponse.data.data || []);
          setError(null);
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-semibold text-slate-900">
          {isAuthenticated ? 'Recommended For You' : 'Trending Videos'}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="aspect-video rounded-xl bg-slate-200 mb-3"></div>
              <div className="flex gap-3">
                <div className="h-9 w-9 rounded-full bg-slate-200 flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="mb-4 text-lg font-medium text-error">{error}</div>
        <button
          onClick={fetchVideos}
          className="inline-flex h-10 items-center justify-center rounded-xl bg-brand-gradient px-6 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Page Title */}
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">
        {isAuthenticated ? 'Recommended For You' : 'Trending Videos'}
      </h1>

      {/* Empty State */}
      {videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="mb-2 text-lg font-medium text-slate-600">
            No videos available
          </div>
          <p className="mb-6 text-sm text-slate-500">
            Be the first to upload a video!
          </p>
          {isAuthenticated && (
            <a
              href="/upload"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-brand-gradient px-6 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              Upload Video
            </a>
          )}
        </div>
      ) : (
        /* Video Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
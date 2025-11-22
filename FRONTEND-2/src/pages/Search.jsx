// src/pages/Search.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import VideoCard from '../components/VideoCard';
import { searchAPI } from '../api';

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('relevance');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVideos, setTotalVideos] = useState(0);

  useEffect(() => {
    if (query) {
      searchVideos(query, 1, sortBy);
    }
  }, [query, sortBy]);

  const searchVideos = async (searchQuery, pageNum = 1, sort = 'relevance') => {
    if (!searchQuery.trim()) {
      setVideos([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await searchAPI.searchVideos(searchQuery, {
        page: pageNum,
        limit: 20,
        sortBy: sort
      });
      
      const data = response.data.data || [];
      const meta = response.data.meta || {};
      
      setVideos(data);
      setPage(meta.page || pageNum);
      setTotalPages(meta.totalPages || 1);
      setTotalVideos(meta.totalVideos || 0);
    } catch (error) {
      console.error('Error searching videos:', error);
      setError('Failed to search videos. Please try again.');
      setVideos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    if (query) {
      searchVideos(query, newPage, sortBy);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!query) {
    return (
      <div className="main-content">
        <div className="text-center" style={{ paddingTop: '80px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#606060' }}>
            Search for videos
          </h2>
          <p style={{ color: '#909090' }}>
            Enter a search query in the search bar above
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div style={{ marginBottom: '24px' }}>
        <h1 className="page-title">
          Search Results for "{query}"
        </h1>
        
        {totalVideos > 0 && (
          <p style={{ color: '#606060', marginTop: '8px' }}>
            {totalVideos} {totalVideos === 1 ? 'result' : 'results'} found
          </p>
        )}

        {/* Sort Options */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          marginTop: '16px',
          alignItems: 'center'
        }}>
          <span style={{ color: '#606060', fontWeight: '500' }}>Sort by:</span>
          <button
            onClick={() => handleSortChange('relevance')}
            className={sortBy === 'relevance' ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ padding: '6px 12px', fontSize: '14px' }}
          >
            Relevance
          </button>
          <button
            onClick={() => handleSortChange('views')}
            className={sortBy === 'views' ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ padding: '6px 12px', fontSize: '14px' }}
          >
            Most Viewed
          </button>
          <button
            onClick={() => handleSortChange('date')}
            className={sortBy === 'date' ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ padding: '6px 12px', fontSize: '14px' }}
          >
            Upload Date
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="video-grid">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="video-card">
              <div style={{ background: '#f0f0f0', height: '180px' }}></div>
              <div className="video-info">
                <div style={{ background: '#f0f0f0', height: '20px', marginBottom: '8px' }}></div>
                <div style={{ background: '#f0f0f0', height: '16px', width: '60%' }}></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center" style={{ paddingTop: '80px' }}>
          <div style={{ color: '#cc0000', fontSize: '18px', marginBottom: '16px' }}>
            {error}
          </div>
          <button onClick={() => searchVideos(query, page, sortBy)} className="btn btn-primary">
            Try Again
          </button>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center" style={{ paddingTop: '80px' }}>
          <div style={{ fontSize: '18px', marginBottom: '8px', color: '#606060' }}>
            No videos found
          </div>
          <p style={{ color: '#909090' }}>
            Try different keywords or check your spelling
          </p>
        </div>
      ) : (
        <>
          <div className="video-grid">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '8px', 
              marginTop: '32px',
              alignItems: 'center'
            }}>
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="btn btn-secondary"
                style={{ padding: '8px 16px' }}
              >
                Previous
              </button>
              
              <span style={{ color: '#606060' }}>
                Page {page} of {totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="btn btn-secondary"
                style={{ padding: '8px 16px' }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Search;


// src/pages/Channel.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { channelAPI, dashboardAPI, subscriptionAPI } from '../api';
import VideoCard from '../components/VideoCard';

const Channel = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subLoading, setSubLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await channelAPI.getByUsername(username);
      const data = res.data.data;
      setProfile(data);
      if (data?._id) {
        const vidsRes = await dashboardAPI.getChannelVideos(data._id);
        setVideos(vidsRes.data.data || []);
      }
    } catch (e) {
      setError('Failed to load channel');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const onToggleSubscribe = async () => {
    if (!profile?._id) return;
    try {
      setSubLoading(true);
      await subscriptionAPI.toggle(profile._id);
      // optimistic
      setProfile((p) => ({ ...p, isSubscribed: !p.isSubscribed }));
      const stats = await dashboardAPI.getChannelStats(profile._id);
      setProfile((p) => ({ ...p, subscribersCount: stats.data.data?.totalSubscribers || 0 }));
    } catch (e) {
      // ignore
    } finally {
      setSubLoading(false);
    }
  };

  if (loading) return <div className="container" style={{paddingTop: 80}}>Loading...</div>;
  if (error || !profile) return <div className="container" style={{paddingTop: 80}}>{error || 'Channel not found'}</div>;

  return (
    <div className="container" style={{paddingTop: 80}}>
      <div className="video-channel" style={{marginBottom: 16}}>
        <img src={profile.avatar || '/default-avatar.png'} alt={profile.username} className="channel-avatar" />
        <div className="channel-info">
          <div className="channel-name">{profile.username}</div>
          <div className="channel-subscribers">{(profile.subscribersCount ?? profile.subscribers ?? 0)} subscribers</div>
        </div>
        <button className="btn btn-primary" onClick={onToggleSubscribe} disabled={subLoading}>
          {subLoading ? 'Please wait...' : (profile.isSubscribed ? 'Subscribed' : 'Subscribe')}
        </button>
      </div>

      <h3>Videos</h3>
      <div className="video-grid">
        {videos.length === 0 ? (
          <div style={{color:'#606060'}}>No videos</div>
        ) : (
          videos.map(v => (
            <VideoCard key={v._id} video={v} />
          ))
        )}
      </div>
    </div>
  );
};

export default Channel;

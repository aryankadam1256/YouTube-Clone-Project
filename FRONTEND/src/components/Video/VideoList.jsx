import React, { useEffect, useState } from "react";
import { fetchVideos } from "../../api/videoApi";
import { Link } from "react-router-dom";

const VideoList = () => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    fetchVideos()
      .then((res) => setVideos(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      {videos.map((video) => (
        <div key={video._id}>
          <Link to={`/videos/${video._id}`}>
            <img src={video.thumbnail} alt={video.title} width={160} />
            <h3>{video.title}</h3>
          </Link>
          <p>By: {video.ownerDetails.fullName}</p>
        </div>
      ))}
    </div>
  );
};

export default VideoList;

import React, { useEffect, useState } from "react";
import { fetchVideoById } from "../../api/videoApi";
import { useParams } from "react-router-dom";

const VideoPlayer = () => {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);

  useEffect(() => {
    fetchVideoById(videoId)
      .then((res) => setVideo(res.data))
      .catch((err) => console.error(err));
  }, [videoId]);

  if (!video) return <div>Loading...</div>;

  return (
    <div>
      <video width="640" controls src={video.videoFile} />
      <h2>{video.title}</h2>
      <p>{video.description}</p>
      <p>Uploaded by: {video.ownerDetails.fullName}</p>
    </div>
  );
};

export default VideoPlayer;

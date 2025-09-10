// import fetch from "node-fetch";

const VIDEO_API_BASE = "/api/v1/videos";

export async function fetchVideos() {
  const response = await fetch(VIDEO_API_BASE, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch videos");
  return await response.json();
}

export async function fetchVideoById(videoId) {
  const response = await fetch(`${VIDEO_API_BASE}/${videoId}`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch video");
  return await response.json();
}

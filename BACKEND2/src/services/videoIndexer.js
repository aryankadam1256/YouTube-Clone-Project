import Video from "../models/video.model.js";
import User from "../models/user.model.js";
import { getEsClient } from "./esClient.js";
import { generateEmbedding } from "./embeddings.js";

const VIDEO_INDEX = process.env.ELASTICSEARCH_VIDEO_INDEX || "videos";

const buildDocument = (videoDoc, owner) => {
  const base = {
    title: videoDoc.title,
    description: videoDoc.description,
    tags: videoDoc.tags ?? [],
    language: videoDoc.language ?? "en",
    views: videoDoc.views ?? 0,
    isPublished: videoDoc.isPublished ?? true,
    duration: videoDoc.duration ?? 0,
    thumbnail: videoDoc.thumbnail,
    videoFile: videoDoc.videoFile,
    publishedAt: videoDoc.publishedAt ?? videoDoc.createdAt,
    createdAt: videoDoc.createdAt,
    updatedAt: videoDoc.updatedAt,
    ownerId: videoDoc.owner?.toString(),
    ownerUsername: owner?.username,
    ownerFullname: owner?.fullname,
    ownerAvatar: owner?.avatar,
    transcriptUrl: videoDoc.transcriptUrl ?? null,
  };

  if (videoDoc.transcript) {
    base.transcript = videoDoc.transcript;
  }

  if (Array.isArray(videoDoc.embedding)) {
    base.embedding = videoDoc.embedding;
  }

  return base;
};

export const indexVideo = async (videoId) => {
  const es = getEsClient();
  if (!es) return;

  const video = await Video.findById(videoId);
  if (!video) return;

  const owner = await User.findById(video.owner).select("username fullname avatar");

  // Ensure embedding exists
  if (!Array.isArray(video.embedding) || video.embedding.length === 0) {
    const text = [video.title, video.description, (video.tags || []).join(" ")].join(
      "\n"
    );
    const embedding = await generateEmbedding(text).catch(() => null);
    if (embedding) {
      video.embedding = embedding;
      await video.save();
    }
  }

  await es.index({
    index: VIDEO_INDEX,
    id: video._id.toString(),
    document: buildDocument(video.toObject(), owner),
    refresh: process.env.ELASTICSEARCH_REFRESH_IMMEDIATE === "true" ? "wait_for" : false,
  });
};

export const removeVideo = async (videoId) => {
  const es = getEsClient();
  if (!es) return;
  await es.delete({
    index: VIDEO_INDEX,
    id: videoId.toString(),
    ignore: [404],
    refresh: process.env.ELASTICSEARCH_REFRESH_IMMEDIATE === "true" ? "wait_for" : false,
  });
};

export const bulkIndexVideos = async (videoIds = []) => {
  const es = getEsClient();
  if (!es) return;
  const videos = await Video.find(
    videoIds.length ? { _id: { $in: videoIds } } : {}
  ).limit(1000);

  const ownerMap = new Map();
  await Promise.all(
    videos.map(async (video) => {
      if (!ownerMap.has(video.owner.toString())) {
        const owner = await User.findById(video.owner).select(
          "username fullname avatar"
        );
        ownerMap.set(video.owner.toString(), owner);
      }
    })
  );

  const operations = [];
  for (const video of videos) {
    const owner = ownerMap.get(video.owner.toString());
    operations.push({ index: { _index: VIDEO_INDEX, _id: video._id.toString() } });
    operations.push(buildDocument(video.toObject(), owner));
  }

  if (operations.length === 0) return;

  await es.bulk({
    refresh: process.env.ELASTICSEARCH_REFRESH_IMMEDIATE === "true" ? "wait_for" : false,
    operations,
  });
};


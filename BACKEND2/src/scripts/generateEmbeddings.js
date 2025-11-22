import mongoose from "mongoose";
import dotenv from "dotenv";
import Video from "../models/video.model.js";
import { generateEmbedding } from "../services/embeddings.js";
import { indexVideo } from "../services/videoIndexer.js";
import { DB_NAME } from "../constants.js";

dotenv.config({ path: "./.env" });

const generateAllEmbeddings = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI.includes(DB_NAME) 
      ? process.env.MONGODB_URI 
      : `${process.env.MONGODB_URI}/${DB_NAME}`;
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    const videos = await Video.find({});
    console.log(`Found ${videos.length} videos.`);

    for (const video of videos) {
      if (video.embedding && video.embedding.length > 0) {
        console.log(`Skipping ${video.title} (already has embedding)`);
        continue;
      }

      console.log(`Generating embedding for: ${video.title}`);
      const text = `${video.title}\n${video.description}\n${(video.tags || []).join(" ")}`;
      
      try {
        const embedding = await generateEmbedding(text);
        if (embedding) {
          video.embedding = embedding;
          await video.save();
          await indexVideo(video._id); // Re-index to ES
          console.log(`✅ Saved & Indexed: ${video.title}`);
        } else {
          console.warn(`⚠️ Failed to generate embedding for: ${video.title}`);
        }
      } catch (err) {
        console.error(`❌ Error processing ${video.title}:`, err.message);
      }

      // Wait a bit to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log("🎉 All embeddings generated!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

generateAllEmbeddings();

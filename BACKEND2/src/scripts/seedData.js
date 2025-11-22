import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";
import Video from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import bcrypt from "bcrypt";
import { DB_NAME } from "../constants.js";
import { bulkIndexVideos } from "../services/videoIndexer.js";

dotenv.config({ path: "./.env" });

const seedData = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI.includes(DB_NAME) 
      ? process.env.MONGODB_URI 
      : `${process.env.MONGODB_URI}/${DB_NAME}`;
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Create sample users
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    // Check if users already exist
    const existingUsers = await User.find({ username: { $in: ["demo_user1", "demo_user2", "demo_user3"] } });
    let users;
    
    if (existingUsers.length >= 3) {
      console.log("⚠️  Demo users already exist. Using existing users.");
      users = existingUsers.slice(0, 3);
    } else {
      users = await User.insertMany([
        {
          username: "demo_user1",
          email: "demo1@example.com",
          fullname: "Demo User One",
          password: hashedPassword,
          avatar: "https://via.placeholder.com/150/FF0000/FFFFFF?text=User1",
          coverImage: "https://via.placeholder.com/800x200/FF0000/FFFFFF?text=Cover1"
        },
        {
          username: "demo_user2",
          email: "demo2@example.com",
          fullname: "Demo User Two",
          password: hashedPassword,
          avatar: "https://via.placeholder.com/150/0000FF/FFFFFF?text=User2",
          coverImage: "https://via.placeholder.com/800x200/0000FF/FFFFFF?text=Cover2"
        },
        {
          username: "demo_user3",
          email: "demo3@example.com",
          fullname: "Demo User Three",
          password: hashedPassword,
          avatar: "https://via.placeholder.com/150/00FF00/FFFFFF?text=User3",
          coverImage: "https://via.placeholder.com/800x200/00FF00/FFFFFF?text=Cover3"
        }
      ]);
      console.log(`✅ Created ${users.length} demo users`);
    }

    console.log("   Username: demo_user1, demo_user2, or demo_user3");
    console.log("   Password: password123");

    // Check if videos already exist
    const existingVideos = await Video.countDocuments();
    if (existingVideos > 0) {
      console.log(`⚠️  ${existingVideos} videos already exist. Adding more videos...`);
    }

    // Create MORE sample videos (15+ videos)
    const videoTemplates = [
      {
        title: "Getting Started with React",
        description: "Learn the fundamentals of React including components, props, and state management. This comprehensive tutorial covers everything you need to know to start building React applications.",
        thumbnail: "https://via.placeholder.com/1280x720/FF6B6B/FFFFFF?text=React+Tutorial",
        duration: 600,
        views: 1500,
        ownerIndex: 0,
        tags: ["react", "javascript", "frontend", "hooks"],
        language: "en",
        transcript: "In this beginner-friendly React tutorial we build a Todo app step by step, explaining JSX, components, and hooks as we go."
      },
      {
        title: "Node.js Backend Development",
        description: "Complete guide to building RESTful APIs with Node.js and Express. Learn about routing, middleware, database integration, and authentication. Perfect for beginners and intermediate developers.",
        thumbnail: "https://via.placeholder.com/1280x720/4ECDC4/FFFFFF?text=Node.js+Tutorial",
        duration: 1200,
        views: 2500,
        ownerIndex: 1,
        tags: ["nodejs", "express", "backend", "api"],
        language: "en",
        transcript: "We scaffold an Express server, connect to MongoDB, implement JWT authentication, and deploy the API to Render."
      },
      {
        title: "MongoDB Database Tutorial",
        description: "Master MongoDB from basics to advanced queries. Learn about schemas, aggregation pipelines, indexing, and best practices for database design. Includes real-world examples.",
        thumbnail: "https://via.placeholder.com/1280x720/95E1D3/FFFFFF?text=MongoDB+Tutorial",
        duration: 900,
        views: 3200,
        ownerIndex: 0,
        tags: ["mongodb", "database", "nosql", "aggregation"],
        language: "en",
        transcript: "We design a schema for a video platform, optimize indexes, and use aggregation pipelines for analytics."
      },
      {
        title: "JavaScript ES6+ Features",
        description: "Explore modern JavaScript features including arrow functions, destructuring, async/await, promises, and modules. Essential knowledge for modern web development.",
        thumbnail: "https://via.placeholder.com/1280x720/F38181/FFFFFF?text=JavaScript+Tutorial",
        duration: 750,
        views: 1800,
        ownerIndex: 1,
        tags: ["javascript", "es6", "promises", "async"],
        language: "en",
        transcript: "We refactor legacy callbacks into modern async-await patterns and showcase destructuring tricks developers love."
      },
      {
        title: "CSS Grid and Flexbox Guide",
        description: "Learn modern CSS layout techniques with Grid and Flexbox. Build responsive designs and master the art of CSS layout systems. Includes practical examples.",
        thumbnail: "https://via.placeholder.com/1280x720/AA96DA/FFFFFF?text=CSS+Tutorial",
        duration: 480,
        views: 2100,
        ownerIndex: 2,
        tags: ["css", "grid", "flexbox", "responsive"],
        language: "en",
        transcript: "We build a responsive dashboard using CSS Grid for structure and Flexbox for individual component alignment."
      },
      {
        title: "Python Programming Basics",
        description: "Introduction to Python programming language. Learn syntax, data structures, functions, and object-oriented programming. Perfect starting point for beginners.",
        thumbnail: "https://via.placeholder.com/1280x720/FFA07A/FFFFFF?text=Python+Tutorial",
        duration: 1800,
        views: 4500,
        ownerIndex: 0,
        tags: ["python", "basics", "programming", "beginner"],
        language: "en",
        transcript: "We cover variables, loops, functions, and finish by building a command-line expense tracker."
      },
      {
        title: "Docker Containerization Guide",
        description: "Learn how to containerize your applications with Docker. Understand images, containers, volumes, and Docker Compose. Deploy applications efficiently.",
        thumbnail: "https://via.placeholder.com/1280x720/20B2AA/FFFFFF?text=Docker+Tutorial",
        duration: 1500,
        views: 3800,
        ownerIndex: 1,
        tags: ["docker", "devops", "containers", "compose"],
        language: "en",
        transcript: "We turn a Node and React monorepo into containers, configure Docker Compose, and push the image to Docker Hub."
      },
      {
        title: "Git and GitHub Mastery",
        description: "Master version control with Git and GitHub. Learn branching, merging, pull requests, and collaboration workflows. Essential for every developer.",
        thumbnail: "https://via.placeholder.com/1280x720/9370DB/FFFFFF?text=Git+Tutorial",
        duration: 900,
        views: 2900,
        ownerIndex: 2,
        tags: ["git", "github", "version-control", "workflow"],
        language: "en",
        transcript: "We simulate a team workflow with feature branches, code reviews, resolving merge conflicts, and squash merges."
      },
      {
        title: "TypeScript Fundamentals",
        description: "Learn TypeScript from scratch. Understand types, interfaces, generics, and how to use TypeScript with React and Node.js. Level up your JavaScript skills.",
        thumbnail: "https://via.placeholder.com/1280x720/4169E1/FFFFFF?text=TypeScript+Tutorial",
        duration: 1100,
        views: 2200,
        ownerIndex: 0,
        tags: ["typescript", "types", "react", "node"],
        language: "en",
        transcript: "We migrate a JavaScript project to TypeScript, adding interfaces, generics, and strict compiler settings."
      },
      {
        title: "REST API Design Best Practices",
        description: "Learn how to design and build RESTful APIs. Understand HTTP methods, status codes, authentication, and API documentation. Build production-ready APIs.",
        thumbnail: "https://via.placeholder.com/1280x720/32CD32/FFFFFF?text=API+Tutorial",
        duration: 1350,
        views: 3400,
        ownerIndex: 1,
        tags: ["rest", "api", "design", "best-practices"],
        language: "en",
        transcript: "We design a REST API, define resources, implement validation, and document endpoints with OpenAPI."
      },
      {
        title: "Webpack and Build Tools",
        description: "Understand modern build tools like Webpack, Vite, and Parcel. Learn bundling, code splitting, and optimization techniques for production applications.",
        thumbnail: "https://via.placeholder.com/1280x720/FF6347/FFFFFF?text=Build+Tools",
        duration: 1000,
        views: 1900,
        ownerIndex: 2,
        tags: ["webpack", "bundler", "vite", "performance"],
        language: "en",
        transcript: "We compare bundlers, enable code splitting, configure tree shaking, and measure bundle size improvements."
      },
      {
        title: "GraphQL API Development",
        description: "Introduction to GraphQL. Learn queries, mutations, subscriptions, and how to build GraphQL APIs with Node.js. Modern alternative to REST.",
        thumbnail: "https://via.placeholder.com/1280x720/E91E63/FFFFFF?text=GraphQL+Tutorial",
        duration: 1200,
        views: 2600,
        ownerIndex: 0,
        tags: ["graphql", "api", "apollo", "subscriptions"],
        language: "en",
        transcript: "We build a GraphQL server with Apollo, define schemas, implement resolvers, and add real-time subscriptions."
      },
      {
        title: "React Hooks Deep Dive",
        description: "Master React Hooks including useState, useEffect, useContext, and custom hooks. Learn best practices and common patterns for modern React development.",
        thumbnail: "https://via.placeholder.com/1280x720/9C27B0/FFFFFF?text=React+Hooks",
        duration: 800,
        views: 3100,
        ownerIndex: 1,
        tags: ["react", "hooks", "state", "custom-hooks"],
        language: "en",
        transcript: "We build reusable hooks for data fetching, debounce, and subscriptions, and refactor class components."
      },
      {
        title: "Express.js Middleware Guide",
        description: "Deep dive into Express.js middleware. Learn to create custom middleware, error handling, authentication, and request processing. Build robust backends.",
        thumbnail: "https://via.placeholder.com/1280x720/FF9800/FFFFFF?text=Express+Tutorial",
        duration: 950,
        views: 2800,
        ownerIndex: 2,
        tags: ["express", "middleware", "nodejs", "backend"],
        language: "en",
        transcript: "We implement logging, rate limiting, error handling, and organize middleware stacks for production."
      },
      {
        title: "Database Design Principles",
        description: "Learn database design fundamentals. Understand normalization, relationships, indexing, and query optimization. Design efficient database schemas.",
        thumbnail: "https://via.placeholder.com/1280x720/607D8B/FFFFFF?text=Database+Design",
        duration: 1400,
        views: 3600,
        ownerIndex: 0,
        tags: ["database", "design", "normalization", "indexing"],
        language: "en",
        transcript: "We design schemas for e-commerce, apply normalization, and run explain plans to tune performance."
      },
      {
        title: "Authentication and Security",
        description: "Implement secure authentication systems. Learn JWT tokens, password hashing, OAuth, and security best practices. Protect your applications.",
        thumbnail: "https://via.placeholder.com/1280x720/F44336/FFFFFF?text=Security+Tutorial",
        duration: 1100,
        views: 4100,
        ownerIndex: 1,
        tags: ["security", "authentication", "jwt", "oauth"],
        language: "en",
        transcript: "We implement password hashing, refresh tokens, OAuth login, and security headers for production readiness."
      },
      {
        title: "Testing with Jest and React",
        description: "Learn testing fundamentals with Jest and React Testing Library. Write unit tests, integration tests, and test React components. Ensure code quality.",
        thumbnail: "https://via.placeholder.com/1280x720/4CAF50/FFFFFF?text=Testing+Tutorial",
        duration: 850,
        views: 2400,
        ownerIndex: 2,
        tags: ["testing", "jest", "react-testing-library", "quality"],
        language: "en",
        transcript: "We configure Jest, mock APIs, write accessibility tests, and add coverage thresholds to CI."
      },
      {
        title: "Deployment Strategies",
        description: "Learn how to deploy applications to production. Understand CI/CD, cloud platforms, Docker deployment, and monitoring. Ship your projects.",
        thumbnail: "https://via.placeholder.com/1280x720/2196F3/FFFFFF?text=Deployment+Guide",
        duration: 1300,
        views: 3900,
        ownerIndex: 0,
        tags: ["deployment", "ci/cd", "devops", "monitoring"],
        language: "en",
        transcript: "We configure GitHub Actions, deploy containers to AWS, add health checks, and monitor with Grafana."
      },
      {
        title: "Microservices Architecture",
        description: "Introduction to microservices architecture. Learn service decomposition, API gateways, service communication, and distributed systems design.",
        thumbnail: "https://via.placeholder.com/1280x720/FF5722/FFFFFF?text=Microservices",
        duration: 1600,
        views: 2700,
        ownerIndex: 1,
        tags: ["microservices", "architecture", "distributed", "kubernetes"],
        language: "en",
        transcript: "We break a monolith into services, set up an API gateway, implement service discovery, and handle failures."
      },
      {
        title: "WebSocket Real-time Communication",
        description: "Build real-time applications with WebSockets. Learn Socket.io, real-time chat, live updates, and bidirectional communication. Create interactive apps.",
        thumbnail: "https://via.placeholder.com/1280x720/795548/FFFFFF?text=WebSocket+Tutorial",
        duration: 720,
        views: 2000,
        ownerIndex: 2,
        tags: ["websocket", "realtime", "socket.io", "chat"],
        language: "en",
        transcript: "We build a live chat with Socket.io, presence indicators, and deploy the service with sticky sessions."
      },
      {
        title: "Transformer Models Explained",
        description: "Understand the Transformer architecture behind modern NLP models. We cover attention, positional encoding, and scaling laws.",
        thumbnail: "https://via.placeholder.com/1280x720/673AB7/FFFFFF?text=Transformers",
        duration: 1250,
        views: 5200,
        ownerIndex: 0,
        tags: ["transformers", "nlp", "deep-learning", "attention"],
        language: "en",
        transcript: "We visualize self-attention, walk through encoder-decoder stacks, and inspect activations in a translation model."
      },
      {
        title: "NLP with Hugging Face Transformers",
        description: "Fine-tune Hugging Face transformer models for text classification, summarization, and question answering in production.",
        thumbnail: "https://via.placeholder.com/1280x720/3F51B5/FFFFFF?text=HuggingFace",
        duration: 1600,
        views: 4800,
        ownerIndex: 1,
        tags: ["huggingface", "transformers", "finetuning", "nlp"],
        language: "en",
        transcript: "We fine-tune a BERT model on customer reviews, evaluate with F1 score, and deploy using FastAPI."
      },
      {
        title: "Vector Databases 101",
        description: "Learn vector database fundamentals, similarity search, and how to store embeddings for semantic search and recommendations.",
        thumbnail: "https://via.placeholder.com/1280x720/009688/FFFFFF?text=Vector+DB",
        duration: 980,
        views: 3100,
        ownerIndex: 2,
        tags: ["vector-database", "semantic-search", "embeddings", "ann"],
        language: "en",
        transcript: "We compare FAISS, Pinecone, and Elasticsearch vector search, then build a semantic search prototype."
      },
      {
        title: "Building Recommendation Systems",
        description: "From collaborative filtering to deep learning recommenders. Build personalized feeds using implicit feedback and embeddings.",
        thumbnail: "https://via.placeholder.com/1280x720/8BC34A/FFFFFF?text=Recommenders",
        duration: 1500,
        views: 3700,
        ownerIndex: 0,
        tags: ["recommendation", "collaborative-filtering", "ranking", "ml"],
        language: "en",
        transcript: "We implement matrix factorization, build a two-tower model, and evaluate ranking metrics like NDCG."
      },
      {
        title: "Elasticsearch for Developers",
        description: "Hands-on guide to Elasticsearch covering indexing, querying, aggregations, and vector search with hybrid ranking strategies.",
        thumbnail: "https://via.placeholder.com/1280x720/FFB300/FFFFFF?text=Elasticsearch",
        duration: 1300,
        views: 3300,
        ownerIndex: 1,
        tags: ["elasticsearch", "search", "bm25", "vector"],
        language: "en",
        transcript: "We index documents, run aggregations, configure analyzers, and add hybrid search combining BM25 and ANN."
      },
      {
        title: "Productionizing LLM Applications",
        description: "Best practices for building LLM-powered apps including prompt engineering, evaluation, caching, and safety guardrails.",
        thumbnail: "https://via.placeholder.com/1280x720/607D8B/FFFFFF?text=LLM+Apps",
        duration: 1700,
        views: 4200,
        ownerIndex: 2,
        tags: ["llm", "prompt-engineering", "safety", "evaluation"],
        language: "en",
        transcript: "We design retrieval-augmented generation, add moderation filters, and collect feedback to improve prompts."
      },
      {
        title: "Building a YouTube Search Clone",
        description: "Implement a YouTube-style search experience using Elasticsearch, embeddings, and reranking strategies for high relevance.",
        thumbnail: "https://via.placeholder.com/1280x720/EF6C00/FFFFFF?text=Search+Clone",
        duration: 1450,
        views: 3900,
        ownerIndex: 0,
        tags: ["search", "youtube-clone", "hybrid", "rrf"],
        language: "en",
        transcript: "We ingest video metadata, compute sentence embeddings, configure BM25 with synonyms, and apply reciprocal rank fusion."
      },
      {
        title: "Session-Based Recommendations",
        description: "Use Transformers for session-based recommendation with SASRec and next-event prediction on streaming data.",
        thumbnail: "https://via.placeholder.com/1280x720/1E88E5/FFFFFF?text=SASRec",
        duration: 1250,
        views: 2800,
        ownerIndex: 1,
        tags: ["recommendation", "sasrec", "transformers", "session-based"],
        language: "en",
        transcript: "We preprocess session data, train a SASRec model, and deploy it behind a low-latency API."
      }
    ];

    // Sample video URLs (you can replace these with actual Cloudinary URLs)
    const videoUrls = [
      "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
      "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_2mb.mp4",
      "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_5mb.mp4",
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
    ];

    // Create videos
    const videosToInsert = videoTemplates.map((template, index) => {
      const createdAt = new Date(Date.now() - index * 24 * 60 * 60 * 1000);
      return {
        title: template.title,
        description: template.description,
        videoFile: videoUrls[index % videoUrls.length],
        thumbnail: template.thumbnail,
        duration: template.duration,
        views: template.views,
        isPublished: true,
        owner: users[template.ownerIndex % users.length]._id,
        tags: template.tags,
        language: template.language,
        transcript: template.transcript,
        createdAt,
        updatedAt: createdAt,
        publishedAt: createdAt
      };
    });

    const videos = await Video.insertMany(videosToInsert);
    console.log(`✅ Created ${videos.length} sample videos`);

    try {
      await bulkIndexVideos(videos.map((video) => video._id));
      console.log("🔁 Indexed videos into Elasticsearch");
    } catch (error) {
      console.warn("⚠️  Failed to index videos into Elasticsearch:", error.message);
    }

    // Create subscriptions (if they don't exist)
    const existingSubs = await Subscription.countDocuments();
    if (existingSubs === 0 && users.length >= 2) {
      const subscriptions = await Subscription.insertMany([
        {
          subscriber: users[0]._id,
          channel: users[1]._id
        },
        {
          subscriber: users[0]._id,
          channel: users[2]._id
        },
        {
          subscriber: users[1]._id,
          channel: users[2]._id
        }
      ]);
      console.log(`✅ Created ${subscriptions.length} subscriptions`);
    }

    console.log("\n🎉 Seed data setup complete!");
    console.log(`\n📊 Summary:`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Videos: ${await Video.countDocuments()}`);
    console.log(`   - Subscriptions: ${await Subscription.countDocuments()}`);
    console.log("\n📝 Next steps:");
    console.log("   1. Start backend: cd BACKEND2 && npm run dev");
    console.log("   2. Start frontend: cd FRONTEND-2 && npm run dev");
    console.log("   3. Login with: demo_user1 / password123");
    console.log("   4. You should see all videos on the home page!");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

seedData();


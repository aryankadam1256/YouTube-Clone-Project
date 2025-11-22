import axios from "axios";

const BASE_URL = "http://localhost:8000/api/v1";
let accessToken = "";

const login = async () => {
    try {
        const res = await axios.post(`${BASE_URL}/users/login`, {
            username: "demo_user1",
            password: "password123",
        });
        accessToken = res.data.data.accessToken;
        console.log("✅ Login successful");
    } catch (error) {
        console.error("❌ Login failed:", error.response?.data || error.message);
        process.exit(1);
    }
};

const searchAndWatch = async (query) => {
    try {
        console.log(`\n🔍 Searching for: ${query}`);
        const res = await axios.get(`${BASE_URL}/search/videos?q=${query}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const videos = res.data.data;
        console.log(`Found ${videos.length} videos.`);

        if (videos.length > 0) {
            const video = videos[0];
            console.log(`👀 Watching: ${video.title}`);
            // Simulate watching by adding to history (if endpoint exists) or just fetching details
            await axios.get(`${BASE_URL}/videos/${video._id}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            return video._id;
        }
    } catch (error) {
        console.error("❌ Search/Watch failed:", error.response?.data || error.message);
    }
};

const getRecommendations = async () => {
    try {
        console.log("\n🔮 Fetching Recommendations...");
        const res = await axios.get(`${BASE_URL}/recommendations`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const videos = res.data.data;
        console.log(`Received ${videos.length} recommendations:`);
        videos.forEach((v, i) => {
            console.log(`${i + 1}. ${v.title} (Score: ${v.score || 'N/A'})`);
        });
    } catch (error) {
        console.error("❌ Recommendations failed:", error.response?.data || error.message);
    }
};

const runTest = async () => {
    await login();

    // 1. Initial Recommendations
    await getRecommendations();

    // 2. Watch a specific topic (e.g., Python)
    await searchAndWatch("python");
    await searchAndWatch("django"); // Assuming django/python related

    // 3. Recommendations after watching
    console.log("\n--- After watching Python videos ---");
    await getRecommendations();
};

runTest();

// import axios from "axios";

// // const API_BASE = import.meta.env.VITE_API_BASE || "/api/v1";
// const API_BASE = "/api/v1/users";

// const api = axios.create({
//     baseURL: "/api/v1", // use relative path to enable Vite proxy
//     withCredentials: true,
// });

// export const getVideos = async () => {
//     try {
//       const response = await api.get("/videos");
//       return response.data;
//     } catch (error) {
//       console.error(error);
//       throw error;
//     }
//   };
  
//   export const getVideo = async (id) => {
//     try {
//       const response = await api.get(`/videos/${id}`);
//       return response.data;
//     } catch (error) {
//       console.error(error);
//       throw error;
//     }
//   };
  
//   export const createVideo = async (videoData) => {
//     try {
//       const response = await api.post("/videos", videoData);
//       return response.data;
//     } catch (error) {
//       console.error(error);
//       throw error;
//     }
//   };
  
//   export const updateVideo = async (id, videoData) => {
//     try {
//       const response = await api.put(`/videos/${id}`, videoData);
//       return response.data;
//     } catch (error) {
//       console.error(error);
//       throw error;
//     }
//   };
  
//   export const deleteVideo = async (id) => {
//     try {
//       const response = await api.delete(`/videos/${id}`);
//       return response.data;
//     } catch (error) {
//       console.error(error);
//       throw error;
//     }
//   };



// export default api;

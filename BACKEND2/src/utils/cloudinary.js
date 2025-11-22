 import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
import { ApiError } from "../utils/ApiError.js";
dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


export const uploadCloudinary = async (localFilePath) => {
   try{
       if(!localFilePath) return null;
       // upload the file on cloudinary
  const response = await cloudinary.uploader.upload(localFilePath,{
   resource_type: "auto",
  });
  // file has been uploaded successfully
  console.log("File uploaded successfully on cloudinary", response.secure_url || response.url);
  if (localFilePath && fs.existsSync(localFilePath)) {
       fs.unlinkSync(localFilePath);
  }
  return response;
   }
   catch(err){
   //   fs.unlinkSync(localFilePath);
   // // remove the locally saved temp file
   // // as upload operation got failed
   //     console.log("Error while uploading file on cloudinary",err);
   //     return null;

         if (localFilePath && fs.existsSync(localFilePath)) {
              fs.unlinkSync(localFilePath);
           }
           console.error("Error while uploading file on cloudinary", err);
          throw new ApiError(500, "Failed to upload media");
   }  
};
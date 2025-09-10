// require("dotenv").config({path:"./env"});
import dotenv from "dotenv";
import { app } from "./app.js";
// import mongoose from "mongoose"
// import { DB_NAME } from "../constants";
import connectDB from "./db/index.js";

dotenv.config({ path: "./.env" });

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log("server is running on port ",process.env.PORT || 8000);
    });
}
    )
.catch((err)=>{
    console.log("mongodb connection failed ",err);
})



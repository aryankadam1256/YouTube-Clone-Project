import mongoose from "mongoose"
import { DB_NAME } from "../constants.js";


const connectDB = async () => {
    try {
      console.log("MONGODB_URI:", process.env.MONGODB_URI)
      const conn = await mongoose.connect(process.env.MONGODB_URI)
      console.log(`\n MongoDB Connected .. DB HOST : ${conn.connection.host}`)
      console.log(`\n Connected to MongoDB ${conn}`)
    } catch (error) {
      console.log("mongodb connection error ", error)
      process.exit(1)
    }
  }
// const connectDB=async ()=>{
//     try {
        
//         const conn=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         console.log(`\n MongoDB Connected .. DB HOST : ${conn.connection.host}`);
//         console.log(`\N Connected to MongoDB ${conn}`);
//     } catch (error) {
//         console.log("mongodb connection error ",error);
//         process.exit(1)
//     }
// }
export default connectDB;
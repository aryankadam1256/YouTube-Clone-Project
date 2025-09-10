import mongoose,{Schema} from "mongoose";
const susbscriptionSchema= new Schema({
   subscriber:{
    type:Schema.Types.ObjectId,// one who subscribes
    ref:"User",
    required:true
   },
   channel:{
    type:Schema.Types.ObjectId, // one to whom subscriber subscribes
    ref:"User",
    required:true
   }
},
{
    timestamps:true
})

export const Subscription =mongoose.model("Subscription",susbscriptionSchema)
import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema=new Schema(
    {
      videoFile:{
        type:String, // cloudinary url
        required:true
      },
      thumbnail:{
        type:String,
        required:true
      },
      title:{
        type:String,
        required:true
      },
      description:{
        type:String,
        required:true
      },
      duration:{
        type:Number, // seconds
        required:true
      },
      tags:{
        type:[String],
        index:true,
        default:[]
      },
      language:{
        type:String,
        index:true,
        default:"en"
      },
      views:{
        type:Number,
        default:0
      },
      isPublished:{
        type:Boolean,
        default:true
      },
      publishedAt:{
        type:Date,
        default:()=>new Date()
      },
      transcript:{
        type:String,
        default:""
      },
      embedding:{
        type:[Number],
        select:false,
        default:undefined
      },
      transcriptUrl:{
        type:String,
        default:null
      },
      owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
      },

    },
    {
       timestamps:true
    }
    )
    
    videoSchema.plugin(mongooseAggregatePaginate);
    export default mongoose.model("Video",videoSchema);
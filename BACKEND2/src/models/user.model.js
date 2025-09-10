import mongoose,{ Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const userSchema=new Schema(
    {
      username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true // for optimal search in database
      },
      email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
      },
      fullname:{
        type:String,
        required:true,
        trim:true,
        index:true
      },
      
      avatar:{
        type:String,// cludinary url 
        required:true
      },
      coverImage:{
        type:String,
      },
      password:{
        type:String,
        required:[true,"password is required"],
      },
      watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
         }
      ],
      refreshToken: {
        type: String,
      },

    },
    {
        timestamps:true
    }

)

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();
    const salt=await bcrypt.genSalt(10);
    this.password=await bcrypt.hash(this.password,salt);
    next();
})

// We use  .methods property by which we ca nadd custom methods to a model

/**
 * Checks if the provided password matches the stored password.
 * @param {string} password - The password to check.
 * @returns {Promise<boolean>} True if the password is correct, false otherwise.
 */ 
userSchema.methods.isPasswordCorrect = async function(password) {
    // Use bcrypt to compare the provided password with the stored hashed password
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken=function(){
  return jwt.sign(
    {
      _id:this._id,
      username:this.username,
      email:this.email,
      fullname:this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}

userSchema.methods.generateRefreshToken=function(){
  return jwt.sign(
    {
      _id:this._id,
      username:this.username,
      email:this.email,
      fullname:this.fullname
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}
// userSchema.methods.generateRefreshToken=function(){ }

export default mongoose.model("User",userSchema);
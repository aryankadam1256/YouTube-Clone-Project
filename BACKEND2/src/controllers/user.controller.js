import asyncHandler from "../utils/asyncHandler.js";
// import User from "../models/user.model.js";
import User from "../models/user.model.js";
import {uploadCloudinary} from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
// 1) register user
const registerUser=asyncHandler(async(req,res,next)=>{
    // res.status(200).json({
    //     message:"ok"
    // });

//steps:-
    // get user details from frontend
    // validation - not empty
    // check if user already exists : username, email
    // check for images, check for avatar
    // upload them to cloudinary , avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const {username,fullname,email,password}=req.body;
console.log("username: ",username);

// step 2
    if([fullname,email,username,password].some((field)=> field?.trim() === "")){
        throw new ApiError(400,"All fields are required");
    }
    // ))
//step 3
    const existedUser=await User.findOne({
        $or:[{username},{email}]
    })
    if(existedUser){
        throw new ApiError(400,"User with Username or Email already exists");
    }
// step 4
//     const avatarLocalPath=req.files?.avatar[0].path;
//     const coverImageLocalPath=req.files?.coverImage[0].path;

//     if(!avatarLocalPath){
//         throw new ApiError(400,"Avatar is required");
//     }
// // step 5
//     const avatar=await uploadCloudinary(avatarLocalPath);
// const coverImage=await uploadCloudinary(coverImageLocalPath);
// if(!avatar || !avatar.url){
//     throw new ApiError(400,"Avatar is required");
// }
const avatarFile = req.files?.avatar?.[0];
const coverFile = req.files?.coverImage?.[0];

if (!avatarFile) {
    throw new ApiError(400, "Avatar is required");
}

const avatar = await uploadCloudinary(avatarFile.path);
const coverImage = coverFile ? await uploadCloudinary(coverFile.path) : null;

const avatarUrl = avatar?.secure_url || avatar?.url;
const coverImageUrl = coverImage?.secure_url || coverImage?.url || "";

if (!avatarUrl) {
    throw new ApiError(400, "Avatar upload failed");
}
// step 6
const user=await User.create({
    fullname,
    avatar: avatarUrl,
    coverImage: coverImageUrl,

    email: email.toLowerCase(),
    password,
    username:username.toLowerCase()

})
const createdUser=await User.findById(user._id).select(
    "-password -refreshToken"
    );

    if(!createdUser){
        throw new ApiError(500,"User creation failed");
    }

    return res.status(201).json(
        new ApiResponse(201,createdUser,"User registered successfully")
    );
//res.status(201).json(createdUser);
});
// acces and refresh token generation
const generateAccessTokenAndRefreshToken=async function(user_id){
    try{
        const user= await User.findById(user_id);
    const accessToken=user.generateAccessToken();
    const refreshToken=user.generateRefreshToken();
    user.refreshToken=refreshToken;

    await user.save({validateBeforeSave:false});
    return {accessToken,refreshToken};
    }
    catch(error){
        throw new ApiError(500,"Something went wrong while generating access token and refersh token");
    }
}

// 2) login user
const loginUser=asyncHandler(async(req,res,next)=>{

// step 1:- EXTRACT USER DETAILS
const {username,password,email}=req.body;
const normalizedUsername = typeof username === "string" ? username.trim().toLowerCase() : undefined;
const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : undefined;

// step 2:- CHECK FOR MISSING DETIALS FILLED
// if({username,password,email}.some((field)=> field?.trim() === "")){
//     throw new ApiError(400,"All fields are required");
// }
if(!(normalizedUsername || normalizedEmail)){
    throw new ApiError(400,"username or email is required");
}

// step 3:- VALIDATE IF THE DETAILS EXIST IN THE DATABASE OR NOT
const user= await User.findOne({
    $or:[
        ...(normalizedUsername ? [{ username: normalizedUsername }] : []),
        ...(normalizedEmail ? [{ email: normalizedEmail }] : [])
    ]
});

if(user){

}
else{
   throw new ApiError(404,"User not found");
}

// STEP 4 :-  CHECK IF THE PASSWORD IS CORRECT

 const isPasswordValid=await user.isPasswordCorrect(password);        

 if(!isPasswordValid){
   throw new ApiError(401,"Password is incorrect");
 }
// STEP 5 :- CREATE JWT TOKEN AND SEND IT BACK TO THE USER

 const {accessToken,refreshToken}=await generateAccessTokenAndRefreshToken(user._id);
 
 const loggedInUser=await User
 .findById(user._id)
 .select(
    "-password -refreshToken"
 );
 const options={
     httpOnly:true,
     secure:true
 }

 res
 .status(200)
 .cookie("accessToken",accessToken,options)
 .cookie("refreshToken",refreshToken,options)
 .json(
    new ApiResponse(
        200,
        {
            user:loggedInUser,accessToken,refreshToken
        },
        "User logged in successfully"
    )
   
 )

});

// 3) LogOut User
const logoutUser=asyncHandler(async(req,res,next)=>{
// step 1 :- by using findById
    const user= await User.findById(req.user._id);
    if(!user){
        throw new ApiError(404,"User not found");
    }
    if(!user.refreshToken){
        throw new ApiError(400,"User is not logged in");
    }
    user.refreshToken=undefined;
// step 2 :- by using findByIdAndUpdate
// await User.findByIdAndUpdate(
//     req.user._id,
//     {
//         $unset: {
//             refreshToken: 1 // this removes the field from document
//         }
//     },
//     {
//         new: true
//     }
// )

    const options={
        httpOnly:true,
        secure:true
    }

    res.status(200).clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(
        200,
        "User logged out successfully",
        {}
        ));
})
// 4 refresh access token
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, refreshToken: newRefreshToken} = await generateAccessTokenAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})
    
// 5) Update userpassword
const changeCurrentPassword=asyncHandler(async (req,res)=>{
    const { oldPassword,newPassword}=req.body;

    const user = await User.findById(req.user?._id);
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect){
        throw new ApiError(401,"Old password is incorrect");
    }
    user.password=newPassword;
    await user.save({validateBeforeSave:false});
    return res.status(200).json(new ApiResponse(
        200,
        "Password changed successfully"
    ));
})

// 6) get current user 
const getCurrentUser=asyncHandler(async(req,res)=>{
    return res.status(200).json(new ApiResponse(200,req.user,"current user fetched succesfully"));
})

// 7) updateUserDetails
const updateUserDetails=asyncHandler(async(req,res)=>{
    const {newfullname,newemail}=req.body;

    if(!newfullname || !newemail){
        throw ApiError(400,"username or email is missing");
    }
     
    const user=await User.findByIdAndUpdate(
        req.user._id,
         {
            $set:{
               fullname:newfullname,
               email:newemail
            }
         }, 
         {new:true}
         ).select("-password")
        return res.status(200).json(
            new ApiResponse(200,user,"User details updated successfully")
        )
})

// 8) update avatar
const updateAvatar=asyncHandler(async(req,res)=>{
    const avatarLocalPath=req.file?.path;

    if(!avatarLocalPath){
        throw ApiError(400,"Avatar file is missing");
    }

    const avatar=await uploadCloudinary(avatarLocalPath);

    if(!avatar.url){
        throw ApiError(400,"Error while uploading on avatar");
    }

    const user=await User.findByIdAndUpdate(
        req,user._id,
         {
            $set:{
               avatar:avatar.url
            }
         }, 
         {new:true}
         ).select("-password")
       return res
        .status(200)
        .json(
            new ApiResponse(200,user,"Avatar image updated successfully")
        )
})

//9) update coveriMage
const updatecoverImage=asyncHandler(async(req,res)=>{
    const avatarLocalPath=req.file?.path;

    if(!coverImageLocalPath){
        throw ApiError(400,"coverImage file is missing");
    }

    const coverImage=await uploadCloudinary(coverImageLocalPath);

    if(!coverImage.url){
        throw ApiError(400,"Error while uploading on avatar");
    }

    const user=await User.findByIdAndUpdate(
        req.user._id,
         {
            $set:{
               coverImage:coverImage.url
            }
         }, 
         {new:true}
         ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"coverImage updated successfully"));
})

// 10) get user channel profile

const getUserChannelProfile=asyncHandler(async(req,res)=>{
    const {username}=req.params;

    if(!username?.trim()){
        throw new ApiError(400,"username is missing");
    }

    // pipeline 
    const channel =await User.aggregate([
        {
            $match:{
                username: username?.toLowerCase()   
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"susbcribers"
            }
        },{
            $lookup:{
                from:" subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size:"$subscribers"
                },
                channelSubscribedToCount:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in: [req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else: false
                    }
                }

            }
        },
        {
            $project:{
                fullName:1,
                username:1,
                subscribersCount:1,
                channelsSubscribedTo:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                email:1
            }
        }
    ])
    if(!channel?.length){
        throw new ApiError(404,"Channel not found");
    }
    
     return res
     .status(200)
     .json(new ApiResponse(
        200,
        channel[0],
        "channel profile fetched successfully"
        ));
    
    
})

// 11) getWatchHistory
const getWatchHistory=asyncHandler(async(req,res)=>{
    const user=await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }

                ]
            }
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200,user[0].getWatchHistory,"Watch history fetched successfully"))
})
export {
    registerUser ,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserDetails,
    updateAvatar,
    updatecoverImage,
    getUserChannelProfile,
    getWatchHistory

 };
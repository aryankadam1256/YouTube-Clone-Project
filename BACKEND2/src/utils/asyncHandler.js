// // method -1 :- using async await
// const  asyncHandler=(fn)=>  async (req, res, next)=>{
//     try{ 
//       return  await fn(req, res, next);
//     }
//     catch(err){
//       res.status(err.code || 500).json
//       ({
//         success: false,
//         message: err.message
//     })

//     }
// }


// // method -2 :- using promise
// // const asyncHandler=(fn)=>{
// //    (req, res, next)=>{
// //        Promise.resolve().catch((err)=> next(err))
// //    }
// // }

const asyncHandler = (fn) => async (req, res, next) => {
  try {
    return await fn(req, res, next);
  } catch (err) {
//-    res.status(err.code || 500).json({
    const statusCode =
      typeof err.statusCode === "number"
        ? err.statusCode
        : typeof err.status === "number"
        ? err.status
        : err.code && Number.isInteger(err.code)
        ? err.code
        : 500;

    res.status(statusCode).json({
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV !== "production" && { stack: err.stack })
    });
  }
};

export default asyncHandler;
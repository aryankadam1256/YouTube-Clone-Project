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

// Wraps async route handlers and forwards any thrown error to Express's
// error-handling middleware via next(err) instead of responding directly.
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
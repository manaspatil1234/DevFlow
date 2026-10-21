import jwt from "jsonwebtoken"

const authenticate = (req,res,next)=>{
    try{

        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(401).json({
                status:false,
                message:"Authentication token required"
            })
        }

        const token = authHeader.split(" ")[1]

        const decoded = jwt.verify(token,process.env.JWT_SECRET);

        req.user = {id: decoded.userId}
        console.log("Authenticated user ID:", req.user.id);
        next()

    }catch(error){
        return res.status(401).json({
      status: false,
      message: "Invalid or expired token"
    });
  }
    }
export {authenticate}
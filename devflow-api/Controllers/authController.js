import { User } from "../models/associations.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
const register = async(req,res)=>{
    try{

        const {name,email,password} =req.body;

        if(typeof name!=="string"||
            !name.trim()||
            typeof email !== "string"||
            !email.trim()||
            typeof password !=="string"||
            password.length<8
        ){
            return res.status(400).json({
                status:false,
                message:"Name and Email are required; password must be at leadt 8 char"
            })
        }

        const normalizedEmail = email.trim().toLocaleLowerCase()

        const existingUser = await User.findOne({
            where:{email :normalizedEmail}
        })
        if(existingUser){
            return res.status(409).json({
                status:false,
                message:"Email is laready registered"
            })
        }

        const hashedPassword = await bcrypt.hash(password,12)

        const user = await User.create({
            name:name.trim(),
            email:normalizedEmail,
            password:hashedPassword
        })

        return res.status(201).json({
            status:true,
            message:"User registered successfully",
            user:{
                id:user.id, 
                name:user.name,
                email:user.email,
                createdAt:user.createdAt
            }

        })

    }catch(error){
        console.error("Register error:", error);

    // Handles a duplicate email if concurrent requests bypass the lookup
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        status: false,
        message: "Email is already registered"
      });
    }

    return res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  
    }
}

const login = async(req,res)=>{
    try{

        const {email,password}= req.body;
        if(typeof email !=="string"  ||
            !email.trim()||
            typeof password !=="string"||
            !password
        ){
            return res.status(400).json({
                status:false,
                message:"Email and password are required"
            })

        }
        const normalizedEmail = email.trim().toLocaleLowerCase();

        const user = await User.findOne({
            where:{email:normalizedEmail}
        })

        if(!user || !(await bcrypt.compare(password,user.password))){
            return res.status(401).json({
                status:false,
                message:"Invalid email or password"
            })
        }

        const token = jwt.sign(
            {userId:user.id},
            process.env.JWT_SECRET,
            {expiresIn:"1h"}
        )

        return res.status(200).json({
            status:true,
            message:"Login successful",
            token,
            user:{
                id:user.id,
                name:user.name,
                email:user.email
            }
        })

    }catch(error){
        console.error("Login error",error);
        return res.status(500).json({
            status:false,
            message:"Internal server error"
        })
    }
}

export {register,login}
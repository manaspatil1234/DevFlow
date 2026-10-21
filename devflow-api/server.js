import express from "express"
import { sequelize } from "./config/database.js"
import { Team } from "./models/Team.js"
import teamRoutes from "./Routes/teamRoutes.js"
import "./models/associations.js"
import projectRoutes from "./Routes/projectRoutes.js"
import {issueRoutes} from "./Routes/issueRoutes.js"
import { authRoutes } from "./Routes/authRoutes.js"
import commentRoutes from "./Routes/commentRoutes.js";
import teamMemberRoutes from "./Routes/teamMemberRoutes.js";

import cors from "cors"

const app=express()

app.use(cors({
    origin:"http://localhost:5173"
}))

app.use(express.json())

app.use("/api/projects",projectRoutes)

app.use("/api/teams",teamRoutes)

app.use("/api/issues",issueRoutes)

app.use("/api/auth", authRoutes);

app.use("/api/teams", teamMemberRoutes);

app.use("/api/issues",commentRoutes)

app.get('/',(req,res)=>{
    res.send('DevFlow API is running')
})

app.get('/api/health',(req,res)=>{
    return res.json({
        status:"ok",
        message:"DevFlow API is healthy"
    })
})

try{

await sequelize.authenticate();
console.log("PostgreSQL connected successfully")

await sequelize.sync()
console.log("Database models synchronized")

app.listen(8383,(req,res)=>{
    console.log(`Devflow is running on port 8383`)
})

}catch(error){
console.error("Database connection failed:", error.message);
  process.exit(1);
}

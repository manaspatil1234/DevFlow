import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Team = sequelize.define("Team",{

 name:{
        type:DataTypes.STRING,
        allowNull:false
},

  description:{
        type:DataTypes.TEXT,
        allowNull:true
}
})
export {Team}
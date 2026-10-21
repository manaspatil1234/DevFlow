import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Project = sequelize.define("Project",{
    name:{
        type:DataTypes.STRING,
        allowNull:false,
        validate:{
            notEmpty:true,
            len:[3,100]
        }
    },
    description:{
        type:DataTypes.TEXT,
        allowNull:true
    },
    status:{
        type:DataTypes.ENUM("planned","active","completed"),
        allowNull:false,
        defaultValue:"planned"
    }
})
export {Project}
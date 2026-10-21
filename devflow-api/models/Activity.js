import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Activity = sequelize.define("Activity",{
    action:{
        type:DataTypes.STRING,
        allowNull:false
    },
    description:{
        type:DataTypes.TEXT,
        allowNull:false
    },
    issueId:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    userId:{
        type:DataTypes.INTEGER,
        allowNull:false
    }
})

export {Activity}
import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Issue = sequelize.define("Issue",{
    title:{
        type:DataTypes.STRING,
        allowNull:false,
        validate:{
            notEmpty:true,
            len:[3,150]
        }
    },
    description:{
        type:DataTypes.TEXT,
        allowNull:true
    },
    type:{
        type:DataTypes.ENUM("bug","feature","task"),
        allowNull:false,
        defaultValue:"task"
    },
    status:{
        type:DataTypes.ENUM(
            "open",
            "in_progress",
            "in_review",
            "resolved"
        ),
        allowNull:false,
        defaultValue:"open"
    },
    priority:{
        type:DataTypes.ENUM("low","medium","high","critical"),
        allowNull:false,
        defaultValue:"medium"
    },
    dueDate:{
        type:DataTypes.DATEONLY,
        allowNull:true
    },
    createdById: {
  type: DataTypes.INTEGER,
  allowNull: true
},
assigneeId:{
    type:DataTypes.INTEGER,
    allowNull:true
}
})

export {Issue}
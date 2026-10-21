import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Comment = sequelize.define("Comment", {
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    issueId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

export { Comment };
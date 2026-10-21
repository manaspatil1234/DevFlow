import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const ProjectMember = sequelize.define("ProjectMember", {
    role: {
        type: DataTypes.ENUM("admin", "member"),
        allowNull: false,
        defaultValue: "member"
    }
});

export { ProjectMember };
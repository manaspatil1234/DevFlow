
import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const TeamMember = sequelize.define("TeamMember", {
  role: {
    type: DataTypes.ENUM("owner", "admin", "member"),
    allowNull: false,
    defaultValue: "member",
  },
});

export { TeamMember };

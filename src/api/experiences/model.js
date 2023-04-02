import { DataTypes } from "sequelize"
import sequelize from "../../db.js"
import UsersModel from "../users/model.js"

const experiencesSchema = sequelize.define(
  "post",
  {
    postId: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4, 
    },
    text: {
      type: DataTypes.STRING(50), 
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING(200), 
      allowNull: false,
    }
  },
);

export default model("Experience", experiencesSchema);

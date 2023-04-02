import { DataTypes } from "sequelize"
import sequelize from "../../db.js"
import UsersModel from "../users/model.js";

const CommentsModel = sequelize.define(
  "comment",
  {
    commentId: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4, 
    },
    comment: {
      type: DataTypes.STRING(200), 
      allowNull: false,
    }
  },
);

UsersModel.hasMany(CommentsModel, { foreignKey: { name: "userId", allowNull: false } })
CommentsModel.belongsTo(UsersModel, { foreignKey: { name: "userId", allowNull: false } })

export default CommentsModel

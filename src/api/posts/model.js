import { DataTypes } from "sequelize"
import sequelize from "../../db.js"
import UsersModel from "../users/model.js"
import CommentsModel from "../comments/model.js";


const PostsModel = sequelize.define(
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

UsersModel.hasMany(PostsModel, { foreignKey: { name: "userId", allowNull: false } })
PostsModel.belongsTo(UsersModel, { foreignKey: { name: "userId", allowNull: false } })

PostsModel.hasMany(CommentsModel, { foreignKey: { name: "postId", allowNull: false } })
CommentsModel.belongsTo(PostsModel, { foreignKey: { name: "postId", allowNull: false } })

export default PostsModel

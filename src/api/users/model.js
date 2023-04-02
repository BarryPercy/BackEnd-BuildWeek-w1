import { DataTypes } from "sequelize"
import sequelize from "../../db.js"


const UsersModel = sequelize.define(
  "user",
  {
    userId: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name:{
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    surname:{
      type: DataTypes.STRING(50), 
      allowNull: false,
    },
    email:{
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    bio:{
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    title:{
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    area:{
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    image:{
      type: DataTypes.STRING(200),
      allowNull: false,
    }
  },
);

export default UsersModel;
